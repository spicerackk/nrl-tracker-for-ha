"""Sensor platform for NRL Scores."""
from __future__ import annotations

import logging
from datetime import datetime

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
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
        is_home = (home_team == my_team)
        
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
            "league": "NRL",
            "league_logo": "https://www.nrl.com/.theme/nrl/badge.svg",
            "team_abbr": team_name[:3].upper() if team_name else "UNK",
            "team_name": team_name,
            "team_logo": f"https://www.nrl.com/.theme/{team_theme}/badge.svg",
            "team_score": team_score,
            "team_homeaway": "home" if is_home else "away",
            
            "opponent_abbr": opp_name[:3].upper() if opp_name else "UNK",
            "opponent_name": opp_name,
            "opponent_logo": f"https://www.nrl.com/.theme/{opp_theme}/badge.svg",
            "opponent_score": opp_score,
            
            "date": date_str,
            "venue": data.get("venue"),
            "location": data.get("venue"),
            "clock": data.get("game_time"),
            "quarter": data.get("match_state"),  # Maps things like HalfTime to the quarter field
            "round_fixtures": data.get("round_fixtures", []),
            "plays": data.get("plays", [])
        }
        
        return attrs
