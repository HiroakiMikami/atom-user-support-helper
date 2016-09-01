'use babel';

let InteractiveConfigurationPanel = null;
let RandomTipPanel = null;
let isInitialized = false


function initialize() {
  if (isInitialized) return
  atom.themes.requireStylesheet(require.resolve('../styles/user-support-helper.less'));

  isInitialied = true
}

function initializeInteractiveConfiguration() {
  initialize()

  if (InteractiveConfigurationPanel !== null) return ;
  InteractiveConfigurationPanel = require('./interactive-configuration-panel');
}
function initializeRandomTips() {
  initialize()

  if (RandomTipPanel !== null) return;
  RandomTipPanel = require('./random-tip-panel');
}

export default class UserSupportHelper {
  constructor() {
    this.tips = []
  }

  destroy() {
    if (this.configurationPanel !== null) {
      this.configurationPanel.destroy();
    }
    for (const tip of tips) tip.destory()
  }

  getInteractiveConfigurationPanel() {
    initializeInteractiveConfiguration();

    if (!this.configurationPanel) {
      this.configurationPanel = new InteractiveConfigurationPanel()
    }
    return this.configurationPanel;
  }

  createRandomTipPanel(configurationPrefix, words) {
    initializeRandomTips();

    const panel = new RandomTipPanel(configurationPrefix, words);
    this.tips.push(panel)

    return panel;
  }
};
