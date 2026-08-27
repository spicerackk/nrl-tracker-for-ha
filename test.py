import urllib.request
import re

url = 'https://www.nrl.com/draw/'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    match = re.search(r'.{0,50}filterTeams.{0,200}', html)
    if match:
        print(match.group(0))
except Exception as e:
    print(f"Error: {e}")
