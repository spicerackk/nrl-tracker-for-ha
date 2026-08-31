# NRL Tracker for Home Assistant

![NRL Tracker Card](images/preview.png)

A Home Assistant custom integration and companion Lovelace cards for tracking NRL matches, scores, ladders, and advanced plays (tries, penalties, conversions, stats).

## Features

- **Real-time Scores:** Follows your favorite team and updates scores live.
- **Multi-Competition Support:** Track over 60 teams across the **NRL**, **NRLW**, **State of Origin (Men & Women)**, **Pacific Championships**, **World Cup**, and **Internationals**. Add the integration multiple times to track multiple teams!
- **Companion Lovelace Cards:** A beautiful, responsive custom score card that displays the match state, team logos, and a live countdown to kickoff.
- **Ladder Card:** Includes a second custom card to display the live ladder/standings.
- **Live Advanced Plays & Stats:** Click the card to expand a detailed view streaming live tries, penalty goals, conversions, sin bins, possession %, and completion rates directly from the NRL Match Centre.
- **Custom Event Automations:** The backend integration automatically fires Home Assistant events whenever your team scores or the match state changes.
- **Compatibility:** Sensor attributes are compatible with standard `ha-teamtracker` lovelace cards.

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
3. Select your Competition.
4. Select the team you wish to track from the second dropdown.

*Note: The integration MUST be added here for the custom Lovelace cards to work!*

## Setting up the Frontend Cards

When the integration is set up, it serves the custom card files. Tell Lovelace where to find them:

1. Go to **Settings** > **Dashboards** > **Three dots (top right)** > **Resources**.
   *(If you don't see Resources, ensure Advanced Mode is enabled in your user profile).*
2. Add the Score Card URL: `/nrl_scores_frontend/nrl-score-card.js?v=2.0` (JavaScript Module)
3. Add the Ladder Card URL: `/nrl_scores_frontend/nrl-ladder-card.js?v=2.0` (JavaScript Module)
4. **Refresh your browser window (Ctrl+F5)**.

## Usage & Customization

Now you can add the cards to your dashboard!

### 1. NRL Score Card
1. Edit your dashboard and click **Add Card**.
2. Scroll down to the bottom and select **Custom: NRL Score Card**.
3. Select your team sensor (e.g., `sensor.nrl_brisbane_broncos`) from the dropdown.
4. **Customize View:** Use the toggles to:
   * Show Entire Round
   * Hide Upcoming Matches (so you only see live/past matches)
   * Display Advanced Stats (Possession % & Completion Rate)
   * Display Advanced Plays (Tries, Sin Bins, etc.)
   * Set Max Key Plays to display (defaults to the latest 5 plays)

*Note: You can turn on either Advanced Plays or Advanced Stats in the settings, and you can **click anywhere on the score card** to toggle between viewing the Plays, Stats, or the default minimal view!*

### 2. NRL Ladder Card
1. Add a **Custom: NRL Ladder Card** to your dashboard.
2. Select any NRL Score sensor you have configured using the convenient **Entity dropdown** in the visual editor. It will automatically pull the full ladder for that competition and display it beautifully on your dashboard!

## Smart Home Automations

This integration is built for the smart home. It fires native events to the Home Assistant event bus that you can use as triggers for your automations!

### 1. Flash Lights When Your Team Scores
Listen for the `nrl_score_update` event. This fires instantly when the score changes!

```yaml
trigger:
  - platform: event
    event_type: nrl_score_update
    event_data:
      team: "Brisbane Broncos"
condition:
  - condition: template
    value_template: "{{ trigger.event.data.team_score > state_attr('sensor.nrl_brisbane_broncos', 'team_score') | default(0) | int }}"
action:
  - service: light.turn_on
    target:
      entity_id: light.living_room
    data:
      color_name: "maroon"
      flash: short
```
*(Note: The condition ensures we only trigger if YOUR team scored, not the opponent).*

### 2. Turn on the TV When the Match Starts
Listen for the `nrl_match_state_change` event. This fires when the game goes from `Pre` (Upcoming) to `Live`.

```yaml
trigger:
  - platform: event
    event_type: nrl_match_state_change
    event_data:
      team: "Brisbane Broncos"
      old_state: "Pre"
      new_state: "Live"
action:
  - service: media_player.turn_on
    target:
      entity_id: media_player.living_room_tv
  - service: notify.mobile_app_my_phone
    data:
      message: "The Broncos game is starting now!"
```

## Development

The frontend cards are located in `custom_components/nrl_scores/frontend/`. They use standard Web Components and require no build step to get started, making it easy to tweak!
