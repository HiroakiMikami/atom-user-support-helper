'use babel'

let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;

let tipTemplate = null

let initialized = false;
function initialize() {
  if (initialized) return ;

  // Initialize the modules
  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;

  // Compile the pug files
  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      tipTemplate = pug.compile(require('../pug/tip.js'))
    })
  });
}

class Tip {
  constructor(name, content) {
    initialize();

    this.name = name;
    this.content = content;

    const tipHtml = tipTemplate({ name: name })
    const x = document.createElement('div')
    x.innerHTML = tipHtml
    this.element = x.children[0]
    x.remove()

    if ((typeof content) === 'string') {
      this.element.querySelector('.section-container>.content').innerHTML = content;
    } else {
      this.element.querySelector('.section-container>.content').appendChild(content);
    }
  }

  destory() {
    this.content.remove();
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}

export default Tip
