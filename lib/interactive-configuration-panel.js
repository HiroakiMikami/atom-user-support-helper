'use babel';

let Promise = null;
let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;
let Emitter = null

let PromptView = null;
let PUG_DIRECTORY_PATH = null;

let panelHtml = null;

let initialized = false;
function initialize() {
  if (initialized) return ;

  Promise = require('bluebird');
  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;
  Emitter = require('atom').Emitter

  PUG_DIRECTORY_PATH = require("./constants").PUG_DIRECTORY_PATH
  PromptView = require('./prompt-view');

  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      panelHtml = pug.compileFile(`${PUG_DIRECTORY_PATH}/interactive-configuration-panel.pug`);
    })
  });

  initialized = true;
}

class InteractiveConfigurationPanel {
  constructor() {
    initialize();

    this.emitter = new Emitter()

    const x = document.createElement('div');
    x.innerHTML = panelHtml();
    const item = x.children[0]
    x.remove();

    this.panel = atom.workspace.addModalPanel({
      item: item,
      visible: false
    });
    this.closeIcon = item.querySelector('.section-container>.container>.row>.close-icon');
    this.contentDom = item.querySelector('.section-container>.container>div.content');

    this.prompts = new Map();
  }

  destroy() {
    this.panel.destroy();
    this.emitter.dispose();
  }

  add(id, prompt, words) {
    this.prompts.set(id, new PromptView(prompt, words));
  }

  show(configs) {
    if ((typeof configs) === 'function') {
      const nextConfig = configs;
      const configValues = new Map();

      return new Promise((resolve, reject) => {
        let isFinished = false

        const nextPrompt = (previousConfigs, config) => {
          const id = config.id
          const optional = config.optional || false
          const finished = config.finished || false
          const promptView = this.prompts.get(id);

          // Obtain the current value
          let value = null
          if (!configValues.has(id)) {
            value = atom.config.get(id);
            configValues.set(id, value)
          } else {
            value = configValues.get(id)
          }

          promptView.updateMenu(optional, finished)
          promptView.updateInput(value, config.choices)

          if (this.contentDom.children.length !== 0) {
            const child = this.contentDom.children[0];
            this.contentDom.removeChild(child)
            child.remove();
          }
          this.contentDom.appendChild(promptView.getElement())

          promptView.activate().then((result) => {
            switch (result.event) {
              case 'back':
                // Back to the previous configuration
                const previousConfig = previousConfigs.pop()
                nextPrompt(previousConfigs, previousConfig)
                break;
              case 'success':
                // Set the value to defaultConfigValues
                configValues.set(id, result.value)
              case 'skip':
                const c = nextConfig(id)
                if (c === null || finished) {
                  // Set values to atom.config
                  for (const key of configValues.keys()) {
                    const value = configValues.get(key)
                    atom.config.set(key, value)
                  }
                  isFinished = true
                  resolve(configValues)

                  // Finish the interactive configuration
                  this.panel.hide()
                } else {
                  // Prepare the next configuration
                  previousConfigs.push(config)
                  nextPrompt(previousConfigs, c)
                }
                break;
            }
          });

          this.emitter.emit("change")
        }

        // Prepare the first configuration
        const c = nextConfig(null)
        if (c === null) {
          resolve()
        } else {
          nextPrompt([], c)
          this.closeIcon.addEventListener('click', () => { this.panel.hide(); })
          this.panel.show();
          const disposable = this.panel.onDidChangeVisible((visible) => {
            if (visible) return ;
            if (!isFinished) {
              reject('canceled')
            }
            // Restore
            disposable.dispose();
          })
        }
      });
    } else {
      const ids = configs
      return this.show((id) => {
        if (id === null || id === undefined) {
          return {
            id: ids[0],
            optional: false,
            finished: (ids.length === 1)
          }
        }
        for (let i = 0; i < ids.length; i++) {
          const id2 = ids[i]
          if (id === id2) {
            return {
              id: ids[i + 1],
              optional: false,
              finished: (i >= (ids.length - 2))
            };
          }
        }
        return null;
      })
    }
  }

  getPanel() { return this.panel; }

  onPromptChanged(callback) {
    return this.emitter.on("change", callback)
  }
}

export default InteractiveConfigurationPanel;
