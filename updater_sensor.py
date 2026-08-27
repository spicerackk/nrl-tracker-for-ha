import re

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\sensor.py', 'r', encoding='utf-8') as f:
    sensor = f.read()

# Add core callback import
if 'from homeassistant.core import callback' not in sensor:
    sensor = sensor.replace('from homeassistant.core import HomeAssistant', 'from homeassistant.core import HomeAssistant, callback')

# Add _handle_coordinator_update method
handle_code = '''
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
'''

if '_handle_coordinator_update' not in sensor:
    sensor += handle_code

# Also add the new stats to extra_state_attributes
attrs_code = '''
        attrs = {
            "team_abbr": my_team[:3].upper(),
            "opponent_abbr": opponent[:3].upper(),
            "date": data.get("kick_off_time"),
            "kickoff_in": data.get("kick_off_time"),
            "venue": data.get("venue"),
            "location": data.get("venue_city"),
            "home_team": home_team,
            "away_team": away_team,
            "home_score": home_score,
            "away_score": away_score,
            "team_score": data.get("my_team_score"),
            "opponent_score": data.get("opponent_score"),
            "team_homeaway": "home" if is_home else "away",
            "opponent_homeaway": "away" if is_home else "home",
            "team_logo": "https://www.nrl.com/theme/nrl/logos/badge-" + data.get("home_theme", "nrl") + ".svg" if is_home else "https://www.nrl.com/theme/nrl/logos/badge-" + data.get("away_theme", "nrl") + ".svg",
            "opponent_logo": "https://www.nrl.com/theme/nrl/logos/badge-" + data.get("away_theme", "nrl") + ".svg" if is_home else "https://www.nrl.com/theme/nrl/logos/badge-" + data.get("home_theme", "nrl") + ".svg",
            "quarter": data.get("match_state"),
            "clock": data.get("game_time"),
            "league": "NRL",
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
'''
sensor = re.sub(r'attrs = \{.*?return attrs', attrs_code.strip(), sensor, flags=re.DOTALL)

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\sensor.py', 'w', encoding='utf-8') as f:
    f.write(sensor)
