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
  }

  createCard() {
    const card = document.createElement('ha-card');
    card.style.padding = '16px';
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      this.showDetails = !this.showDetails;
      this.updateCard();
    });

    this.content = document.createElement('div');
    
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      .nrl-score-wrapper {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: var(--secondary-text-color);
        text-transform: uppercase;
        font-weight: bold;
      }
      .teams-container {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .team-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .team-logo {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
      .team-name {
        flex: 1;
        font-size: 18px;
        font-weight: 500;
        color: var(--primary-text-color);
      }
      .team-score {
        font-size: 20px;
        font-weight: bold;
        color: var(--primary-text-color);
      }
      .status-in {
        color: var(--accent-color, #ff9800);
        animation: pulse 2s infinite;
      }
      @keyframes pulse {
        0% { opacity: 1; }
        50% { opacity: 0.6; }
        100% { opacity: 1; }
      }
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
      .play-time {
        font-weight: bold;
        color: var(--secondary-text-color);
        width: 30px;
      }
      .play-icon {
        width: 24px;
        height: 24px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 12px;
        font-weight: bold;
      }
      .icon-try { background-color: #4CAF50; }
      .icon-goal { background-color: #2196F3; }
      .icon-penalty { background-color: #FF9800; }
      .icon-sinbin { background-color: #F44336; }
      
      .play-desc {
        display: flex;
        flex-direction: column;
      }
      .play-player {
        font-size: 14px;
        font-weight: 500;
      }
      .play-team {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
    `;

    card.appendChild(this.styleEl);
    card.appendChild(this.content);
    this.shadowRoot.appendChild(card);
  }

  updateCard() {
    if (!this._hass || !this.config) return;
    const entityId = this.config.entity;
    const stateObj = this._hass.states[entityId];

    if (!stateObj) {
      this.content.innerHTML = `<div class="error">Entity not found: ${entityId}</div>`;
      return;
    }

    const attrs = stateObj.attributes;
    const isHome = attrs.team_homeaway === 'home';
    const matchState = stateObj.state;
    
    let statusText = 'Upcoming';
    let statusClass = '';
    if (matchState === 'IN') {
      statusText = attrs.clock || 'Live';
      statusClass = 'status-in';
    } else if (matchState === 'POST') {
      statusText = 'Final';
    }

    let homeTeam = isHome ? attrs.team_name : attrs.opponent_name;
    let homeLogo = isHome ? attrs.team_logo : attrs.opponent_logo;
    let homeScore = isHome ? attrs.team_score : attrs.opponent_score;

    let awayTeam = !isHome ? attrs.team_name : attrs.opponent_name;
    let awayLogo = !isHome ? attrs.team_logo : attrs.opponent_logo;
    let awayScore = !isHome ? attrs.team_score : attrs.opponent_score;

    const showTries = this.config.show_event_tries !== false;
    const showSinBins = this.config.show_event_sin_bins !== false;
    const showPenalties = this.config.show_event_penalty_goals !== false;
    const showConversions = this.config.show_event_conversions !== false;

    let playsHtml = '';
    
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

    const showEntireRound = this.config.show_entire_round === true;

    let matchHtml = '';
    
    if (showEntireRound && attrs.round_fixtures && attrs.round_fixtures.length > 0) {
      matchHtml = attrs.round_fixtures.map(f => {
        let fStatus = 'Upcoming';
        let fClass = '';
        if (f.match_mode === 'Live') {
          fStatus = f.game_time || 'Live';
          fClass = 'status-in';
        } else if (f.match_mode === 'Post') {
          fStatus = 'Final';
        }
        return `
          <div class="header-row" style="margin-top: 12px; border-top: 1px solid var(--divider-color); padding-top: 12px;">
            <span class="${fClass}">${fStatus}</span>
          </div>
          <div class="team-row">
            <img src="https://www.nrl.com/.theme/${f.home_theme}/badge.svg" class="team-logo" onerror="this.style.display='none'"/>
            <span class="team-name">${f.home_team}</span>
            <span class="team-score">${f.home_score !== undefined ? f.home_score : '-'}</span>
          </div>
          <div class="team-row">
            <img src="https://www.nrl.com/.theme/${f.away_theme}/badge.svg" class="team-logo" onerror="this.style.display='none'"/>
            <span class="team-name">${f.away_team}</span>
            <span class="team-score">${f.away_score !== undefined ? f.away_score : '-'}</span>
          </div>
        `;
      }).join('');
    } else {
      matchHtml = `
          <div class="team-row">
            <img src="${homeLogo}" class="team-logo" onerror="this.style.display='none'"/>
            <span class="team-name">${homeTeam || 'Home'}</span>
            <span class="team-score">${homeScore !== undefined ? homeScore : '-'}</span>
          </div>
          <div class="team-row">
            <img src="${awayLogo}" class="team-logo" onerror="this.style.display='none'"/>
            <span class="team-name">${awayTeam || 'Away'}</span>
            <span class="team-score">${awayScore !== undefined ? awayScore : '-'}</span>
          </div>
      `;
    }

    this.content.innerHTML = `
      <div class="nrl-score-wrapper">
        <div class="header-row">
          <span class="${showEntireRound ? '' : statusClass}">${showEntireRound ? 'Entire Round' : statusText}</span>
          <span>${attrs.league || 'NRL'} ${attrs.round ? '- ' + attrs.round : ''}</span>
        </div>
        
        <div class="teams-container">
          ${matchHtml}
        </div>

        ${!showEntireRound ? `
        <div class="details-section ${this.showDetails ? 'expanded' : ''}">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Key Plays (Demo Data)</div>
          ${playsHtml}
        </div>
        ` : ''}
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
    this.render();
  }

  render() {
    if (!this._config || !this._hass) return;
    const showAdv = this._config.show_advanced_plays === true;
    
    this.innerHTML = `
      <div class="card-config">
        <ha-entity-picker
          .hass=${this._hass}
          .value=${this._config.entity}
          .configValue="entity"
          .includeDomains="sensor"
          allow-custom-entity
        ></ha-entity-picker>
        <div style="display: flex; flex-direction: column; margin-top: 16px; gap: 8px;">
          <div style="display: flex; align-items: center;">
            <ha-switch .checked=${this._config.show_entire_round === true} .configValue="show_entire_round" id="sw_round"></ha-switch>
            <span style="margin-left: 8px;">Show Entire Round (Game by Game)</span>
          </div>
          <div style="display: flex; align-items: center; border-top: 1px solid var(--divider-color); margin-top: 4px; padding-top: 8px;">
            <ha-switch .checked=${showAdv} .configValue="show_advanced_plays" id="sw_adv"></ha-switch>
            <span style="margin-left: 8px;">Display Advanced Plays</span>
          </div>
          
          ${showAdv ? `
          <div style="display: flex; align-items: center; margin-left: 24px;">
            <ha-switch .checked=${this._config.show_event_tries !== false} .configValue="show_event_tries" id="sw_tries"></ha-switch>
            <span style="margin-left: 8px;">Show Tries</span>
          </div>
          <div style="display: flex; align-items: center; margin-left: 24px;">
            <ha-switch .checked=${this._config.show_event_conversions !== false} .configValue="show_event_conversions" id="sw_conv"></ha-switch>
            <span style="margin-left: 8px;">Show Conversions</span>
          </div>
          <div style="display: flex; align-items: center; margin-left: 24px;">
            <ha-switch .checked=${this._config.show_event_penalty_goals !== false} .configValue="show_event_penalty_goals" id="sw_pen"></ha-switch>
            <span style="margin-left: 8px;">Show Penalty Goals</span>
          </div>
          <div style="display: flex; align-items: center; margin-left: 24px;">
            <ha-switch .checked=${this._config.show_event_sin_bins !== false} .configValue="show_event_sin_bins" id="sw_sin"></ha-switch>
            <span style="margin-left: 8px;">Show Sin Bins</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
    const picker = this.querySelector('ha-entity-picker');
    if (picker) {
      picker.hass = this._hass;
      picker.value = this._config.entity;
      picker.configValue = 'entity';
      picker.addEventListener('value-changed', this.valueChanged.bind(this));
    }
    
    ['show_entire_round', 'show_advanced_plays', 'show_event_tries', 'show_event_conversions', 'show_event_penalty_goals', 'show_event_sin_bins'].forEach(key => {
      const el = this.querySelector(`[configValue="${key}"]`);
      if (el) {
        if (key === 'show_advanced_plays' || key === 'show_entire_round') {
          el.checked = this._config[key] === true;
        } else {
          el.checked = this._config[key] !== false;
        }
        el.configValue = key;
        el.addEventListener('change', this.valueChanged.bind(this));
      }
    });
  }

  valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    if (!target.configValue) return;
    
    let newValue = target.checked !== undefined ? target.checked : target.value;
    
    if (this._config[target.configValue] === newValue) return;
    
    if (newValue === '' && target.checked === undefined) {
      const tmpConfig = { ...this._config };
      delete tmpConfig[target.configValue];
      this._config = tmpConfig;
    } else {
      this._config = {
        ...this._config,
        [target.configValue]: newValue,
      };
    }
    
    const event = new CustomEvent('config-changed', {
      detail: { config: this._config },
      bubbles: true,
      composed: true,
    });
    this.dispatchEvent(event);
  }

  set hass(hass) {
    this._hass = hass;
    this.render();
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
