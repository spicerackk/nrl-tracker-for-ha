# NRL Scores Integration for Home Assistant

This is a custom integration for Home Assistant that pulls live scores, match states, and data from the official NRL API. It supports tracking teams across the NRL, NRLW, State of Origin, and International test matches.

## Compatibility with Compact Team Tracker Card
This integration has been explicitly designed to output sensor attributes that are 100% compatible with the popular [Compact Team Tracker Card](https://github.com/vasqued2/ha-teamtracker) and standard `ha-teamtracker` lovelace cards. 

It natively supports mapping Home/Away status, fetching official SVG team logos, and translating match states into standard `PRE`, `IN`, and `POST` states.

## Installation via HACS

1. Open HACS in your Home Assistant instance.
2. Go to **Integrations**.
3. Click the three dots in the top right corner and select **Custom repositories**.
4. Add the URL of this repository and select **Integration** as the category.
5. Search for "NRL Scores" in HACS, install it, and restart Home Assistant.

## Configuration

Once installed and restarted:
1. Go to **Settings** > **Devices & Services**.
2. Click **Add Integration** and search for **NRL Scores**.
3. Select the team you wish to track from the dropdown.

*Note: You can add the integration multiple times to track multiple teams (e.g., your favorite NRL team, your favorite NRLW team, and your State of Origin team).*

## Sensor Example
Your sensor will be created as `sensor.nrl_broncos` (depending on the team selected).
It will contain attributes like `team_score`, `opponent_score`, `team_logo`, `kickoff_in`, `date`, `venue`, and more.
