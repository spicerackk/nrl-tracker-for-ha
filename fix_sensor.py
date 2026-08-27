import re
with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\sensor.py', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"opponent_abbr": opponent[:3].upper(),', '"opponent_abbr": opp_name[:3].upper() if opp_name else "UNK",')
content = content.replace('"team_abbr": my_team[:3].upper(),', '"team_abbr": my_team[:3].upper() if my_team else "UNK",')

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\sensor.py', 'w', encoding='utf-8') as f:
    f.write(content)
