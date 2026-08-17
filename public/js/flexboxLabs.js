// Neo Flexbox Labs - Interactive CSS Flexbox Visual Playground & Component Engine
// Inspired by prazzon/flexbox-labs with Neo-Brutalist Terminal Aesthetics

export class FlexboxLabs {
  constructor(containerId = 'neo-flex-playground') {
    this.containerId = containerId;
    this.history = [];
    this.historyIndex = -1;

    // Default container state
    this.containerState = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignContent: 'stretch',
      gap: 16,
      gapUnit: 'px',
    };

    // Default items
    this.items = [
      { id: 1, text: 'BNB Agent #1', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Rebalancing' },
      { id: 2, text: 'BNB Agent #2', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Grid Trading' },
      { id: 3, text: 'BNB Agent #3', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Yield Optimisation' },
      { id: 4, text: 'BNB Agent #4', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Health Factor' },
    ];

    this.selectedItemId = null;
    this.activeTab = 'container'; // 'container' | 'items' | 'templates' | 'code'
    this.saveState();
  }

  saveState() {
    // Truncate redo states
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push({
      container: { ...this.containerState },
      items: JSON.parse(JSON.stringify(this.items)),
      selectedItemId: this.selectedItemId,
    });
    this.historyIndex = this.history.length - 1;
    this.updateToolbarState();
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      const state = this.history[this.historyIndex];
      this.containerState = { ...state.container };
      this.items = JSON.parse(JSON.stringify(state.items));
      this.selectedItemId = state.selectedItemId;
      this.render();
      this.updateToolbarState();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      const state = this.history[this.historyIndex];
      this.containerState = { ...state.container };
      this.items = JSON.parse(JSON.stringify(state.items));
      this.selectedItemId = state.selectedItemId;
      this.render();
      this.updateToolbarState();
    }
  }

  updateToolbarState() {
    const undoBtn = document.getElementById('flex-undo-btn');
    const redoBtn = document.getElementById('flex-redo-btn');
    const delBtn = document.getElementById('flex-delete-btn');
    const dupBtn = document.getElementById('flex-dup-btn');

    if (undoBtn) undoBtn.disabled = this.historyIndex <= 0;
    if (redoBtn) redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    if (delBtn) delBtn.disabled = !this.selectedItemId || this.items.length <= 1;
    if (dupBtn) dupBtn.disabled = !this.selectedItemId;
  }

  addItem() {
    const nextId = this.items.length ? Math.max(...this.items.map(i => i.id)) + 1 : 1;
    const categories = ['Rebalancing', 'Grid Trading', 'Yield Optimisation', 'Health Factor', 'Arbitrage', 'DEX Router'];
    const cat = categories[(nextId - 1) % categories.length];
    
    this.items.push({
      id: nextId,
      text: `BNB Agent #${nextId}`,
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
      alignSelf: 'auto',
      order: 0,
      width: 160,
      height: 130,
      category: cat,
    });
    this.selectedItemId = nextId;
    this.saveState();
    this.render();
  }

  duplicateItem() {
    if (!this.selectedItemId) return;
    const item = this.items.find(i => i.id === this.selectedItemId);
    if (!item) return;

    const nextId = Math.max(...this.items.map(i => i.id)) + 1;
    const clone = { ...item, id: nextId, text: `${item.text} (Copy)` };
    this.items.push(clone);
    this.selectedItemId = nextId;
    this.saveState();
    this.render();
  }

  deleteItem() {
    if (!this.selectedItemId || this.items.length <= 1) return;
    this.items = this.items.filter(i => i.id !== this.selectedItemId);
    this.selectedItemId = this.items.length ? this.items[0].id : null;
    this.saveState();
    this.render();
  }

  reset() {
    this.containerState = {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: 'center',
      alignContent: 'stretch',
      gap: 16,
      gapUnit: 'px',
    };
    this.items = [
      { id: 1, text: 'BNB Agent #1', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Rebalancing' },
      { id: 2, text: 'BNB Agent #2', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Grid Trading' },
      { id: 3, text: 'BNB Agent #3', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Yield Optimisation' },
      { id: 4, text: 'BNB Agent #4', flexGrow: 0, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 0, width: 160, height: 130, category: 'Health Factor' },
    ];
    this.selectedItemId = null;
    this.saveState();
    this.render();
  }

  cycleDirection() {
    const dirs = ['row', 'column', 'row-reverse', 'column-reverse'];
    const curIdx = dirs.indexOf(this.containerState.flexDirection);
    this.containerState.flexDirection = dirs[(curIdx + 1) % dirs.length];
    this.saveState();
    this.render();
  }

  getPointerRotation() {
    switch (this.containerState.flexDirection) {
      case 'row': return 0;
      case 'column': return 90;
      case 'row-reverse': return 180;
      case 'column-reverse': return 270;
      default: return 0;
    }
  }

  applyTemplate(templateName) {
    switch (templateName) {
      case 'marketplace':
        this.containerState = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'stretch', alignContent: 'flex-start', gap: 16, gapUnit: 'px' };
        this.items = [
          { id: 1, text: '⚖️ Rebalancing Agent', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 1, width: 220, height: 140, category: 'Automated LP' },
          { id: 2, text: '📊 Grid Trading Agent', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 2, width: 220, height: 140, category: 'Orderbook' },
          { id: 3, text: '🚀 Yield Optimizer', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 3, width: 220, height: 140, category: 'Lending APR' },
          { id: 4, text: '🛡️ Health Factor Sentinel', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 4, width: 220, height: 140, category: 'Liquidation Guard' },
        ];
        break;
      case 'navbar':
        this.containerState = { display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'center', alignContent: 'stretch', gap: 12, gapUnit: 'px' };
        this.items = [
          { id: 1, text: '⚡ Logo Brand', flexGrow: 0, flexShrink: 0, flexBasis: '180px', alignSelf: 'auto', order: 1, width: 180, height: 50, category: 'Brand' },
          { id: 2, text: '🔗 Navigation Links', flexGrow: 1, flexShrink: 1, flexBasis: 'auto', alignSelf: 'auto', order: 2, width: 260, height: 50, category: 'Menu' },
          { id: 3, text: '🚀 Connect Wallet', flexGrow: 0, flexShrink: 0, flexBasis: '140px', alignSelf: 'auto', order: 3, width: 140, height: 50, category: 'CTA' },
        ];
        break;
      case 'bento':
        this.containerState = { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'stretch', alignContent: 'stretch', gap: 16, gapUnit: 'px' };
        this.items = [
          { id: 1, text: '🏆 Featured Track ($30k)', flexGrow: 2, flexShrink: 1, flexBasis: '400px', alignSelf: 'auto', order: 1, width: 400, height: 200, category: 'Main Studio' },
          { id: 2, text: '⚡ TermiX Report ($10k)', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 2, width: 220, height: 200, category: 'Benchmark' },
          { id: 3, text: '🔑 Altana Keys (50k XP)', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 3, width: 220, height: 160, category: 'Session Keys' },
          { id: 4, text: '🥞 PancakeSwap (1k CAKE)', flexGrow: 1, flexShrink: 1, flexBasis: '220px', alignSelf: 'auto', order: 4, width: 220, height: 160, category: 'DEX Router' },
          { id: 5, text: '📡 pgbot PostgreSQL Metrics', flexGrow: 2, flexShrink: 1, flexBasis: '380px', alignSelf: 'auto', order: 5, width: 380, height: 160, category: 'Telemetry' },
        ];
        break;
      case 'holygrail':
        this.containerState = { display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', justifyContent: 'space-between', alignItems: 'stretch', alignContent: 'stretch', gap: 12, gapUnit: 'px' };
        this.items = [
          { id: 1, text: 'Header Bar', flexGrow: 0, flexShrink: 0, flexBasis: '60px', alignSelf: 'auto', order: 1, width: '100%', height: 60, category: 'Top' },
          { id: 2, text: 'Main Body Content', flexGrow: 1, flexShrink: 1, flexBasis: '240px', alignSelf: 'auto', order: 2, width: '100%', height: 240, category: 'Core' },
          { id: 3, text: 'Footer Status Bar', flexGrow: 0, flexShrink: 0, flexBasis: '50px', alignSelf: 'auto', order: 3, width: '100%', height: 50, category: 'Bottom' },
        ];
        break;
    }
    this.saveState();
    this.render();
  }

  generateCSS() {
    const c = this.containerState;
    return `.neo-flex-container {
  display: ${c.display};
  flex-direction: ${c.flexDirection};
  flex-wrap: ${c.flexWrap};
  justify-content: ${c.justifyContent};
  align-items: ${c.alignItems};
  align-content: ${c.alignContent};
  gap: ${c.gap}${c.gapUnit};
}

${this.items.map((item, idx) => `.neo-flex-item-${item.id} {
  flex-grow: ${item.flexGrow};
  flex-shrink: ${item.flexShrink};
  flex-basis: ${item.flexBasis};
  align-self: ${item.alignSelf};
  order: ${item.order};
}`).join('\n\n')}`;
  }

  generateHTML() {
    return `<div class="neo-flex-container">
${this.items.map(item => `  <div class="neo-flex-item neo-flex-item-${item.id}">
    <h3>${item.text}</h3>
    <span class="badge">${item.category}</span>
  </div>`).join('\n')}
</div>`;
  }

  render() {
    const wrapper = document.getElementById(this.containerId);
    if (!wrapper) return;

    const selectedItem = this.items.find(i => i.id === this.selectedItemId);
    const rotation = this.getPointerRotation();

    wrapper.innerHTML = `
      <div class="neo-flex-lab-shell">
        <!-- SIDEBAR CONTROLS (Left Panel) -->
        <aside class="neo-flex-sidebar">
          <div class="neo-sidebar-tabs">
            <button class="neo-tab-btn ${this.activeTab === 'container' ? 'active' : ''}" data-tab="container">
              <span>📐 Container</span>
            </button>
            <button class="neo-tab-btn ${this.activeTab === 'items' ? 'active' : ''}" data-tab="items">
              <span>📦 Items (${this.selectedItemId ? '#' + this.selectedItemId : 'Select'})</span>
            </button>
            <button class="neo-tab-btn ${this.activeTab === 'templates' ? 'active' : ''}" data-tab="templates">
              <span>✨ Presets</span>
            </button>
            <button class="neo-tab-btn ${this.activeTab === 'code' ? 'active' : ''}" data-tab="code">
              <span>💻 Code</span>
            </button>
          </div>

          <div class="neo-sidebar-body">
            ${this.activeTab === 'container' ? this.renderContainerControls() : ''}
            ${this.activeTab === 'items' ? this.renderItemControls(selectedItem) : ''}
            ${this.activeTab === 'templates' ? this.renderTemplates() : ''}
            ${this.activeTab === 'code' ? this.renderCodeExport() : ''}
          </div>
        </aside>

        <!-- MAIN PLAYGROUND CANVAS (Center Panel) -->
        <section class="neo-flex-canvas-wrapper">
          <!-- Canvas Top Toolbar -->
          <div class="neo-canvas-toolbar">
            <div class="neo-toolbar-left">
              <button class="neo-tool-btn" id="flex-add-btn" title="Add Flex Item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                <span>Add Item</span>
              </button>
              <button class="neo-tool-btn" id="flex-dup-btn" title="Duplicate Selected Item" ${!this.selectedItemId ? 'disabled' : ''}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Duplicate</span>
              </button>
              <button class="neo-tool-btn neo-tool-danger" id="flex-delete-btn" title="Delete Selected Item" ${!this.selectedItemId || this.items.length <= 1 ? 'disabled' : ''}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                <span>Delete</span>
              </button>
              <button class="neo-tool-btn" id="flex-reset-btn" title="Reset Layout">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                <span>Reset</span>
              </button>
            </div>

            <div class="neo-toolbar-right">
              <!-- Main Axis Indicator Button -->
              <button class="neo-axis-btn" id="flex-axis-btn" title="Click to cycle Flex Direction (Current: ${this.containerState.flexDirection})">
                <span class="neo-axis-label">Main Axis:</span>
                <span class="neo-axis-arrow" style="transform: rotate(${rotation}deg);">➔</span>
                <span class="neo-axis-name">${this.containerState.flexDirection}</span>
              </button>

              <button class="neo-tool-btn" id="flex-undo-btn" title="Undo" ${this.historyIndex <= 0 ? 'disabled' : ''}>↶</button>
              <button class="neo-tool-btn" id="flex-redo-btn" title="Redo" ${this.historyIndex >= this.history.length - 1 ? 'disabled' : ''}>↷</button>
            </div>
          </div>

          <!-- Interactive Flex View Container -->
          <div class="neo-canvas-stage">
            <div 
              class="neo-live-flex-box" 
              id="neo-live-box"
              style="
                display: ${this.containerState.display};
                flex-direction: ${this.containerState.flexDirection};
                flex-wrap: ${this.containerState.flexWrap};
                justify-content: ${this.containerState.justifyContent};
                align-items: ${this.containerState.alignItems};
                align-content: ${this.containerState.alignContent};
                gap: ${this.containerState.gap}${this.containerState.gapUnit};
              "
            >
              ${this.items.map(item => `
                <div 
                  class="neo-item-card ${item.id === this.selectedItemId ? 'is-selected' : ''}" 
                  data-item-id="${item.id}"
                  tabindex="0"
                  style="
                    flex-grow: ${item.flexGrow};
                    flex-shrink: ${item.flexShrink};
                    flex-basis: ${item.flexBasis};
                    align-self: ${item.alignSelf};
                    order: ${item.order};
                    min-width: ${typeof item.width === 'number' ? item.width + 'px' : item.width};
                    min-height: ${typeof item.height === 'number' ? item.height + 'px' : item.height};
                  "
                >
                  <div class="neo-item-header">
                    <span class="neo-item-tag">#${item.id}</span>
                    <span class="neo-item-cat">${item.category || 'Agent'}</span>
                  </div>
                  <div class="neo-item-content">
                    <div class="neo-item-title" contenteditable="true" data-edit-id="${item.id}">${item.text}</div>
                  </div>
                  <div class="neo-item-footer">
                    <span>grow:${item.flexGrow}</span>
                    <span>shrink:${item.flexShrink}</span>
                    <span>self:${item.alignSelf}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </section>
      </div>
    `;

    this.bindEvents();
  }

  renderContainerControls() {
    const c = this.containerState;
    return `
      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">display</label>
        <div class="neo-select-grid">
          ${['flex', 'inline-flex'].map(val => `
            <button class="neo-chip ${c.display === val ? 'selected' : ''}" data-prop="display" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">flex-direction</label>
        <div class="neo-select-grid">
          ${['row', 'row-reverse', 'column', 'column-reverse'].map(val => `
            <button class="neo-chip ${c.flexDirection === val ? 'selected' : ''}" data-prop="flexDirection" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">flex-wrap</label>
        <div class="neo-select-grid">
          ${['nowrap', 'wrap', 'wrap-reverse'].map(val => `
            <button class="neo-chip ${c.flexWrap === val ? 'selected' : ''}" data-prop="flexWrap" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">justify-content (Main Axis)</label>
        <div class="neo-select-grid">
          ${['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(val => `
            <button class="neo-chip ${c.justifyContent === val ? 'selected' : ''}" data-prop="justifyContent" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">align-items (Cross Axis)</label>
        <div class="neo-select-grid">
          ${['stretch', 'flex-start', 'center', 'flex-end', 'baseline'].map(val => `
            <button class="neo-chip ${c.alignItems === val ? 'selected' : ''}" data-prop="alignItems" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">align-content (Multi-line)</label>
        <div class="neo-select-grid">
          ${['stretch', 'flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map(val => `
            <button class="neo-chip ${c.alignContent === val ? 'selected' : ''}" data-prop="alignContent" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <div class="neo-flex-row-between">
          <label class="neo-ctrl-label">gap</label>
          <span class="neo-value-badge">${c.gap}${c.gapUnit}</span>
        </div>
        <input type="range" class="neo-slider" min="0" max="64" value="${c.gap}" id="flex-gap-slider">
      </div>
    `;
  }

  renderItemControls(item) {
    if (!item) {
      return `
        <div class="neo-empty-notice">
          <p>👉 Click on any Flex Item in the canvas to adjust its individual properties (grow, shrink, basis, align-self, order).</p>
        </div>
      `;
    }

    return `
      <div class="neo-item-meta-banner">
        <strong>Item #${item.id}</strong> — <span>${item.text}</span>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">flex-grow (${item.flexGrow})</label>
        <div class="neo-select-grid">
          ${[0, 1, 2, 3].map(val => `
            <button class="neo-chip ${item.flexGrow === val ? 'selected' : ''}" data-item-prop="flexGrow" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">flex-shrink (${item.flexShrink})</label>
        <div class="neo-select-grid">
          ${[0, 1, 2].map(val => `
            <button class="neo-chip ${item.flexShrink === val ? 'selected' : ''}" data-item-prop="flexShrink" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">flex-basis</label>
        <div class="neo-select-grid">
          ${['auto', '0', '150px', '220px', '50%'].map(val => `
            <button class="neo-chip ${item.flexBasis === val ? 'selected' : ''}" data-item-prop="flexBasis" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">align-self</label>
        <div class="neo-select-grid">
          ${['auto', 'flex-start', 'center', 'flex-end', 'stretch', 'baseline'].map(val => `
            <button class="neo-chip ${item.alignSelf === val ? 'selected' : ''}" data-item-prop="alignSelf" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>

      <div class="neo-ctrl-group">
        <label class="neo-ctrl-label">order (${item.order})</label>
        <div class="neo-select-grid">
          ${[-1, 0, 1, 2, 3].map(val => `
            <button class="neo-chip ${item.order === val ? 'selected' : ''}" data-item-prop="order" data-val="${val}">${val}</button>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderTemplates() {
    return `
      <div class="neo-templates-list">
        <div class="neo-tpl-card" data-template="marketplace">
          <h4>🏆 BNB Agent Marketplace Grid</h4>
          <p>4-column responsive wrap with flex-basis 220px.</p>
        </div>
        <div class="neo-tpl-card" data-template="navbar">
          <h4>⚡ Header Navigation Bar</h4>
          <p>Logo on left, links in middle, CTA button on right.</p>
        </div>
        <div class="neo-tpl-card" data-template="bento">
          <h4>🍱 Bento Dashboard Layout</h4>
          <p>Multi-ratio bento cards with dynamic flex-grow.</p>
        </div>
        <div class="neo-tpl-card" data-template="holygrail">
          <h4>🏛️ Holy Grail App Shell</h4>
          <p>Header, dynamic body viewport, and status footer.</p>
        </div>
      </div>
    `;
  }

  renderCodeExport() {
    const css = this.generateCSS();
    const html = this.generateHTML();

    return `
      <div class="neo-code-view">
        <div class="neo-code-header">
          <span>CSS GENERATED</span>
          <button class="neo-btn-copy" id="copy-css-btn">📋 Copy CSS</button>
        </div>
        <pre class="neo-code-block"><code>${css}</code></pre>

        <div class="neo-code-header" style="margin-top:12px;">
          <span>HTML STRUCTURE</span>
          <button class="neo-btn-copy" id="copy-html-btn">📋 Copy HTML</button>
        </div>
        <pre class="neo-code-block"><code>${html.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>
      </div>
    `;
  }

  bindEvents() {
    const wrapper = document.getElementById(this.containerId);
    if (!wrapper) return;

    // Tabs
    wrapper.querySelectorAll('.neo-tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.activeTab = e.currentTarget.dataset.tab;
        this.render();
      });
    });

    // Toolbar buttons
    const addBtn = wrapper.querySelector('#flex-add-btn');
    if (addBtn) addBtn.addEventListener('click', () => this.addItem());

    const dupBtn = wrapper.querySelector('#flex-dup-btn');
    if (dupBtn) dupBtn.addEventListener('click', () => this.duplicateItem());

    const delBtn = wrapper.querySelector('#flex-delete-btn');
    if (delBtn) delBtn.addEventListener('click', () => this.deleteItem());

    const resetBtn = wrapper.querySelector('#flex-reset-btn');
    if (resetBtn) resetBtn.addEventListener('click', () => this.reset());

    const axisBtn = wrapper.querySelector('#flex-axis-btn');
    if (axisBtn) axisBtn.addEventListener('click', () => this.cycleDirection());

    const undoBtn = wrapper.querySelector('#flex-undo-btn');
    if (undoBtn) undoBtn.addEventListener('click', () => this.undo());

    const redoBtn = wrapper.querySelector('#flex-redo-btn');
    if (redoBtn) redoBtn.addEventListener('click', () => this.redo());

    // Container property chips
    wrapper.querySelectorAll('[data-prop]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const prop = e.currentTarget.dataset.prop;
        const val = e.currentTarget.dataset.val;
        this.containerState[prop] = val;
        this.saveState();
        this.render();
      });
    });

    // Item property chips
    wrapper.querySelectorAll('[data-item-prop]').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (!this.selectedItemId) return;
        const prop = e.currentTarget.dataset.itemProp;
        let val = e.currentTarget.dataset.val;
        if (prop === 'flexGrow' || prop === 'flexShrink' || prop === 'order') {
          val = parseInt(val, 10);
        }
        const item = this.items.find(i => i.id === this.selectedItemId);
        if (item) {
          item[prop] = val;
          this.saveState();
          this.render();
        }
      });
    });

    // Gap slider
    const gapSlider = wrapper.querySelector('#flex-gap-slider');
    if (gapSlider) {
      gapSlider.addEventListener('input', (e) => {
        this.containerState.gap = parseInt(e.target.value, 10);
        const liveBox = wrapper.querySelector('#neo-live-box');
        if (liveBox) {
          liveBox.style.gap = `${this.containerState.gap}${this.containerState.gapUnit}`;
        }
      });
      gapSlider.addEventListener('change', () => {
        this.saveState();
        this.render();
      });
    }

    // Select Item Card
    wrapper.querySelectorAll('.neo-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.dataset.itemId, 10);
        this.selectedItemId = id;
        this.activeTab = 'items';
        this.render();
      });
    });

    // Inline edit item text
    wrapper.querySelectorAll('[data-edit-id]').forEach(editable => {
      editable.addEventListener('blur', (e) => {
        const id = parseInt(e.currentTarget.dataset.editId, 10);
        const item = this.items.find(i => i.id === id);
        if (item) {
          item.text = e.currentTarget.innerText.trim() || `BNB Agent #${id}`;
          this.saveState();
        }
      });
      editable.addEventListener('click', (e) => e.stopPropagation());
    });

    // Templates
    wrapper.querySelectorAll('[data-template]').forEach(tpl => {
      tpl.addEventListener('click', (e) => {
        const tplName = e.currentTarget.dataset.template;
        this.applyTemplate(tplName);
      });
    });

    // Copy buttons
    const copyCssBtn = wrapper.querySelector('#copy-css-btn');
    if (copyCssBtn) {
      copyCssBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.generateCSS());
        copyCssBtn.textContent = '✅ Copied CSS!';
        setTimeout(() => copyCssBtn.textContent = '📋 Copy CSS', 2000);
      });
    }

    const copyHtmlBtn = wrapper.querySelector('#copy-html-btn');
    if (copyHtmlBtn) {
      copyHtmlBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(this.generateHTML());
        copyHtmlBtn.textContent = '✅ Copied HTML!';
        setTimeout(() => copyHtmlBtn.textContent = '📋 Copy HTML', 2000);
      });
    }
  }
}
