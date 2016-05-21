'use babel';

let InteractiveConfigurationPanel = null;
let RandomTipPanel = null;

export default {
  tips: [],

  initializeInteractiveConfiguration() {
    if (InteractiveConfigurationPanel !== null) return ;

    InteractiveConfigurationPanel = require('./interactive-configuration-panel');
    this.configurationPanel = new InteractiveConfigurationPanel();
  },
  initializeRandomTips() {
    if (RandomTipPanel !== null) return;
    RandomTipPanel = require('./random-tip-panel');
  },

  activate(state) { },

  provideUserSupportHelper() { return this; },

  deactivate() {
    if (this.configurationPanel !== null) {
      this.configurationPanel.destroy();
    }
    for (const tip of tips) tip.destory()
  },

  serialize() {
    return { };
  },

  getInteractiveConfigurationPanel() {
    this.initializeInteractiveConfiguration();
    return this.configurationPanel;
  },

  createRandomTipPanel(configurationPrefix, words) {
    this.initializeRandomTips();

    const panel = new RandomTipPanel(configurationPrefix, words);
    this.tips.push(panel)

    return panel;
  }
};
