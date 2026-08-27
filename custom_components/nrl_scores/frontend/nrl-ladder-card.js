class NRLLadderCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      this.innerHTML = `
        <ha-card>
          <div class="card-content" style="padding: 16px;">
            <div id="ladder-container"></div>
          </div>
        </ha-card>
      `;
      this.content = this.querySelector('#ladder-container');
    }
    
    if (!this.config || !this.config.entity) return;
    const stateObj = hass.states[this.config.entity];
    if (!stateObj) {
      this.content.innerHTML = `<div style="color: red;">Entity not found: ${this.config.entity}</div>`;
      return;
    }
    
    const attrs = stateObj.attributes;
    if (!attrs.ladder || attrs.ladder.length === 0) {
      this.content.innerHTML = `<div style="text-align: center; color: var(--secondary-text-color);">No ladder data available.</div>`;
      return;
    }
    
    let html = `
      <style>
        .ladder-table { width: 100%; border-collapse: collapse; text-align: center; font-size: 14px; }
        .ladder-table th { padding: 8px 4px; font-weight: bold; border-bottom: 1px solid var(--divider-color); color: var(--secondary-text-color); }
        .ladder-table td { padding: 8px 4px; border-bottom: 1px solid var(--divider-color); }
        .ladder-team { display: flex; align-items: center; text-align: left; gap: 8px; font-weight: bold; }
        .ladder-logo { width: 24px; height: 24px; object-fit: contain; }
      </style>
      <table class="ladder-table">
        <thead>
          <tr>
            <th style="text-align: left;">Pos</th>
            <th style="text-align: left;">Team</th>
            <th>P</th>
            <th>W</th>
            <th>D</th>
            <th>L</th>
            <th>Diff</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    attrs.ladder.forEach(team => {
      html += `
        <tr>
          <td style="text-align: left;">${team.position}</td>
          <td>
            <div class="ladder-team">
              <img src="${team.logo}" class="ladder-logo" onerror="this.style.display='none'">
              ${team.team}
            </div>
          </td>
          <td>${team.played}</td>
          <td>${team.wins}</td>
          <td>${team.drawn}</td>
          <td>${team.lost}</td>
          <td>${team.diff}</td>
          <td style="font-weight: bold;">${team.points}</td>
        </tr>
      `;
    });
    
    html += `</tbody></table>`;
    this.content.innerHTML = html;
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  getCardSize() {
    return 10;
  }
}

customElements.define('nrl-ladder-card', NRLLadderCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: "nrl-ladder-card",
  name: "NRL Ladder Card",
  description: "A custom card to display the NRL Ladder.",
  preview: true
});
