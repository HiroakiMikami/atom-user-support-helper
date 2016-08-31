'use babel';

let InteractiveConfigurationPanel = null;
let RandomTipPanel = null;

initializeInteractiveConfiguration() {
  if (InteractiveConfigurationPanel !== null) return ;

  InteractiveConfigurationPanel = require('./interactive-configuration-panel');
}
initializeRandomTips() {
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
    this.initializeInteractiveConfiguration();

    if (!this.configurationPanel) {
      this.configurationPanel = new InteractiveConfigurationPanel()
    }
    return this.configurationPanel;
  },

  createRandomTipPanel(configurationPrefix, words) {
    this.initializeRandomTips();

    const panel = new RandomTipPanel(configurationPrefix, words);
    this.tips.push(panel)

    return panel;
  }
};
