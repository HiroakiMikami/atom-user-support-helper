'use babel';

let InteractiveConfigurationPanel = null;
let RandomTipPanel = null;

function initializeInteractiveConfiguration() {
  if (InteractiveConfigurationPanel !== null) return ;

  InteractiveConfigurationPanel = require('./interactive-configuration-panel');
}
function initializeRandomTips() {
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
