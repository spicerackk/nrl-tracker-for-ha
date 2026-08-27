# NRL Scores Integration & Custom Card

A Home Assistant custom integration and companion Lovelace card for tracking NRL matches, scores, and advanced plays (tries, penalties, conversions).

## Features

- **Real-time Scores:** Follows your favorite team and updates scores live.
- **Multi-Competition Support:** Track over 60 teams across the **NRL**, **NRLW**, **State of Origin (Men & Women)**, **Pacific Championships**, **World Cup**, and **Internationals**. Add the integration multiple times to track multiple teams!
- **Companion Lovelace Card:** A beautiful, responsive custom card that displays the match state, team logos, and live clock.
- **Live Advanced Plays:** Click the card to expand a detailed view streaming live tries, penalty goals, conversions, and sin bins directly from the NRL Match Centre.
- **Compatibility:** Sensor attributes are compatible with standard `ha-teamtracker` lovelace cards.
- **Consolidated Repository:** Both the backend integration and frontend card are bundled in this single repository for easy installation.

## Installation via HACS

1. Open HACS in your Home Assistant instance.
2. Go to **Integrations**.
3. Click the three dots in the top right corner and select **Custom repositories**.
4. Add the URL of this repository (`https://github.com/spicerackk/nrl-tracker-for-ha`) and select **Integration** as the category.
5. Search for "NRL Scores" in HACS, click **Install**, and restart Home Assistant.

## Configuration

Once installed and you have restarted Home Assistant:
1. Go to **Settings** > **Devices & Services**.
2. Click **Add Integration** and search for **NRL Scores**.
3. Select the team you wish to track from the dropdown.

*Note: The integration MUST be added here for the custom Lovelace card to work, because setting it up activates the background server that hosts the card's JavaScript file!*

## Setting up the Frontend Card

When the integration is set up, it serves the custom card files. Tell Lovelace where to find them:

1. Go to **Settings** > **Dashboards** > **Three dots (top right)** > **Resources**.
   *(If you don't see Resources, ensure Advanced Mode is enabled in your user profile).*
2. Click **Add Resource**.
3. Enter the URL: `/nrl_scores_frontend/nrl-score-card.js?v=1.1` *(Adding the `?v=1.1` forces your browser to bypass cache and download it)*.
4. Select **JavaScript Module** as the Resource type.
5. Click **Create**.
6. **Refresh your browser window (Ctrl+F5)**.

## Usage & Customization

Now you can add the card to your dashboard!

1. Edit your dashboard and click **Add Card**.
2. Scroll down to the bottom and select **Custom: NRL Score Card** (or use the visual editor).
3. Select your team sensor (e.g., `sensor.nrl_broncos`) from the dropdown.
4. **Customize View:** Use the toggles in the visual editor to choose whether the advanced details are expanded automatically, and select exactly which event types you want to see (Try Scorers, Sin Bins, Penalty Goals, and Conversions).
5. Save and enjoy! You can always click on the card to manually expand/collapse the advanced plays.

## Development

The frontend card is located in `custom_components/nrl_scores/frontend/nrl-score-card.js`. It uses standard Web Components and requires no build step to get started, making it easy to tweak!
