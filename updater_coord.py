import re

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\coordinator.py', 'r', encoding='utf-8') as f:
    coord = f.read()

# Add ladder fetching
ladder_code = '''
                        # Fetch ladder data
                        ladder_url = f"https://www.nrl.com/ladder/data?competition={competition}"
                        ladder_data = {}
                        try:
                            async with session.get(ladder_url) as ladder_resp:
                                ladder_resp.raise_for_status()
                                ladder_data = await ladder_resp.json()
                        except Exception as err:
                            _LOGGER.error(f"Error fetching ladder data: {err}")
                            
                    return self._parse_data(match, round_fixtures_data, detailed_data, ladder_data)
'''
# Replace the end of _async_update_data
coord = re.sub(r'return self\._parse_data\(match, round_fixtures_data, detailed_data\)', ladder_code.strip(), coord)

# Update _parse_data signature
coord = coord.replace('def _parse_data(self, match: dict, round_fixtures_data: list, detailed_data: dict) -> dict:', 'def _parse_data(self, match: dict, round_fixtures_data: list, detailed_data: dict, ladder_data: dict = None) -> dict:')

# Add the extraction logic inside _parse_data
extract_code = '''
        # Extract advanced stats
        possession = None
        completion_rate = None
        stats_groups = detailed_data.get("stats", {}).get("groups", [])
        for group in stats_groups:
            if group.get("title") == "Possession & Completions":
                for stat in group.get("stats", []):
                    if stat.get("title") == "Possession %":
                        is_home = (home_team_data.get("teamId") == self.team_id)
                        val = stat.get("homeValue" if is_home else "awayValue", {}).get("value")
                        if val is not None: possession = val
                    elif stat.get("title") == "Completion Rate":
                        is_home = (home_team_data.get("teamId") == self.team_id)
                        val = stat.get("homeValue" if is_home else "awayValue", {}).get("value")
                        if val is not None: completion_rate = val

        # Extract ladder position and form
        ladder_position = None
        team_form = None
        ladder_out = []
        if ladder_data:
            ladder_positions = ladder_data.get("positions", [])
            for idx, pos in enumerate(ladder_positions):
                team_nick = pos.get("teamNickname")
                pos_data = {
                    "position": idx + 1,
                    "team": team_nick,
                    "points": pos.get("stats", {}).get("points"),
                    "played": pos.get("stats", {}).get("played"),
                    "wins": pos.get("stats", {}).get("wins"),
                    "drawn": pos.get("stats", {}).get("drawn"),
                    "lost": pos.get("stats", {}).get("lost"),
                    "diff": pos.get("stats", {}).get("points difference"),
                    "logo": "https://www.nrl.com/theme/nrl/logos/badge-" + pos.get("theme", {}).get("key", "nrl") + ".svg"
                }
                ladder_out.append(pos_data)
                
                # Check if it's our team
                if str(pos.get("next", {}).get("teamId")) == str(self.team_id) or team_nick in self.team_name:
                    ladder_position = idx + 1
                    team_form = pos.get("stats", {}).get("form")

        return {
            "my_team_score": my_team_score,
            "opponent_score": opponent_score,
            "home_team": home_team_name,
            "away_team": away_team_name,
            "home_score": home_team_score,
            "away_score": away_team_score,
            "home_theme": home_theme,
            "away_theme": away_theme,
            "match_state": match_state,
            "match_mode": match_mode,
            "game_time": game_time,
            "kick_off_time": kick_off_time,
            "venue": match.get("venue", ""),
            "venue_city": match.get("venueCity", ""),
            "round_fixtures": round_fixtures,
            "plays": plays,
            "possession": possession,
            "completion_rate": completion_rate,
            "ladder_position": ladder_position,
            "team_form": team_form,
            "ladder": ladder_out,
        }
'''
coord = re.sub(r'return \{.*?\}', extract_code.strip(), coord, flags=re.DOTALL)

with open('D:\\HA-Gemini\\nrl_tracker_for_ha\\custom_components\\nrl_scores\\coordinator.py', 'w', encoding='utf-8') as f:
    f.write(coord)
