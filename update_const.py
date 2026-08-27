import json

COMPETITIONS = {
    111: "NRL Telstra Premiership",
    161: "NRL Telstra Women's Premiership",
    116: "State of Origin (Men)",
    156: "State of Origin (Women)",
    119: "Pre-Season Challenge",
    133: "Internationals (Men)",
    135: "Internationals (Women)",
    131: "Rugby League World Cup (Men)",
    157: "Rugby League World Cup (Women)",
    195: "Pacific Championships (Men)",
    196: "Pacific Championships (Women)"
}

TEAMS = {
    111: {
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
        "Wests Tigers": 500023,
    },
    161: {
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
        "Wests Tigers (NRLW)": 500788,
    },
    116: {
        "New South Wales Blues": 500146,
        "Queensland Maroons": 500147,
    },
    156: {
        "New South Wales Sky Blues": 500315,
        "Queensland Maroons (Women)": 500314,
    },
    119: {
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
        "Wests Tigers": 500023,
    },
    133: {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "England": 500201,
        "Australian PM XIII": 500317,
        "PNG PM XIII": 500316,
        "Cook Islands Aitu": 500340,
        "Rhinos": 500543,
    },
    135: {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "England (Women)": 500369,
        "Papua New Guinea Orchids": 500370,
        "Samoa (Women)": 500526,
    },
    131: {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "England": 500201,
        "Samoa": 500159,
        "Tonga": 500214,
        "Fiji": 500158,
        "Papua New Guinea": 500213,
        "Lebanon": 500341,
        "France": 500319,
        "Cook Islands": 500340,
    },
    157: {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "England (Women)": 500369,
        "Papua New Guinea Orchids": 500370,
        "Samoa (Women)": 500526,
        "Fiji (Women)": 500527,
        "France (Women)": 500697,
        "Wales (Women)": 500681,
    },
    195: {
        "Australian Kangaroos": 500149,
        "New Zealand Kiwis": 500150,
        "Toa Samoa": 500159,
        "Tonga XIII": 500214,
        "Fiji Bati": 500158,
        "PNG Kumuls": 500213,
        "Cook Islands Aitu": 500340,
    },
    196: {
        "Australian Jillaroos": 500216,
        "New Zealand Kiwi Ferns": 500217,
        "Fetu Samoa": 500526,
        "Tonga XIII (Women)": 500726,
        "PNG Orchids": 500370,
        "Cook Islands Moana": 500371,
    }
}

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\const.py', 'r', encoding='utf-8') as f:
    content = f.read()

import re
# Remove the old TEAMS dict
content = re.sub(r'TEAMS: dict\[str, dict\[str, int\]\] = \{.*?\}\n', '', content, flags=re.DOTALL)

# Create the new code
new_code = "COMPETITIONS = " + json.dumps(COMPETITIONS, indent=4) + "\n\n"
new_code += "TEAMS = " + json.dumps(TEAMS, indent=4) + "\n"

# Insert it before MATCH_MODE_PRE
content = content.replace('# Match modes returned by NRL API', new_code + '\n# Match modes returned by NRL API')

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\const.py', 'w', encoding='utf-8') as f:
    f.write(content)
