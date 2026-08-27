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

COMPETITIONS = {
    "111": "NRL Telstra Premiership",
    "161": "NRL Telstra Women's Premiership",
    "116": "State of Origin (Men)",
    "156": "State of Origin (Women)",
    "119": "Pre-Season Challenge",
    "133": "Internationals (Men)",
    "135": "Internationals (Women)",
    "131": "Rugby League World Cup (Men)",
    "157": "Rugby League World Cup (Women)",
    "195": "Pacific Championships (Men)",
    "196": "Pacific Championships (Women)"
}

TEAMS = {
    "111": {
        "Brisbane Broncos": 500011,
        "Canterbury-Bankstown Bulldogs": 500010,
        "North Queensland Cowboys": 500012,
        "The Dolphins": 500723,
        "St George Illawarra Dragons": 500022,
        "Parramatta Eels": 500031,
        "Newcastle Knights": 500003,
        "Penrith Panthers": 500014,
        "South Sydney Rabbitohs": 500005,
        "Canberra Raiders": 500013,
        "Sydney Roosters": 500001,
        "Manly Warringah Sea Eagles": 500002,
        "Cronulla-Sutherland Sharks": 500028,
        "Melbourne Storm": 500021,
        "Gold Coast Titans": 500004,
        "New Zealand Warriors": 500032,
        "Wests Tigers": 500023
    },
    "161": {
        "Brisbane Broncos (NRLW)": 500470,
        "Canterbury-Bankstown Bulldogs (NRLW)": 500904,
        "North Queensland Cowboys (NRLW)": 500787,
        "St George Illawarra Dragons (NRLW)": 500471,
        "Parramatta Eels (NRLW)": 500692,
        "Newcastle Knights (NRLW)": 500691,
        "Canberra Raiders (NRLW)": 500785,
        "Sydney Roosters (NRLW)": 500469,
        "Cronulla-Sutherland Sharks (NRLW)": 500786,
        "Gold Coast Titans (NRLW)": 500690,
        "New Zealand Warriors (NRLW)": 500472,
        "Wests Tigers (NRLW)": 500788
    },
    "116": {
        "New South Wales Blues": 500146,
        "Queensland Maroons": 500147
    },
    "156": {
        "New South Wales Sky Blues": 500315,
        "Queensland Maroons (Women)": 500314
    },
    "119": {
        "Brisbane Broncos": 500011,
        "Canterbury-Bankstown Bulldogs": 500010,
        "North Queensland Cowboys": 500012,
        "The Dolphins": 500723,
        "St George Illawarra Dragons": 500022,
        "Parramatta Eels": 500031,
        "Newcastle Knights": 500003,
        "Penrith Panthers": 500014,
        "South Sydney Rabbitohs": 500005,
        "Canberra Raiders": 500013,
        "Sydney Roosters": 500001,
        "Manly Warringah Sea Eagles": 500002,
        "Cronulla-Sutherland Sharks": 500028,
        "Melbourne Storm": 500021,
        "Gold Coast Titans": 500004,
        "New Zealand Warriors": 500032,
        "Wests Tigers": 500023
    },
    "133": {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "England": 500201,
        "Australian PM XIII": 500317,
        "PNG PM XIII": 500316,
        "Cook Islands Aitu": 500340,
        "Rhinos": 500543
    },
    "135": {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "England (Women)": 500369,
        "Papua New Guinea Orchids": 500370,
        "Samoa (Women)": 500526
    },
    "131": {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "England": 500201,
        "Samoa": 500159,
        "Tonga": 500214,
        "Fiji": 500158,
        "Papua New Guinea": 500213,
        "Lebanon": 500341,
        "France": 500319,
        "Cook Islands": 500340
    },
    "157": {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "England (Women)": 500369,
        "Papua New Guinea Orchids": 500370,
        "Samoa (Women)": 500526,
        "Fiji (Women)": 500527,
        "France (Women)": 500697,
        "Wales (Women)": 500681
    },
    "195": {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "Toa Samoa": 500159,
        "Tonga XIII": 500214,
        "Fiji Bati": 500158,
        "PNG Kumuls": 500213,
        "Cook Islands Aitu": 500340
    },
    "196": {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "Fetu Samoa": 500526,
        "Tonga XIII (Women)": 500726,
        "PNG Orchids": 500370,
        "Cook Islands Moana": 500371
    }
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
