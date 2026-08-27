"""Constants for NRL Scores integration."""
from __future__ import annotations

DOMAIN = "nrl_scores"
COMPETITION_ID = 111
SEASON = 2026

CONF_TEAM = "team"
CONF_TEAM_ID = "team_id"

SCAN_INTERVAL_DEFAULT = 60   # seconds
SCAN_INTERVAL_LIVE = 30      # seconds during active game

NRL_API_URL = (
    "https://www.nrl.com/draw/data"
    "?competition={competition}&season={season}&team={team_id}"
)
NRL_BASE_URL = "https://www.nrl.com"

TEAMS: dict[str, dict[str, int]] = {
    # NRL
    "Broncos": {"id": 500011, "comp": 111},
    "Bulldogs": {"id": 500010, "comp": 111},
    "Cowboys": {"id": 500012, "comp": 111},
    "Dolphins": {"id": 500723, "comp": 111},
    "Dragons": {"id": 500022, "comp": 111},
    "Eels": {"id": 500031, "comp": 111},
    "Knights": {"id": 500003, "comp": 111},
    "Panthers": {"id": 500014, "comp": 111},
    "Rabbitohs": {"id": 500005, "comp": 111},
    "Raiders": {"id": 500013, "comp": 111},
    "Roosters": {"id": 500001, "comp": 111},
    "Sea Eagles": {"id": 500002, "comp": 111},
    "Sharks": {"id": 500028, "comp": 111},
    "Storm": {"id": 500021, "comp": 111},
    "Titans": {"id": 500004, "comp": 111},
    "Warriors": {"id": 500032, "comp": 111},
    "Wests Tigers": {"id": 500023, "comp": 111},
    
    # NRLW
    "Broncos (NRLW)": {"id": 500470, "comp": 161},
    "Bulldogs (NRLW)": {"id": 500904, "comp": 161},
    "Cowboys (NRLW)": {"id": 500787, "comp": 161},
    "Dragons (NRLW)": {"id": 500471, "comp": 161},
    "Eels (NRLW)": {"id": 500692, "comp": 161},
    "Knights (NRLW)": {"id": 500691, "comp": 161},
    "Raiders (NRLW)": {"id": 500785, "comp": 161},
    "Roosters (NRLW)": {"id": 500469, "comp": 161},
    "Sharks (NRLW)": {"id": 500786, "comp": 161},
    "Titans (NRLW)": {"id": 500690, "comp": 161},
    "Warriors (NRLW)": {"id": 500472, "comp": 161},
    "Wests Tigers (NRLW)": {"id": 500788, "comp": 161},
    
    # State of Origin
    "NSW Blues": {"id": 500146, "comp": 116},
    "QLD Maroons": {"id": 500147, "comp": 116},
    
    # Women's State of Origin
    "NSW Blues (Women's)": {"id": 500315, "comp": 156},
    "QLD Maroons (Women's)": {"id": 500314, "comp": 156},
    
    # Internationals
    "Kangaroos": {"id": 500115, "comp": 133},
}

# Match modes returned by NRL API
MATCH_MODE_PRE = "Pre"
MATCH_MODE_LIVE = "Live"
MATCH_MODE_POST = "Post"

# Match states
MATCH_STATE_UPCOMING = "Upcoming"
MATCH_STATE_IN_PROGRESS = "InProgress"
MATCH_STATE_HALF_TIME = "HalfTime"
MATCH_STATE_FULL_TIME = "FullTime"

# Sensor type keys
SENSOR_SCORE = "score"
SENSOR_STATE = "match_state"
SENSOR_GAME_TIME = "game_time"
SENSOR_NEXT_MATCH = "next_match"
SENSOR_MY_SCORE = "my_score"

# Attribute names
ATTR_HOME_TEAM = "home_team"
ATTR_AWAY_TEAM = "away_team"
ATTR_HOME_SCORE = "home_score"
ATTR_AWAY_SCORE = "away_score"
ATTR_MATCH_STATE = "match_state"
ATTR_MATCH_MODE = "match_mode"
ATTR_ROUND = "round"
ATTR_VENUE = "venue"
ATTR_VENUE_CITY = "venue_city"
ATTR_KICK_OFF_TIME = "kick_off_time"
ATTR_GAME_TIME = "game_time"
ATTR_MATCH_URL = "match_url"
ATTR_IS_HOME_GAME = "is_home_game"
ATTR_MY_TEAM_SCORE = "my_team_score"
ATTR_OPPONENT = "opponent"
ATTR_OPPONENT_SCORE = "opponent_score"
ATTR_RESULT = "result"
