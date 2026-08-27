"""DataUpdateCoordinator for NRL Scores."""
from __future__ import annotations

import logging
from datetime import timedelta
import aiohttp
import async_timeout

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.config_entries import ConfigEntry

from .const import (
    DOMAIN,
    CONF_TEAM,
    CONF_TEAM_ID,
    COMPETITION_ID,
    SEASON,
    SCAN_INTERVAL_DEFAULT,
    SCAN_INTERVAL_LIVE,
    NRL_API_URL,
    MATCH_MODE_LIVE,
    MATCH_MODE_PRE,
    MATCH_MODE_POST
)

_LOGGER = logging.getLogger(__name__)

class NRLDataUpdateCoordinator(DataUpdateCoordinator):
    """Class to manage fetching NRL data."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Initialize."""
        self.entry = entry
        self.team_name = entry.data[CONF_TEAM]
        self.team_id = entry.data[CONF_TEAM_ID]
        self.update_interval = timedelta(seconds=SCAN_INTERVAL_DEFAULT)
        
        super().__init__(
            hass,
            _LOGGER,
            name=f"{DOMAIN}_{self.team_name}",
            update_interval=self.update_interval,
        )

    async def _async_update_data(self) -> dict:
        """Fetch data from NRL API."""
        competition = self.entry.data.get("comp_id", COMPETITION_ID)
        
        url = NRL_API_URL.format(
            competition=competition,
            season=SEASON,
            team_id=self.team_id
        )

        try:
            async with async_timeout.timeout(15):
                async with aiohttp.ClientSession() as session:
                    async with session.get(url) as response:
                        response.raise_for_status()
                        data = await response.json()
                        
                    # Now we need to parse data to find the active match
                    fixtures = data.get("fixtures", [])
                    if not fixtures:
                        return {}
                    
                    live_match = next((m for m in fixtures if m.get("matchMode") == MATCH_MODE_LIVE), None)
                    pre_match = next((m for m in fixtures if m.get("matchMode") == MATCH_MODE_PRE), None)
                    post_match = next((m for m in reversed(fixtures) if m.get("matchMode") == MATCH_MODE_POST), None)
                    match = live_match or pre_match or post_match
                    
                    round_fixtures_data = []
                    
                    if match:
                        round_title = match.get("roundTitle", "")
                        round_num = None
                        if "Round " in round_title:
                            try:
                                round_num = int(round_title.replace("Round ", ""))
                            except:
                                pass
                        
                        # Build URL for the round
                        round_url = f"https://www.nrl.com/draw/data?competition={competition}&season={SEASON}"
                        if round_num:
                            round_url += f"&round={round_num}"
                            
                        # Fetch round data
                        async with session.get(round_url) as round_resp:
                            round_resp.raise_for_status()
                            round_data = await round_resp.json()
                            round_fixtures_data = round_data.get("fixtures", [])
                            
                        # Fetch detailed match data for advanced plays
                        match_centre_url = match.get("matchCentreUrl")
                        detailed_data = {}
                        if match_centre_url:
                            detailed_url = f"https://www.nrl.com{match_centre_url}data"
                            try:
                                async with session.get(detailed_url) as detailed_resp:
                                    detailed_resp.raise_for_status()
                                    detailed_data = await detailed_resp.json()
                            except Exception as err:
                                _LOGGER.error(f"Error fetching detailed match data: {err}")
                                
                    return self._parse_data(match, round_fixtures_data, detailed_data)
        except Exception as err:
            raise UpdateFailed(f"Error communicating with API: {err}")

    def _parse_data(self, match: dict, round_fixtures_data: list, detailed_data: dict) -> dict:
        """Parse the NRL API JSON response."""
        if not match:
            return {}

        home_team_data = match.get("homeTeam", {})
        away_team_data = match.get("awayTeam", {})
        clock = match.get("clock", {})

        # Extract simplified fixture data for the whole round
        round_fixtures = []
        for f in round_fixtures_data:
            home = f.get("homeTeam", {})
            away = f.get("awayTeam", {})
            f_clock = f.get("clock", {})
            round_fixtures.append({
                "home_team": home.get("nickName", "Unknown"),
                "home_theme": home.get("theme", {}).get("key", "nrl"),
                "home_score": home.get("score", 0),
                "away_team": away.get("nickName", "Unknown"),
                "away_theme": away.get("theme", {}).get("key", "nrl"),
                "away_score": away.get("score", 0),
                "match_state": f.get("matchState", "Unknown"),
                "match_mode": f.get("matchMode", "Unknown"),
                "game_time": f_clock.get("gameTime"),
                "kick_off_time": f_clock.get("kickOffTimeLong"),
            })

        # Extract timeline plays
        plays = []
        timeline = detailed_data.get("timeline", [])
        
        # Build player dict
        players_dict = {}
        for p in detailed_data.get("homeTeam", {}).get("players", []):
            players_dict[p.get("playerId")] = p.get("firstName", "") + " " + p.get("lastName", "")
        for p in detailed_data.get("awayTeam", {}).get("players", []):
            players_dict[p.get("playerId")] = p.get("firstName", "") + " " + p.get("lastName", "")
            
        for t in timeline:
            play_type = t.get("type")
            title = t.get("title", "")
            if play_type in ["Try", "Goal", "SinBin"] or "Sin Bin" in title or "Penalty" in title:
                if play_type == "GoalMissed":
                    continue
                    
                player_name = players_dict.get(t.get("playerId"), "Unknown Player")
                team_id = t.get("teamId")
                team_name = home_team_data.get("nickName", "Unknown") if team_id == home_team_data.get("teamId") else away_team_data.get("nickName", "Unknown")
                
                game_seconds = t.get("gameSeconds", 0)
                minutes = game_seconds // 60
                
                play_icon = "T"
                play_class = "icon-try"
                
                if play_type == "Try":
                    play_icon = "T"
                    play_class = "icon-try"
                elif play_type == "Goal":
                    if "Penalty" in title:
                        play_icon = "P"
                        play_class = "icon-penalty"
                    else:
                        play_icon = "G"
                        play_class = "icon-goal"
                elif play_type == "SinBin" or "Sin Bin" in title:
                    play_icon = "SB"
                    play_class = "icon-sinbin"
                else:
                    if "Penalty" in title:
                        play_icon = "P"
                        play_class = "icon-penalty"
                    else:
                        continue
                    
                formatted_player = f"{player_name} ({title.split('-')[0]})" if play_type == "Goal" else player_name
                plays.append({
                    "time": f"{minutes}'",
                    "icon": play_icon,
                    "class": play_class,
                    "player": formatted_player,
                    "team": team_name,
                    "play_type": play_type,
                    "title": title
                })
        
        plays.reverse()

        parsed = {
            "match_mode": match.get("matchMode", "Unknown"),
            "match_state": match.get("matchState", "Unknown"),
            "home_team": home_team_data.get("nickName", "Unknown"),
            "away_team": away_team_data.get("nickName", "Unknown"),
            "home_theme": home_team_data.get("theme", {}).get("key", "nrl"),
            "away_theme": away_team_data.get("theme", {}).get("key", "nrl"),
            "home_score": home_team_data.get("score", 0),
            "away_score": away_team_data.get("score", 0),
            "venue": match.get("venue"),
            "round": match.get("roundTitle"),
            "kick_off_time": clock.get("kickOffTimeLong"),
            "game_time": clock.get("gameTime"),
            "round_fixtures": round_fixtures,
            "plays": plays,
        }
        
        # Determine if we should poll faster if a game is live
        if parsed.get("match_mode") == MATCH_MODE_LIVE:
            self.update_interval = timedelta(seconds=SCAN_INTERVAL_LIVE)
        else:
            self.update_interval = timedelta(seconds=SCAN_INTERVAL_DEFAULT)

        return parsed
