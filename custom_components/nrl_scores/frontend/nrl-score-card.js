console.log("NRL Score Card - Loading Version 3");
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
    if (this.content) {
      this.updateCard();
    }
  }

  createCard() {
    this.card = document.createElement('ha-card');
    
    this.card.addEventListener('click', () => {
      this.showDetails = !this.showDetails;
      this.updateCard();
    });

    this.content = document.createElement('div');
    
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      ha-card {
        cursor: pointer;
        overflow: hidden;
      }
      .card { position: relative; overflow: hidden; padding: 16px 16px 20px; font-weight: 400; border-radius: var(--ha-card-border-radius, 10px); }
      .title { text-align: center; font-size: 1.2em; font-weight: 500; margin-bottom: 4px; }
      .subtitle { font-size: 1.1em; line-height: 1.1em; text-align: center; width: 100%; margin-bottom: 4px; color: var(--secondary-text-color); }
      
      .card-content { display: flex; justify-content: space-evenly; align-items: center; text-align: center; position: relative; z-index: 1; margin-top: 12px; }
      .team { text-align: center; width: 35%; display: flex; flex-direction: column; align-items: center; }
      .logo { max-height: 6.5em; max-width: 90px; object-fit: contain; }
      .name { font-size: 1.4em; margin-top: 8px; font-weight: 500; }
      .score { font-size: 3em; opacity: 1; text-align: center; line-height: 1; font-weight: bold; }
      .divider { font-size: 2.5em; text-align: center; margin: 0 4px; color: var(--secondary-text-color); }
      
      .play-clock { font-size: 1.4em; height: 1.4em; text-align: center; margin-top: 16px; font-weight: bold; color: var(--accent-color, #ff9800); }
      .status-final { color: var(--primary-text-color); }
      .status-upcoming { color: var(--secondary-text-color); }

      .details-section {
        margin-top: 16px;
        padding-top: 16px;
        border-top: 1px solid var(--divider-color);
        display: none;
      }
      .details-section.expanded {
        display: block;
      }
      .play-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0;
      }
      .play-time { font-weight: bold; color: var(--secondary-text-color); width: 30px; }
      .play-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: bold; }
      .icon-try { background-color: #4CAF50; }
      .icon-goal { background-color: #2196F3; }
      .icon-penalty { background-color: #FF9800; }
      .icon-sinbin { background-color: #F44336; }
      .play-desc { display: flex; flex-direction: column; }
      .play-player { font-size: 14px; font-weight: 500; }
      .play-team { font-size: 12px; color: var(--secondary-text-color); }

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
    this.card.appendChild(this.content);
    this.shadowRoot.appendChild(this.card);
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
    }

    let homeTeam = isHome ? attrs.team_name : attrs.opponent_name;
    let homeLogo = isHome ? attrs.team_logo : attrs.opponent_logo;
    let homeScore = isHome ? attrs.team_score : attrs.opponent_score;

    let awayTeam = !isHome ? attrs.team_name : attrs.opponent_name;
    let awayLogo = !isHome ? attrs.team_logo : attrs.opponent_logo;
    let awayScore = !isHome ? attrs.team_score : attrs.opponent_score;

    const showEntireRound = this.config.show_entire_round === true;

    if (showEntireRound) {
      let matchesHtml = '';
      if (attrs.round_fixtures && attrs.round_fixtures.length > 0) {
        matchesHtml = attrs.round_fixtures.map(f => {
          let fStatus = 'Upcoming';
          let fClass = 'status-upcoming';
          if (f.match_mode === 'Live') {
            fStatus = f.game_time || 'Live';
            fClass = '';
          } else if (f.match_mode === 'Post') {
            fStatus = 'Final';
            fClass = 'status-final';
          }
          return `
            <div class="match-row">
              <div class="match-status ${fClass}">${fStatus}</div>
              <div class="match-teams">
                <div class="match-team home">
                  <img src="https://www.nrl.com/.theme/${f.home_theme}/badge.svg" class="match-logo" onerror="this.style.display='none'"/>
                  <span class="match-name">${f.home_team}</span>
                  <span class="match-score">${f.home_score !== undefined ? f.home_score : '-'}</span>
                </div>
                <div class="match-divider">-</div>
                <div class="match-team away">
                  <img src="https://www.nrl.com/.theme/${f.away_theme}/badge.svg" class="match-logo" onerror="this.style.display='none'"/>
                  <span class="match-name">${f.away_team}</span>
                  <span class="match-score">${f.away_score !== undefined ? f.away_score : '-'}</span>
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        matchesHtml = `<div style="text-align: center; padding: 16px;">No round fixtures available.</div>`;
      }
      
      this.content.innerHTML = `
        <div class="round-wrapper">
          <div class="round-header">${attrs.league || 'NRL'} ${attrs.round ? '- ' + attrs.round : ''}</div>
          ${matchesHtml}
        </div>
      `;
      return;
    }

    const showTries = this.config.show_event_tries !== false;
    const showSinBins = this.config.show_event_sin_bins !== false;
    const showPenalties = this.config.show_event_penalty_goals !== false;
    const showConversions = this.config.show_event_conversions !== false;

    let playsHtml = '';
    
    // DEMO DATA AS PER ORIGINAL SCRIPT
    if (showTries) {
      playsHtml += `
      <div class="play-item">
        <div class="play-time">58'</div>
        <div class="play-icon icon-try">T</div>
        <div class="play-desc">
          <span class="play-player">Reece Walsh</span>
          <span class="play-team">Broncos</span>
        </div>
      </div>`;
    }
    
    if (showConversions) {
      playsHtml += `
      <div class="play-item">
        <div class="play-time">59'</div>
        <div class="play-icon icon-goal">G</div>
        <div class="play-desc">
          <span class="play-player">Adam Reynolds (Conv)</span>
          <span class="play-team">Broncos</span>
        </div>
      </div>`;
    }
    
    if (showPenalties) {
      playsHtml += `
      <div class="play-item">
        <div class="play-time">42'</div>
        <div class="play-icon icon-penalty">P</div>
        <div class="play-desc">
          <span class="play-player">Nathan Cleary (Pen)</span>
          <span class="play-team">Panthers</span>
        </div>
      </div>`;
    }
    
    if (showSinBins) {
      playsHtml += `
      <div class="play-item">
        <div class="play-time">32'</div>
        <div class="play-icon icon-sinbin">SB</div>
        <div class="play-desc">
          <span class="play-player">Jarome Luai (Sin Bin)</span>
          <span class="play-team">Panthers</span>
        </div>
      </div>`;
    }
    
    if (showTries) {
      playsHtml += `
      <div class="play-item">
        <div class="play-time">28'</div>
        <div class="play-icon icon-try">T</div>
        <div class="play-desc">
          <span class="play-player">Brian To'o</span>
          <span class="play-team">Panthers</span>
        </div>
      </div>`;
    }

    this.content.innerHTML = `
      <div class="card">
        <div class="title">${attrs.league || 'NRL'} ${attrs.round ? '- ' + attrs.round : ''}</div>
        <div class="subtitle">${attrs.venue || ''}</div>
        
        <div class="card-content">
          <div class="team">
            <img class="logo" src="${homeLogo}" onerror="this.style.display='none'"/>
            <div class="name">${homeTeam || 'Home'}</div>
          </div>
          
          <div class="score">${homeScore !== undefined ? homeScore : '-'}</div>
          <div class="divider">-</div>
          <div class="score">${awayScore !== undefined ? awayScore : '-'}</div>
          
          <div class="team">
            <img class="logo" src="${awayLogo}" onerror="this.style.display='none'"/>
            <div class="name">${awayTeam || 'Away'}</div>
          </div>
        </div>
        
        <div class="play-clock ${statusClass}">${statusText}</div>

        <div class="details-section ${this.showDetails ? 'expanded' : ''}">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px; text-align: center;">Key Plays</div>
          ${playsHtml}
        </div>
      </div>
    `;
  }

  getCardSize() {
    return this.showDetails ? 4 : 2;
  }

  static getConfigElement() {
    return document.createElement('nrl-score-card-editor');
  }
}

customElements.define('nrl-score-card', NRLScoreCard);

class NRLScoreCardEditor extends HTMLElement {
  setConfig(config) {
    this._config = config;
    if (!this._initialized) {
      this.init();
      this._initialized = true;
    }
    this.updateEditor();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._initialized) {
      this.init();
      this._initialized = true;
    }
    const picker = this.querySelector('ha-entity-picker');
    if (picker) picker.hass = hass;
  }

  init() {
    this.innerHTML = `
      <div class="card-config">
        <ha-entity-picker
          allow-custom-entity
        ></ha-entity-picker>
        <div style="display: flex; flex-direction: column; margin-top: 16px; gap: 8px;">
          <div style="display: flex; align-items: center;">
            <ha-switch id="sw_round"></ha-switch>
            <span style="margin-left: 8px;">Show Entire Round (Game by Game)</span>
          </div>
          <div style="display: flex; align-items: center; border-top: 1px solid var(--divider-color); margin-top: 4px; padding-top: 8px;">
            <ha-switch id="sw_adv"></ha-switch>
            <span style="margin-left: 8px;">Display Advanced Plays</span>
          </div>
          <div id="adv_settings" style="display: none; flex-direction: column; gap: 8px;">
            <div style="display: flex; align-items: center; margin-left: 24px;">
              <ha-switch id="sw_tries"></ha-switch>
              <span style="margin-left: 8px;">Show Tries</span>
            </div>
            <div style="display: flex; align-items: center; margin-left: 24px;">
              <ha-switch id="sw_conv"></ha-switch>
              <span style="margin-left: 8px;">Show Conversions</span>
            </div>
            <div style="display: flex; align-items: center; margin-left: 24px;">
              <ha-switch id="sw_pen"></ha-switch>
              <span style="margin-left: 8px;">Show Penalty Goals</span>
            </div>
            <div style="display: flex; align-items: center; margin-left: 24px;">
              <ha-switch id="sw_sin"></ha-switch>
              <span style="margin-left: 8px;">Show Sin Bins</span>
            </div>
          </div>
        </div>
      </div>
    `;

    const picker = this.querySelector('ha-entity-picker');
    picker.includeDomains = ["sensor"];
    picker.addEventListener('value-changed', (ev) => this.valueChanged('entity', ev.detail.value));

    this.setupSwitch('sw_round', 'show_entire_round', false);
    this.setupSwitch('sw_adv', 'show_advanced_plays', false);
    this.setupSwitch('sw_tries', 'show_event_tries', true);
    this.setupSwitch('sw_conv', 'show_event_conversions', true);
    this.setupSwitch('sw_pen', 'show_event_penalty_goals', true);
    this.setupSwitch('sw_sin', 'show_event_sin_bins', true);
  }

  setupSwitch(id, key, defaultVal) {
    const el = this.querySelector(`#${id}`);
    if (!el) return;
    el.addEventListener('change', (ev) => {
      this.valueChanged(key, ev.target.checked);
    });
  }

  updateEditor() {
    if (!this._config) return;
    
    const picker = this.querySelector('ha-entity-picker');
    if (picker) picker.value = this._config.entity;

    this.updateSwitch('sw_round', 'show_entire_round', false);
    this.updateSwitch('sw_adv', 'show_advanced_plays', false);
    this.updateSwitch('sw_tries', 'show_event_tries', true);
    this.updateSwitch('sw_conv', 'show_event_conversions', true);
    this.updateSwitch('sw_pen', 'show_event_penalty_goals', true);
    this.updateSwitch('sw_sin', 'show_event_sin_bins', true);

    const advSettings = this.querySelector('#adv_settings');
    if (advSettings) {
      advSettings.style.display = this._config.show_advanced_plays === true ? 'flex' : 'none';
    }
  }

  updateSwitch(id, key, defaultVal) {
    const el = this.querySelector(`#${id}`);
    if (el) {
      const val = this._config[key];
      el.checked = val !== undefined ? val : defaultVal;
    }
  }

  valueChanged(key, value) {
    if (this._config[key] === value) return;
    
    const newConfig = { ...this._config };
    newConfig[key] = value;
    this._config = newConfig;

    const event = new CustomEvent('config-changed', {
      detail: { config: newConfig },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }
}
customElements.define('nrl-score-card-editor', NRLScoreCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'nrl-score-card',
  name: 'NRL Score Card',
  preview: true,
  description: 'Custom Lovelace card for displaying NRL matches and key plays.',
});
