"""Sensor platform for NRL Scores."""
from __future__ import annotations

import logging
from datetime import datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import NRLDataUpdateCoordinator

_LOGGER = logging.getLogger(__name__)

async def async_setup_entry(
    hass: HomeAssistant, entry: ConfigEntry, async_add_entities: AddEntitiesCallback
) -> None:
    """Set up the sensor platform."""
    coordinator: NRLDataUpdateCoordinator = hass.data[DOMAIN][entry.entry_id]

    async_add_entities([NRLScoreSensor(coordinator, entry)])

class NRLScoreSensor(CoordinatorEntity[NRLDataUpdateCoordinator], SensorEntity):
    """Representation of a NRL Score Sensor compatible with ha-teamtracker cards."""

    def __init__(self, coordinator: NRLDataUpdateCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self.entry = entry
        self._attr_name = f"NRL {coordinator.team_name}"
        self._attr_unique_id = f"{entry.entry_id}_score"
        self._attr_icon = "mdi:rugby"

    @property
    def native_value(self) -> str | None:
        """Return the state of the sensor (PRE, IN, POST, NOT_FOUND)."""
        if not self.coordinator.data:
            return "NOT_FOUND"
        
        mode = self.coordinator.data.get("match_mode", "")
        if mode == "Pre":
            return "PRE"
        elif mode == "Live":
            return "IN"
        elif mode == "Post":
            return "POST"
        
        return "NOT_FOUND"

    @property
    def extra_state_attributes(self) -> dict:
        """Return ha-teamtracker compatible state attributes."""
        if not self.coordinator.data:
            return {}
            
        data = self.coordinator.data
        my_team = self.coordinator.team_name
        
        # Determine if my team is home or away
        home_team = data.get("home_team")
        away_team = data.get("away_team")
        is_home = False
        if home_team and my_team:
            is_home = (home_team in my_team or my_team in home_team)
        
        if is_home:
            team_name = home_team
            team_score = data.get("home_score")
            team_theme = data.get("home_theme", "nrl")
            opp_name = away_team
            opp_score = data.get("away_score")
            opp_theme = data.get("away_theme", "nrl")
        else:
            team_name = away_team
            team_score = data.get("away_score")
            team_theme = data.get("away_theme", "nrl")
            opp_name = home_team
            opp_score = data.get("home_score")
            opp_theme = data.get("home_theme", "nrl")
            
        # Parse kickoff for kickoff_in logic (Optional but good for frontend)
        date_str = data.get("kick_off_time")
        
        attrs = {
            "team_abbr": my_team[:3].upper() if my_team else "UNK",
            "opponent_abbr": opp_name[:3].upper() if opp_name else "UNK",
            "date": data.get("kick_off_time"),
            "kickoff_in": data.get("kick_off_time"),
            "venue": data.get("venue"),
            "location": data.get("venue_city"),
            "home_team": home_team,
            "away_team": away_team,
            "home_score": data.get("home_score"),
            "away_score": data.get("away_score"),
            "home_theme": data.get("home_theme"),
            "away_theme": data.get("away_theme"),
            "team_score": data.get("my_team_score"),
            "opponent_score": data.get("opponent_score"),
            "team_homeaway": "home" if is_home else "away",
            "opponent_homeaway": "away" if is_home else "home",
            "team_logo": "https://www.nrl.com/theme/nrl/logos/badge-" + (data.get("home_theme") or "nrl") + ".svg" if is_home else "https://www.nrl.com/theme/nrl/logos/badge-" + (data.get("away_theme") or "nrl") + ".svg",
            "opponent_logo": "https://www.nrl.com/theme/nrl/logos/badge-" + (data.get("away_theme") or "nrl") + ".svg" if is_home else "https://www.nrl.com/theme/nrl/logos/badge-" + (data.get("home_theme") or "nrl") + ".svg",
            "quarter": data.get("match_state"),
            "clock": data.get("game_time"),
            "league": "NRL",
            "round": data.get("round"),
            "round_fixtures": data.get("round_fixtures", []),
            "plays": data.get("plays", []),
            
            # New Advanced Stats & Ladder Data
            "possession": data.get("possession"),
            "completion_rate": data.get("completion_rate"),
            "ladder_position": data.get("ladder_position"),
            "team_form": data.get("team_form"),
            "ladder": data.get("ladder", [])
        }
        return attrs

    @callback
    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        if self.coordinator.data:
            new_score = self.coordinator.data.get("my_team_score")
            new_opp_score = self.coordinator.data.get("opponent_score")
            new_state = self.coordinator.data.get("match_state")
            
            old_score = getattr(self, "_last_my_score", None)
            old_opp_score = getattr(self, "_last_opp_score", None)
            
            if old_score is not None and old_opp_score is not None:
                if new_score != old_score or new_opp_score != old_opp_score:
                    self.hass.bus.async_fire("nrl_score_update", {
                        "team": self.coordinator.team_name,
                        "team_score": new_score,
                        "opponent_score": new_opp_score,
                        "home_team": self.coordinator.data.get("home_team"),
                        "away_team": self.coordinator.data.get("away_team"),
                    })
                    
            old_state = getattr(self, "_last_match_state", None)
            if old_state is not None and new_state != old_state:
                self.hass.bus.async_fire("nrl_match_state_change", {
                    "team": self.coordinator.team_name,
                    "old_state": old_state,
                    "new_state": new_state,
                })
                
            self._last_my_score = new_score
            self._last_opp_score = new_opp_score
            self._last_match_state = new_state
            
        super()._handle_coordinator_update()
