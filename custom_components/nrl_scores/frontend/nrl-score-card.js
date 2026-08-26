class NRLScoreCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.showDetails = false;
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

    // Advanced plays mockup data (until integration provides it)
    const playsHtml = `
      <div class="play-item">
        <div class="play-time">58'</div>
        <div class="play-icon icon-try">T</div>
        <div class="play-desc">
          <span class="play-player">Reece Walsh</span>
          <span class="play-team">Broncos</span>
        </div>
      </div>
      <div class="play-item">
        <div class="play-time">59'</div>
        <div class="play-icon icon-goal">G</div>
        <div class="play-desc">
          <span class="play-player">Adam Reynolds (Conv)</span>
          <span class="play-team">Broncos</span>
        </div>
      </div>
      <div class="play-item">
        <div class="play-time">42'</div>
        <div class="play-icon icon-penalty">P</div>
        <div class="play-desc">
          <span class="play-player">Nathan Cleary (Pen)</span>
          <span class="play-team">Panthers</span>
        </div>
      </div>
      <div class="play-item">
        <div class="play-time">28'</div>
        <div class="play-icon icon-try">T</div>
        <div class="play-desc">
          <span class="play-player">Brian To'o</span>
          <span class="play-team">Panthers</span>
        </div>
      </div>
    `;

    this.content.innerHTML = `
      <div class="nrl-score-wrapper">
        <div class="header-row">
          <span class="${statusClass}">${statusText}</span>
          <span>${attrs.league || 'NRL'}</span>
        </div>
        
        <div class="teams-container">
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
        </div>

        <div class="details-section ${this.showDetails ? 'expanded' : ''}">
          <div style="font-size: 14px; font-weight: bold; margin-bottom: 8px;">Key Plays (Demo Data)</div>
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
    this.render();
  }

  render() {
    if (!this._config || !this._hass) return;
    this.innerHTML = `
      <div class="card-config">
        <ha-entity-picker
          .hass=${this._hass}
          .value=${this._config.entity}
          .configValue="entity"
          .includeDomains="sensor"
          @value-changed=${this.valueChanged}
          allow-custom-entity
        ></ha-entity-picker>
      </div>
    `;
    const picker = this.querySelector('ha-entity-picker');
    if (picker) {
      picker.hass = this._hass;
      picker.value = this._config.entity;
      picker.configValue = 'entity';
      picker.addEventListener('value-changed', this.valueChanged.bind(this));
    }
  }

  valueChanged(ev) {
    if (!this._config || !this._hass) return;
    const target = ev.target;
    if (this._config[target.configValue] === target.value) return;
    if (target.configValue) {
      if (target.value === '') {
        const tmpConfig = { ...this._config };
        delete tmpConfig[target.configValue];
        this._config = tmpConfig;
      } else {
        this._config = {
          ...this._config,
          [target.configValue]: target.checked !== undefined ? target.checked : target.value,
        };
      }
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
