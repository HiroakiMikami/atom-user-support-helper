'use babel'

let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;
let Tip = null

const defaultWords = {
  confirm: 'Do not show this dialog again',
  close: 'Close',
  next: 'Next',
  previous: 'Previous'
}

const pugDirectory = `${atom.configDirPath}/packages/user-support-helper/pug`;
let panelTemplate = null

let initialized = false
function initialize() {
  if (initialized) return ;

  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;

  Tip = require('./tip');

  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      panelTemplate = pug.compileFile(`${pugDirectory}/random-tip-panel.pug`);
    })
  })
  initialized = true;
}

class RandomTipPanel {
  constructor(configurationPrefix, words) {
    initialize();

    this.configurationPrefix = configurationPrefix;
    this.tips = new Map();

    const html = panelTemplate({ words: words || defaultWords })
    const x = document.createElement('div')
    x.innerHTML = html;
    this.element = x.children[0]
    x.remove();

    this.panel = atom.workspace.addModalPanel({
      item: this.element,
      visible: false
    });

    this.contentDom = this.element.querySelector('.section-container>.container>.content')
    this.previous = this.element.querySelector('.section-container>.section-footer>.tip-previous')
    this.next = this.element.querySelector('.section-container>.section-footer>.tip-next')

    this.close = this.element.querySelector('.section-container>.section-footer>.tip-close')
    this.close.addEventListener('click', () => { this.panel.hide(); })
  }

  destroy() {
    this.panel.destory();
  }

  add(name, content) {
    this.tips.set(name, new Tip(name, content));
  }

  show(filter) {
    const f = atom.config.get(`${this.configurationPrefix}.show-tips`)
    if (f === true) return ;
    this.showForcedly(filter);
  }
  showForcedly(filter) {
    let availableTips = [];
    for (const key of this.tips.keys()) {
      if (filter !== undefined && !filter(key)) continue ;
      availableTips.push(this.tips.get(key))
    }

    const tipArray = [];
    let index = -1;

    const showTip = (index) => {
      if (this.contentDom.children.length !== 0) {
        this.contentDom.removeChild(this.contentDom.children[0])
      }

      this.contentDom.appendChild(tipArray[index].getElement())
    }
    const updateButtons = (index) => {
      this.previous.removeAttribute('disabled');
      this.next.removeAttribute('disabled');
      if (index <= 0) {
        this.previous.setAttribute('disabled', 'true')
      }
      if (availableTips.length === 0 && tipArray[index + 1] === undefined) {
        this.next.setAttribute('disabled', 'true')
      }
    }

    const previousHandler = () => {
      index -= 1;

      updateButtons(index);
      showTip(index);
    }
    const nextHandler = () => {
      index += 1;
      if (tipArray[index] === undefined) {
        // Generate new tip
        const i = parseInt(Math.random() * availableTips.length)
        const tip = availableTips[i];
        tipArray[index] = tip

        availableTips.splice(i, 1)
      }

      updateButtons(index);
      showTip(index);
    }

    // Set event handlers
    this.next.addEventListener('click', nextHandler);
    this.previous.addEventListener('click', previousHandler);
    const disposable = this.panel.onDidChangeVisible((visible) => {
      if (visible) return ;

      this.next.removeEventListener('click', nextHandler)
      this.previous.removeEventListener('click', previousHandler);

      atom.config.set(
        `${this.configurationPrefix}.show-tips`,
        this.element.querySelector('.section-container>.section-footer .confirm').checked || false
      )

      disposable.dispose();
    })

    // Prepare the first tip
    nextHandler();

    this.panel.show();
  }
}

export default RandomTipPanel
