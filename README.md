# NRL Scores Integration & Custom Card

A Home Assistant custom integration and companion Lovelace card for tracking NRL matches, scores, and advanced plays (tries, penalties, conversions).

## Features

- **Real-time Scores:** Follows your favorite NRL team and updates scores live.
- **Companion Lovelace Card:** A beautiful, responsive custom card that displays the match state, team logos, and live clock.
- **Advanced Plays (Mockup):** Click the card to expand a detailed view showing try scorers and penalties!
- **Compatibility:** Sensor attributes are compatible with standard `ha-teamtracker` lovelace cards.
- **Consolidated Repository:** Both the backend integration and frontend card are bundled in this single repository for easy installation.

## Installation via HACS

1. Open HACS in your Home Assistant instance.
2. Go to **Integrations**.
3. Click the three dots in the top right corner and select **Custom repositories**.
4. Add the URL of this repository (`https://github.com/spicerackk/nrl-tracker-for-ha`) and select **Integration** as the category.
5. Search for "NRL Scores" in HACS, click **Install**, and restart Home Assistant.

## Configuration

Once installed and restarted:
1. Go to **Settings** > **Devices & Services**.
2. Click **Add Integration** and search for **NRL Scores**.
3. Select the team you wish to track from the dropdown.

*Note: You can add the integration multiple times to track multiple teams.*

## Setting up the Frontend Card

When the integration loads, it automatically serves the custom card files. You just need to tell Lovelace where to find them:

1. Go to **Settings** > **Dashboards** > **Three dots (top right)** > **Resources**.
   *(If you don't see Resources, ensure Advanced Mode is enabled in your user profile).*
2. Click **Add Resource**.
3. Enter the URL: `/nrl_scores_frontend/nrl-score-card.js`
4. Select **JavaScript Module** as the Resource type.
5. Click **Create**.
6. **Refresh your browser window**.

## Usage

Now you can add the card to your dashboard!

1. Edit your dashboard and click **Add Card**.
2. Scroll down to the bottom and select **Custom: NRL Score Card** (or use the visual editor).
3. Select your `sensor.nrl_broncos` (or whatever your team sensor is named) from the dropdown.
4. Save and enjoy! Click on the card to expand the advanced plays.

## Development

The frontend card is located in `custom_components/nrl_scores/frontend/nrl-score-card.js`. It uses standard Web Components and requires no build step to get started, making it easy to tweak!

