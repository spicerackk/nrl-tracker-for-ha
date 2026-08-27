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
    "[NRL] Broncos": {"id": 500011, "comp": 111},
    "[NRL] Bulldogs": {"id": 500010, "comp": 111},
    "[NRL] Cowboys": {"id": 500012, "comp": 111},
    "[NRL] Dolphins": {"id": 500723, "comp": 111},
    "[NRL] Dragons": {"id": 500022, "comp": 111},
    "[NRL] Eels": {"id": 500031, "comp": 111},
    "[NRL] Knights": {"id": 500003, "comp": 111},
    "[NRL] Panthers": {"id": 500014, "comp": 111},
    "[NRL] Rabbitohs": {"id": 500005, "comp": 111},
    "[NRL] Raiders": {"id": 500013, "comp": 111},
    "[NRL] Roosters": {"id": 500001, "comp": 111},
    "[NRL] Sea Eagles": {"id": 500002, "comp": 111},
    "[NRL] Sharks": {"id": 500028, "comp": 111},
    "[NRL] Storm": {"id": 500021, "comp": 111},
    "[NRL] Titans": {"id": 500004, "comp": 111},
    "[NRL] Warriors": {"id": 500032, "comp": 111},
    "[NRL] Wests Tigers": {"id": 500023, "comp": 111},
    "[NRLW] Broncos": {"id": 500470, "comp": 161},
    "[NRLW] Bulldogs": {"id": 500904, "comp": 161},
    "[NRLW] Cowboys": {"id": 500787, "comp": 161},
    "[NRLW] Dragons": {"id": 500471, "comp": 161},
    "[NRLW] Eels": {"id": 500692, "comp": 161},
    "[NRLW] Knights": {"id": 500691, "comp": 161},
    "[NRLW] Raiders": {"id": 500785, "comp": 161},
    "[NRLW] Roosters": {"id": 500469, "comp": 161},
    "[NRLW] Sharks": {"id": 500786, "comp": 161},
    "[NRLW] Titans": {"id": 500690, "comp": 161},
    "[NRLW] Warriors": {"id": 500472, "comp": 161},
    "[NRLW] Wests Tigers": {"id": 500788, "comp": 161},
    "[Origin M] NSW Blues": {"id": 500146, "comp": 116},
    "[Origin M] QLD Maroons": {"id": 500147, "comp": 116},
    "[Origin W] NSW Sky Blues": {"id": 500315, "comp": 156},
    "[Origin W] QLD Maroons": {"id": 500314, "comp": 156},
    "[Pre-Season] Broncos": {"id": 500011, "comp": 119},
    "[Pre-Season] Bulldogs": {"id": 500010, "comp": 119},
    "[Pre-Season] Cowboys": {"id": 500012, "comp": 119},
    "[Pre-Season] Dolphins": {"id": 500723, "comp": 119},
    "[Pre-Season] Dragons": {"id": 500022, "comp": 119},
    "[Pre-Season] Eels": {"id": 500031, "comp": 119},
    "[Pre-Season] Knights": {"id": 500003, "comp": 119},
    "[Pre-Season] Panthers": {"id": 500014, "comp": 119},
    "[Pre-Season] Rabbitohs": {"id": 500005, "comp": 119},
    "[Pre-Season] Raiders": {"id": 500013, "comp": 119},
    "[Pre-Season] Roosters": {"id": 500001, "comp": 119},
    "[Pre-Season] Sea Eagles": {"id": 500002, "comp": 119},
    "[Pre-Season] Sharks": {"id": 500028, "comp": 119},
    "[Pre-Season] Storm": {"id": 500021, "comp": 119},
    "[Pre-Season] Titans": {"id": 500004, "comp": 119},
    "[Pre-Season] Warriors": {"id": 500032, "comp": 119},
    "[Pre-Season] Wests Tigers": {"id": 500023, "comp": 119},
    "[Intl M] AUS PM XIII": {"id": 500317, "comp": 133},
    "[Intl M] Cook Islands Aitu": {"id": 500340, "comp": 133},
    "[Intl M] England": {"id": 500201, "comp": 133},
    "[Intl M] Kangaroos": {"id": 500149, "comp": 133},
    "[Intl M] PNG PM XIII": {"id": 500316, "comp": 133},
    "[Intl M] Rhinos": {"id": 500543, "comp": 133},
    "[RLWC M] Australia": {"id": 500149, "comp": 131},
    "[RLWC M] Cook Islands": {"id": 500340, "comp": 131},
    "[RLWC M] England": {"id": 500201, "comp": 131},
    "[RLWC M] Fiji": {"id": 500158, "comp": 131},
    "[RLWC M] France": {"id": 500319, "comp": 131},
    "[RLWC M] Lebanon": {"id": 500341, "comp": 131},
    "[RLWC M] New Zealand": {"id": 500150, "comp": 131},
    "[RLWC M] Papua New Guinea": {"id": 500213, "comp": 131},
    "[RLWC M] Samoa": {"id": 500159, "comp": 131},
    "[RLWC M] Tonga": {"id": 500214, "comp": 131},
    "[RLWC W] Australia": {"id": 500216, "comp": 157},
    "[RLWC W] England": {"id": 500369, "comp": 157},
    "[RLWC W] Fiji": {"id": 500527, "comp": 157},
    "[RLWC W] France": {"id": 500697, "comp": 157},
    "[RLWC W] New Zealand": {"id": 500217, "comp": 157},
    "[RLWC W] Papua New Guinea": {"id": 500370, "comp": 157},
    "[RLWC W] Samoa": {"id": 500526, "comp": 157},
    "[RLWC W] Wales": {"id": 500681, "comp": 157},
    "[Pac Champ M] Cook Islands Aitu": {"id": 500340, "comp": 195},
    "[Pac Champ M] Fiji Bati": {"id": 500158, "comp": 195},
    "[Pac Champ M] Kiwis": {"id": 500150, "comp": 195},
    "[Pac Champ M] PNG Kumuls": {"id": 500213, "comp": 195},
    "[Pac Champ M] Toa Samoa": {"id": 500159, "comp": 195},
    "[Pac Champ M] Tonga XIII": {"id": 500214, "comp": 195},
    "[Pac Champ W] Cook Islands Moana": {"id": 500371, "comp": 196},
    "[Pac Champ W] Fetu Samoa": {"id": 500526, "comp": 196},
    "[Pac Champ W] Jillaroos": {"id": 500216, "comp": 196},
    "[Pac Champ W] Kiwi Ferns": {"id": 500217, "comp": 196},
    "[Pac Champ W] PNG Orchids": {"id": 500370, "comp": 196},
    "[Pac Champ W] Tonga XIII": {"id": 500726, "comp": 196}
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
