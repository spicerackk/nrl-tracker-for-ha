import urllib.request
import re
import json

def get_teams(comp_id):
    url = f'https://www.nrl.com/draw/?competition={comp_id}'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'\"filterTeams\":\s*(\[.*?\])', html)
    if not match:
        match = re.search(r'&quot;filterTeams&quot;:(\[.*?\])', html)
    
    if match:
        data = match.group(1).replace('&quot;', '"')
        try:
            teams = json.loads(data)
            for t in teams:
                print(f"    '{t['name']}': {{'id': {t['value']}, 'comp': {comp_id}}},")
        except Exception as e:
            print("Error parsing json")

print("# RLWC (131)")
get_teams(131)
print("# WRLWC (157)")
get_teams(157)
print("# W Intl (135)")
get_teams(135)
print("# Pre-season (119)")
get_teams(119)
print("# Pac Champ W (196)")
get_teams(196)
