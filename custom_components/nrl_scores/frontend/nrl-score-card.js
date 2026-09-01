console.log("NRL Score Card - Loading Version 4");
class NRLScoreCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    this._hass = hass;
    if (!this.content) {
      this.createCard();
    }
    this.updateCard();
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Please define an entity');
    }
    this.config = config;
    this.showDetails = this.config.show_advanced_plays === true;
    this.showStats = this.config.show_advanced_stats === true;
    if (this.content) {
      this.updateCard();
    }
  }

  createCard() {
    this.card = document.createElement('ha-card');
    
    this.card.addEventListener('click', (ev) => {
      // Don't toggle if clicking on switches in editor
      if (ev.composedPath().find(e => e.tagName === 'HA-SWITCH')) return;
      this.showDetails = !this.showDetails;
      this.showStats = !this.showStats;
      this.updateCard();
    });

    this.content = document.createElement('div');
    
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      ha-card {
        cursor: pointer;
        overflow: hidden;
        position: relative;
      }
      .bg-tint {
        position: absolute;
        top: 0; left: 0; right: 0; bottom: 0;
        opacity: 0.1;
        z-index: 0;
        transition: background 0.5s ease;
      }
      .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); z-index: 1; }
      .title { text-align: center; font-size: 1.2em; font-weight: 500; margin-bottom: 4px; }
      .subtitle { font-size: 1.1em; line-height: 1.1em; text-align: center; width: 100%; margin-bottom: 4px; color: var(--secondary-text-color); }
      
      .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; margin-top: 12px; }
      .team { text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center; position: relative; }
      .ladder-pos { font-size: 0.85em; font-weight: bold; color: var(--secondary-text-color); margin-bottom: 4px; }
      .team-form { font-size: 0.85em; font-weight: bold; margin-top: 4px; background: rgba(128,128,128,0.2); padding: 2px 6px; border-radius: 4px; letter-spacing: 1px;}
      .logo { max-height: 6.5em; max-width: 90px; object-fit: contain; z-index: 2; }
      .name { font-size: 1.4em; margin-top: 8px; font-weight: 500; }
      .score { font-size: 3em; opacity: 1; text-align: center; line-height: 1; font-weight: bold; }
      .divider { font-size: 2.5em; text-align: center; margin: 0 4px; color: var(--secondary-text-color); }
      
      .play-clock { font-size: 1.4em; height: 1.4em; text-align: center; margin-top: 16px; font-weight: bold; color: var(--accent-color, #ff9800); }
      .status-final { color: var(--primary-text-color); }
      .status-upcoming { color: var(--secondary-text-color); }

      .details-section, .stats-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
        display: none;
      }
      .expanded {
        display: block;
      }
      
      /* Advanced Plays */
      .play-item { display: flex; align-items: center; gap: 12px; padding: 8px 0; }
      .play-time { font-weight: bold; color: var(--secondary-text-color); width: 30px; }
      .play-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
      .icon-try { background-color: #4CAF50; }
      .icon-goal { background-color: #2196F3; }
      .icon-penalty { background-color: #FF9800; }
      .icon-sinbin { background-color: #F44336; }
      .play-desc { display: flex; flex-direction: column; }
      .play-player { font-size: 14px; font-weight: 500; }
      .play-team { font-size: 12px; color: var(--secondary-text-color); }

      /* Advanced Stats */
      .stat-row { display: flex; flex-direction: column; align-items: center; margin-bottom: 16px; width: 100%; }
      .stat-title { font-weight: bold; margin-bottom: 8px; }
      .stat-bar-container { width: 100%; height: 16px; background: var(--secondary-background-color, #e0e0e0); border-radius: 8px; overflow: hidden; display: flex; }
      .stat-bar-home { background: var(--primary-color, #03a9f4); height: 100%; display: flex; align-items: center; justify-content: flex-start; padding-left: 8px; color: white; font-size: 10px; font-weight: bold;}
      .stat-bar-away { background: var(--accent-color, #ff9800); height: 100%; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px; color: white; font-size: 10px; font-weight: bold;}
      .stat-circle-container { display: flex; justify-content: space-around; width: 100%; }
      .stat-circle { position: relative; width: 80px; height: 80px; border-radius: 50%; background: conic-gradient(var(--primary-color) calc(var(--val) * 1%), var(--secondary-background-color, #e0e0e0) 0); display: flex; align-items: center; justify-content: center; }
      .stat-circle::before { content: ""; position: absolute; inset: 6px; background: var(--card-background-color, white); border-radius: 50%; }
      .stat-circle-val { position: relative; font-weight: bold; font-size: 16px; }

      /* Round Mode */
      .round-wrapper { padding: 16px; }
      .round-header { text-align: center; font-size: 1.2em; font-weight: 500; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 1px solid var(--divider-color); }
      .match-row { display: flex; flex-direction: column; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--divider-color); }
      .match-row:last-child { border-bottom: none; }
      .match-status { font-size: 12px; font-weight: bold; text-transform: uppercase; margin-bottom: 8px; color: var(--secondary-text-color); }
      .match-teams { display: flex; justify-content: center; align-items: center; width: 100%; gap: 16px; }
      .match-team { display: flex; flex-direction: row; align-items: center; gap: 8px; width: 40%; }
      .match-team.away { flex-direction: row-reverse; text-align: right; }
      .match-logo { width: 32px; height: 32px; object-fit: contain; }
      .match-name { font-size: 16px; font-weight: 500; flex: 1; }
      .match-score { font-size: 20px; font-weight: bold; width: 30px; text-align: center; }
      .match-divider { font-size: 18px; color: var(--secondary-text-color); }
    `;

    this.card.appendChild(this.styleEl);
    this.bgEl = document.createElement('div');
    this.bgEl.className = 'bg-tint';
    this.card.appendChild(this.bgEl);
    this.card.appendChild(this.content);
    this.shadowRoot.appendChild(this.card);
  }

  getTeamColor(themeKey) {
    const TEAM_COLORS = {
      "broncos": "#7a003c", "bulldogs": "#0055a5", "cowboys": "#002b5c",
      "dolphins": "#e02213", "dragons": "#e02213", "eels": "#00529b",
      "knights": "#002d62", "panthers": "#000000", "rabbitohs": "#004B2A",
      "raiders": "#00A650", "roosters": "#00205b", "sea-eagles": "#6c0022",
      "sharks": "#00a9d8", "storm": "#3c2a61", "titans": "#002b5c",
      "warriors": "#000000", "wests-tigers": "#f68b1f", "blues": "#56a0d3",
      "maroons": "#7b001d", "kangaroos": "#004b36"
    };
    return TEAM_COLORS[themeKey] || "transparent";
  }

  formatCountdown(kickoffTime) {
    if (!kickoffTime) return 'Upcoming';
    const dateObj = new Date(kickoffTime);
    const kickoff = dateObj.getTime();
    if (isNaN(kickoff)) return 'Upcoming';
    
    const diff = kickoff - Date.now();
    if (diff < 0) return 'Starting soon';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    const timeOpts = { hour: 'numeric', minute: '2-digit' };
    const timeStr = dateObj.toLocaleTimeString(undefined, timeOpts);
    const dayStr = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
    
    if (hours > 48) {
      const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      return `${dayStr} ${dateStr}, ${timeStr} (in ${Math.floor(hours/24)} days)`;
    }
    
    return `${dayStr} ${timeStr} (in ${hours}h ${mins}m)`;
  }

  updateCard() {
    if (!this._hass || !this.config || !this.content) return;
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];

    if (!stateObj) {
      this.content.innerHTML = `<div class="card"><div class="error">Entity not found: ${entityId}</div></div>`;
      return;
    }

    const attrs = stateObj.attributes;
    
    // Card Settings Configs
    const showRoundName = this.config.show_round_name !== false;
    const showStadium = this.config.show_stadium !== false;
    const showLogos = this.config.show_logos !== false;
    const showCountdown = this.config.show_countdown !== false;
    const showForm = this.config.show_form !== false;
    const showEntireRound = this.config.show_entire_round === true;
    const showTablePos = this.config.show_table_position !== false;

    const isHome = attrs.team_homeaway === 'home';
    const matchState = stateObj.state;
    
    let statusText = 'Upcoming';
    let statusClass = 'status-upcoming';
    if (matchState === 'IN') {
      statusText = attrs.clock || 'Live';
      statusClass = '';
    } else if (matchState === 'POST') {
      statusText = 'Final';
      statusClass = 'status-final';
    } else if (matchState === 'PRE' && attrs.kickoff_in) {
      statusText = this.formatCountdown(attrs.kickoff_in);
    }

    let homeTeam = attrs.home_team || (isHome ? attrs.team_name : attrs.opponent_name);
    let homeLogo = "https://www.nrl.com/.theme/" + (attrs.home_theme || "nrl") + "/badge.svg";
    let homeScore = attrs.home_score || 0;

    let awayTeam = attrs.away_team || (!isHome ? attrs.team_name : attrs.opponent_name);
    let awayLogo = "https://www.nrl.com/.theme/" + (attrs.away_theme || "nrl") + "/badge.svg";
    let awayScore = attrs.away_score || 0;

    // Dynamic background based on winning team
    let bgColor = "transparent";
    if (homeScore > awayScore) bgColor = this.getTeamColor(attrs.home_theme);
    else if (awayScore > homeScore) bgColor = this.getTeamColor(attrs.away_theme);
    this.bgEl.style.background = bgColor !== "transparent" ? `linear-gradient(135deg, ${bgColor}88 0%, transparent 100%)` : "";

    if (showEntireRound) {
      let matchesHtml = '';
      if (attrs.round_fixtures && attrs.round_fixtures.length > 0) {
        let fixturesToRender = attrs.round_fixtures;
        if (this.config.hide_upcoming_matches === true) {
          fixturesToRender = fixturesToRender.filter(f => f.match_mode === 'Live' || f.match_mode === 'Post');
        }
        
        matchesHtml = fixturesToRender.map(f => {
          let fStatus = 'Upcoming';
          let fClass = 'status-upcoming';
          if (f.match_mode === 'Live') {
            fStatus = f.game_time || 'Live';
            fClass = '';
          } else if (f.match_mode === 'Post') {
            fStatus = 'Final';
            fClass = 'status-final';
          } else {
            if (this.config.show_fixture_date === true && f.kick_off_time) {
              const ko = new Date(f.kick_off_time);
              const dayStr = ko.toLocaleDateString(undefined, { weekday: 'short' });
              const dateStr = ko.toLocaleDateString('en-AU', { month: '2-digit', day: '2-digit' });
              const timeStr = ko.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
              fStatus = `${dayStr} ${dateStr} ${timeStr}`;
            }
          }
          
          let hLogo = "https://www.nrl.com/.theme/" + f.home_theme + "/badge.svg";
          let aLogo = "https://www.nrl.com/.theme/" + f.away_theme + "/badge.svg";

          let hLadder = "";
          let aLadder = "";
          if (this.config.show_fixture_ladder === true && attrs.ladder) {
             const hTeam = attrs.ladder.find(t => t.team === f.home_team || f.home_team.includes(t.team) || t.team.includes(f.home_team));
             if (hTeam) hLadder = `<span style="font-size: 10px; color: var(--secondary-text-color); margin-right: 4px;">(${hTeam.position})</span>`;
             const aTeam = attrs.ladder.find(t => t.team === f.away_team || f.away_team.includes(t.team) || t.team.includes(f.away_team));
             if (aTeam) aLadder = `<span style="font-size: 10px; color: var(--secondary-text-color); margin-left: 4px;">(${aTeam.position})</span>`;
          }

          return `
            <div class="match-row">
              <div class="match-status ${fClass}">${fStatus}</div>
              <div class="match-teams">
                <div class="match-team home">
                  ${hLadder}<span class="match-name">${f.home_team}</span>
                  <img src="${hLogo}" class="match-logo" onerror="this.style.display='none'">
                </div>
                <div class="match-score">${f.home_score}</div>
                <div class="match-divider">-</div>
                <div class="match-score">${f.away_score}</div>
                <div class="match-team away">
                  <span class="match-name">${f.away_team}</span>${aLadder}
                  <img src="${aLogo}" class="match-logo" onerror="this.style.display='none'">
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        matchesHtml = `<div style="text-align: center; color: var(--secondary-text-color);">No fixtures available.</div>`;
      }

      this.content.innerHTML = `
        <div class="round-wrapper">
          <div class="round-header">${attrs.round || 'Current Round'}</div>
          ${matchesHtml}
        </div>
      `;
      return;
    }

    // Default Single Match View
    const showTries = this.config.show_event_tries !== false;
    const showSinBins = this.config.show_event_sin_bins !== false;
    const showPenalties = this.config.show_event_penalty_goals !== false;
    const showConversions = this.config.show_event_conversions !== false;

    let playsHtml = '';
    if (attrs.plays && attrs.plays.length > 0) {
      let filteredPlays = attrs.plays.filter(p => {
        if (p.icon === 'T' && !showTries) return false;
        if (p.icon === 'G' && !showConversions) return false;
        if (p.icon === 'P' && !showPenalties) return false;
        if (p.icon === 'SB' && !showSinBins) return false;
        return true;
      });
      
      const maxPlays = this.config.max_key_plays !== undefined ? this.config.max_key_plays : 5;
      if (maxPlays > 0 && filteredPlays.length > maxPlays) {
        // Plays are reverse chronological (newest first), so we want the first maxPlays elements
        filteredPlays = filteredPlays.slice(0, maxPlays);
      } else if (maxPlays === 0) {
        filteredPlays = [];
      }
      
      if (filteredPlays.length > 0) {
        playsHtml = filteredPlays.map(p => {
          return `
            <div class="play-item">
              <div class="play-time">${p.time}</div>
              <div class="play-icon ${p.class}">${p.icon}</div>
              <div class="play-desc">
                <span class="play-player">${p.player}</span>
                <span class="play-team">${p.team}</span>
              </div>
            </div>`;
        }).join('');
      } else {
        playsHtml = `<div style="text-align: center; color: var(--secondary-text-color); font-size: 14px;">No key plays available yet.</div>`;
      }
    } else {
      playsHtml = `<div style="text-align: center; color: var(--secondary-text-color); font-size: 14px;">No key plays available yet.</div>`;
    }

    // Advanced Stats HTML
    let statsHtml = '';
    if (attrs.possession || attrs.completion_rate_home) {
      let homePoss = attrs.possession ? (isHome ? attrs.possession : (100 - attrs.possession)) : 50;
      let awayPoss = 100 - homePoss;
      
      // The API values are strings like "80" or "32/40"
      let compHomeRaw = isHome ? (attrs.completion_rate_home || 0) : (attrs.completion_rate_away || 0);
      let compAwayRaw = isHome ? (attrs.completion_rate_away || 0) : (attrs.completion_rate_home || 0);
      
      let compHomeVal = parseFloat(compHomeRaw) || 0;
      let compAwayVal = parseFloat(compAwayRaw) || 0;
      
      let homeCol = this.getTeamColor(attrs.home_theme);
      let awayCol = this.getTeamColor(attrs.away_theme);
      
      statsHtml = `\n        ${this.config.show_stat_possession !== false ? `<div class="stat-row"><div class="stat-title">Possession %</div><div class="stat-bar-container"><div class="stat-bar-home" style="width: ${homePoss}%; background: ${homeCol};">${homePoss}%</div><div class="stat-bar-away" style="width: ${awayPoss}%; background: ${awayCol};">${awayPoss}%</div></div></div>` : ""}\n        ${this.config.show_stat_completion !== false ? `<div class="stat-row"><div class="stat-title">Completion Rate</div><div class="stat-circle-container" style="display: flex; justify-content: center; gap: 30px;"><div><div class="stat-circle" style="--val: ${compHomeVal}; --primary-color: ${homeCol}"><span class="stat-circle-val">${compHomeRaw}%</span></div></div><div><div class="stat-circle" style="--val: ${compAwayVal}; --primary-color: ${awayCol}"><span class="stat-circle-val">${compAwayRaw}%</span></div></div></div></div>` : ""}\n      `;
    } else { statsHtml = `<div style="text-align: center; color: var(--secondary-text-color); font-size: 14px;">Stats available during match.</div>`; }
    
    // Ladder & Form labels
    let ladderHome = "";
    let formHome = "";
    let ladderAway = "";
    let formAway = "";
    
    if (attrs.ladder && attrs.ladder.length > 0) {
      const hTeam = attrs.ladder.find(t => t.team === homeTeam || homeTeam.includes(t.team) || t.team.includes(homeTeam));
      if (hTeam) {
        if(showTablePos) ladderHome = `<div class="ladder-pos">(${hTeam.position})</div>`;
        if (showForm && matchState === 'PRE' && hTeam.form) formHome = `<div class="team-form">${hTeam.form}</div>`;
      }
      const aTeam = attrs.ladder.find(t => t.team === awayTeam || awayTeam.includes(t.team) || t.team.includes(awayTeam));
      if (aTeam) {
        if(showTablePos) ladderAway = `<div class="ladder-pos">(${aTeam.position})</div>`;
        if (showForm && matchState === 'PRE' && aTeam.form) formAway = `<div class="team-form">${aTeam.form}</div>`;
      }
    } else if (attrs.ladder_position) {
      if (isHome) {
        if(showTablePos) ladderHome = `<div class="ladder-pos">(${attrs.ladder_position})</div>`;
        if (showForm && matchState === 'PRE' && attrs.team_form) formHome = `<div class="team-form">${attrs.team_form}</div>`;
      } else {
        if(showTablePos) ladderAway = `<div class="ladder-pos">(${attrs.ladder_position})</div>`;
        if (showForm && matchState === 'PRE' && attrs.team_form) formAway = `<div class="team-form">${attrs.team_form}</div>`;
      }
    }

    this.content.innerHTML = `
      <div class="card">
        ${showRoundName ? `<div class="title">${attrs.league || 'NRL'} - ${attrs.round || 'Round'}</div>` : ''}
        ${showStadium ? `<div class="subtitle">${attrs.venue || ''}</div>` : ''}
        
        <div class="card-content">
          <div class="team">
            ${ladderHome}
            ${showLogos ? `<img src="${homeLogo}" class="logo" onerror="this.style.display='none'">` : ''}
            <div class="name">${homeTeam}</div>
            ${formHome}
          </div>
          
          ${matchState === 'PRE' ? 
            (showCountdown ? `<div class="play-clock ${statusClass}">${statusText}</div>` : '') : 
            `<div class="score">${homeScore}</div>
             <div class="divider">-</div>
             <div class="score">${awayScore}</div>`
          }
          
          <div class="team">
            ${ladderAway}
            ${showLogos ? `<img src="${awayLogo}" class="logo" onerror="this.style.display='none'">` : ''}
            <div class="name">${awayTeam}</div>
            ${formAway}
          </div>
        </div>
        
        ${matchState !== 'PRE' ? `<div class="play-clock ${statusClass}">${statusText}</div>` : ''}
        
        <div class="details-section ${this.showDetails ? 'expanded' : ''}">
          <div style="font-weight: bold; margin-bottom: 12px; text-align: center;">Key Plays</div>
          ${playsHtml}
        </div>
        
        <div class="stats-section ${this.showStats ? 'expanded' : ''}">
          <div style="font-weight: bold; margin-bottom: 12px; text-align: center;">Match Stats</div>
          ${statsHtml}
        </div>
      </div>
    `;
  }

  static getConfigElement() {
    return document.createElement("nrl-score-card-editor");
  }

  static getStubConfig() {
    return { entity: "", show_event_tries: true, show_event_sin_bins: true, show_event_penalty_goals: true, show_event_conversions: true, max_key_plays: 5 };
  }
}

class NRLScoreCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (this.innerHTML) {
      this.updateEditor();
    }
  }

  configChanged(newConfig) {
    const event = new Event("config-changed", { bubbles: true, composed: true });
    event.detail = { config: newConfig };
    this.dispatchEvent(event);
  }

  valueChanged(key, value) {
    if (!this._config) return;
    this.configChanged({ ...this._config, [key]: value });
  }
  
  updateSwitch(id, key, defaultVal) {
    const el = this.querySelector('#' + id);
    if (el && this._config) {
      const isChecked = this._config[key] !== undefined ? this._config[key] : defaultVal;
      el.checked = isChecked;
      if (isChecked) {
        el.setAttribute('checked', '');
      } else {
        el.removeAttribute('checked');
      }
    }
  }

  init() {
    this.innerHTML = `
      <div class="card-config">
        <div style="margin-bottom: 16px;">
          <ha-entity-picker label="Entity" allow-custom-entity></ha-entity-picker>
        </div>
        
        <h3>Card settings</h3>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_round_name"></ha-switch>
          <span style="margin-left: 8px;">Round name and number</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_stadium"></ha-switch>
          <span style="margin-left: 8px;">Stadium</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_logos"></ha-switch>
          <span style="margin-left: 8px;">Logos</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_countdown"></ha-switch>
          <span style="margin-left: 8px;">Countdown</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_form"></ha-switch>
          <span style="margin-left: 8px;">Form</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_table_pos"></ha-switch>
          <span style="margin-left: 8px;">Table Position</span>
        </div>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_round"></ha-switch>
          <span style="margin-left: 8px;">Entire Round</span>
        </div>
        <div id="round_settings" style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; margin-left: 24px;">
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_fixture_ladder"></ha-switch>
            <span style="margin-left: 8px;">Ladder Position</span>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_fixture_date"></ha-switch>
            <span style="margin-left: 8px;">Day and Date</span>
          </div>
        </div>

        <h3>Display Key Plays</h3>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_adv"></ha-switch>
          <span style="margin-left: 8px;">Enable Key Plays</span>
        </div>
        <div id="adv_settings" style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; margin-left: 24px;">
          <div style="display: flex; align-items: center; margin-bottom: 8px;">
            <ha-textfield id="tf_max_plays" label="Max Key Plays" type="number" min="0"></ha-textfield>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_tries"></ha-switch>
            <span style="margin-left: 8px;">Tries</span>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_conv"></ha-switch>
            <span style="margin-left: 8px;">Conversions</span>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_pen"></ha-switch>
            <span style="margin-left: 8px;">Penalties</span>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_sin"></ha-switch>
            <span style="margin-left: 8px;">Sin Bins</span>
          </div>
        </div>

        <h3>Display Advanced Stats</h3>
        <div style="margin-bottom: 8px; display: flex; align-items: center;">
          <ha-switch id="sw_stats"></ha-switch>
          <span style="margin-left: 8px;">Enable Advanced Stats</span>
        </div>
        <div id="stats_settings" style="margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; margin-left: 24px;">
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_possession"></ha-switch>
            <span style="margin-left: 8px;">Possession</span>
          </div>
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_completion"></ha-switch>
            <span style="margin-left: 8px;">Completion</span>
          </div>
        </div>
      </div>
    `;

    const picker = this.querySelector('ha-entity-picker');
    picker.includeDomains = ["sensor"];
    picker.addEventListener('value-changed', (ev) => this.valueChanged('entity', ev.detail.value));

    // Card Settings
    this.setupSwitch('sw_round_name', 'show_round_name', true);
    this.setupSwitch('sw_stadium', 'show_stadium', true);
    this.setupSwitch('sw_logos', 'show_logos', true);
    this.setupSwitch('sw_countdown', 'show_countdown', true);
    this.setupSwitch('sw_form', 'show_form', true);
    this.setupSwitch('sw_round', 'show_entire_round', false);
    this.setupSwitch('sw_fixture_ladder', 'show_fixture_ladder', false);
    this.setupSwitch('sw_fixture_date', 'show_fixture_date', false);
    this.setupSwitch('sw_table_pos', 'show_table_position', true);

    // Key Plays
    this.setupSwitch('sw_adv', 'show_advanced_plays', false);
    this.setupSwitch('sw_tries', 'show_event_tries', true);
    this.setupSwitch('sw_conv', 'show_event_conversions', true);
    this.setupSwitch('sw_pen', 'show_event_penalty_goals', true);
    this.setupSwitch('sw_sin', 'show_event_sin_bins', true);
    
    // Stats
    this.setupSwitch('sw_stats', 'show_advanced_stats', false);
    this.setupSwitch('sw_possession', 'show_stat_possession', true);
    this.setupSwitch('sw_completion', 'show_stat_completion', true);
    
    const tfMaxPlays = this.querySelector('#tf_max_plays');
    if (tfMaxPlays) {
      tfMaxPlays.addEventListener('change', (ev) => {
        this.valueChanged('max_key_plays', parseInt(ev.target.value, 10));
      });
    }
    
    this.querySelector('#sw_round').addEventListener('change', () => this.updateEditor());
    this.querySelector('#sw_adv').addEventListener('change', () => this.updateEditor());
    this.querySelector('#sw_stats').addEventListener('change', () => this.updateEditor());
  }

  setupSwitch(id, key, defaultVal) {
    const el = this.querySelector('#' + id);
    if (el) {
      el.addEventListener('change', (ev) => this.valueChanged(key, ev.target.checked));
    }
  }

  connectedCallback() {
    if (!this.querySelector('.card-config')) {
      this.init();
    }
    this.updateEditor();
  }

  updateEditor() {
    if (!this.innerHTML || !this._config) return;
    
    const picker = this.querySelector('ha-entity-picker');
    if (picker) picker.value = this._config.entity;

    this.updateSwitch('sw_round_name', 'show_round_name', true);
    this.updateSwitch('sw_stadium', 'show_stadium', true);
    this.updateSwitch('sw_logos', 'show_logos', true);
    this.updateSwitch('sw_countdown', 'show_countdown', true);
    this.updateSwitch('sw_form', 'show_form', true);
    this.updateSwitch('sw_round', 'show_entire_round', false);
    this.updateSwitch('sw_fixture_ladder', 'show_fixture_ladder', false);
    this.updateSwitch('sw_fixture_date', 'show_fixture_date', false);
    
    const roundSettings = this.querySelector('#round_settings');
    if (roundSettings) {
      roundSettings.style.display = this._config.show_entire_round === true ? 'flex' : 'none';
    }
    this.updateSwitch('sw_table_pos', 'show_table_position', true);

    this.updateSwitch('sw_adv', 'show_advanced_plays', false);
    this.updateSwitch('sw_tries', 'show_event_tries', true);
    this.updateSwitch('sw_conv', 'show_event_conversions', true);
    this.updateSwitch('sw_pen', 'show_event_penalty_goals', true);
    this.updateSwitch('sw_sin', 'show_event_sin_bins', true);

    this.updateSwitch('sw_stats', 'show_advanced_stats', false);
    this.updateSwitch('sw_possession', 'show_stat_possession', true);
    this.updateSwitch('sw_completion', 'show_stat_completion', true);

    const tfMaxPlays = this.querySelector('#tf_max_plays');
    if (tfMaxPlays) {
      tfMaxPlays.value = this._config.max_key_plays !== undefined ? this._config.max_key_plays : 5;
    }

    const advSettings = this.querySelector('#adv_settings');
    const swAdv = this.querySelector('#sw_adv');
    if (advSettings && swAdv) {
      advSettings.style.display = swAdv.checked ? 'flex' : 'none';
    }
    
    const statsSettings = this.querySelector('#stats_settings');
    const swStats = this.querySelector('#sw_stats');
    if (statsSettings && swStats) {
      statsSettings.style.display = swStats.checked ? 'flex' : 'none';
    }
  }
}
customElements.define("nrl-score-card-editor", NRLScoreCardEditor);
customElements.define('nrl-score-card', NRLScoreCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "nrl-score-card",
  name: "NRL Score Card",
  preview: true,
  description: "A custom card to display NRL scores and match states."
});




