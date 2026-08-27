import urllib.request
import re
import json

comps = {
    111: '[NRL]',
    161: '[NRLW]',
    116: '[Origin M]',
    156: '[Origin W]',
    119: '[Pre-Season]',
    133: '[Intl M]',
    135: '[Intl W]',
    131: '[RLWC M]',
    157: '[RLWC W]',
    195: '[Pac Champ M]',
    196: '[Pac Champ W]'
}

teams_dict = {}

for comp_id, prefix in comps.items():
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
                # Add to python dict string
                teams_dict[f"{prefix} {t['name']}"] = {'id': t['value'], 'comp': comp_id}
        except Exception as e:
            pass

print("TEAMS = {")
for k, v in teams_dict.items():
    print(f'    "{k}": {{"id": {v["id"]}, "comp": {v["comp"]}}},')
print("}")
