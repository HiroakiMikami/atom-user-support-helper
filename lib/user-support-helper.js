'use babel';

let InteractiveConfigurationPanel = null;

export default {
  initialize() {
    if (InteractiveConfigurationPanel !== null) return ;

    InteractiveConfigurationPanel = require('./interactive-configuration-panel');
    this.configurationPanel = new InteractiveConfigurationPanel();
  },

  activate(state) { },

  provideUserSupportHelper() { return this; },

  deactivate() {
    if (this.configurationPanel !== null) {
      this.configurationPanel.destroy();
    }
  },

  serialize() {
    return { };
  },

  getInteractiveConfigurationPanel() {
    this.initialize();
    return this.configurationPanel;
  }
};
