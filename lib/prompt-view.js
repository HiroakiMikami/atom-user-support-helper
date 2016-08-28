'use babel';

let Promise = null;
let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;
let CompositeDisposable
let Disposable
let PromptViewList = null;
let InputInterfaces = null
let PUG_DIRECTORY_PATH = null;

let templates = {};

let initialized = false;
function initialize() {
  if (initialized) return ;

  // Initialize the modules
  Promise = require('bluebird');
  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;
  const atom = require('atom')
  CompositeDisposable = atom.CompositeDisposable
  Disposable = atom.Disposable

  // Initilaize the local modules
  PUG_DIRECTORY_PATH = require("./constants").PUG_DIRECTORY_PATH
  PromptViewList = require('./prompt-view-list')
  InputInterfaces = require('./input-interfaces')

  // Compile the pug files
  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      templates.promptView = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view.pug`);
    })
  });

  initialized = true;
}

const DEFAULT_WORDS = {
  back: "Back",
  skip: "Skip",
  next: "Next",
  finish: "Finish"
}

/**
  * Prompt like {@link https://github.com/SBoudrias/Inquirer.js Inquirer.js}
  */
class PromptView {
  constructor(prompt, words) {
    initialize();

    // TODO: implement 'confirm'
    console.assert(
      prompt.type === 'input' || prompt.type === 'list' ||
      prompt.type === 'dropdown' || prompt.type === 'checkbox'
    );
    // Obtain the parameters from prompt
    this.type = prompt.type;
    this.name = prompt.name || "";
    this.choices = prompt.choices
    this.inputGenerator = InputInterfaces[this.type];
    this.validate = prompt.validate || ((result) => { return true; })
    this.map = prompt.map || ((result) => { return result; })

    // Generate a HTML
    const elemString = templates.promptView({
      name: this.name,
      message: prompt.message || "",
      detail: prompt.detail || "",
      className: prompt.className || "",
      words: words || DEFAULT_WORDS
    });

    // Generate a DOM
    const dom = document.createElement("div")
    dom.innerHTML = elemString;
    this.element = dom.children[0];
    dom.remove()

    // Initialize the fields
    this.updateInput(prompt.default, this.choices);
  }

  updateInput(defaultValue, choices) {
    choices = choices || this.choices

    // Update the input interface
    this.interface = this.inputGenerator({
      name: this.name,
      choices: choices
    });
    const contentDom = this.element.querySelector('.user-support-helper .container .input');
    const l = contentDom.children.length
    for (let i = 0; i < l; i++) {
      const child = contentDom.children[0]
      contentDom.removeChild(child)
      child.remove();
    }
    contentDom.appendChild(this.interface.elem)

    // Set default value
    if (defaultValue !== null && defaultValue !== undefined) {
      this.interface.setValue(defaultValue);
    }

    // Set validate function
    const finish = this.element.querySelector('.user-support-helper>.section-footer>.prompt-finish');
    const next = this.element.querySelector('.user-support-helper>.section-footer>.prompt-next');
    const label = this.element.querySelector('.user-support-helper>.container>.row>.status>.label');
    const updateButtons = () => {
      if (this.tooltips) {
        this.tooltips.dispose()
      }

      const retval = this.validate(this.interface.getValue());
      if (retval === true) {
        finish.removeAttribute('disabled');
        next.removeAttribute('disabled');
        label.classList.remove('label-danger');
        label.classList.add('label-success');
        label.innerHTML = 'valid';
      } else {
        finish.setAttribute('disabled', 'true');
        next.setAttribute('disabled', 'true');

        // Add a tooltip
        const addTooltip = (elem) => {
          elem.setAttribute('data-toggle', 'tooltip');
          elem.setAttribute('data-placement', 'auto');
          elem.setAttribute('title', retval);
          return new Disposable(() => {
            elem.removeAttribute('data-toggle');
            elem.removeAttribute('data-placement');
            elem.removeAttribute('title');
          })
        }
        if ((typeof retval) === 'string') {
          this.tooltips = new CompositeDisposable()
          this.tooltips.add(addTooltip(finish))
          this.tooltips.add(addTooltip(next))
          this.tooltips.add(addTooltip(label))
        }
        label.classList.add('label-danger');
        label.classList.remove('label-success');
        label.innerHTML = 'invalid';
      }
    };
    this.interface.onChange(updateButtons);
    updateButtons();
  }

  updateMenu(isOptional, finished, started) {
    // TODO: should be able to disable 'back' button
    this.isOptional = isOptional;
    this.finished = finished;
    this.started = started

    // Update the buttons
    const back = this.element.querySelector('.user-support-helper>.section-footer>.prompt-back');
    const skip = this.element.querySelector('.user-support-helper>.section-footer>.prompt-skip');
    const finish = this.element.querySelector('.user-support-helper>.section-footer>.prompt-finish');
    const next = this.element.querySelector('.user-support-helper>.section-footer>.prompt-next');

    if (started) {
      back.style.display = "none";
    } else {
      back.style.display = "block";
    }

    if (this.isOptional) {
      skip.removeAttribute('disabled');
    } else {
      this.element.querySelector('.user-support-helper>.section-footer>.prompt-skip').setAttribute('disabled', 'true');
    }
    if (this.finished) {
      finish.style.display = "block";
      next.style.display = "none";
    } else {
      next.style.display = "block";
      finish.style.display = "none";
    }
  }

  activate() {
    const back = this.getElement().querySelector('.user-support-helper>.section-footer>.prompt-back');
    const skip = this.getElement().querySelector('.user-support-helper>.section-footer>.prompt-skip');
    const finish = this.getElement().querySelector('.user-support-helper>.section-footer>.prompt-finish');
    const next = this.getElement().querySelector('.user-support-helper>.section-footer>.prompt-next');

    promise = new Promise((resolve, reject) => {
      const handler = (event, dom) => {
        const h = () => {
          resolve({
            event: event,
            value: this.map(this.interface.getValue())
          });
          dom.removeEventListener('click', h);
        };
        return h;
      }
      back.addEventListener('click', handler('back', back));
      skip.addEventListener('click', handler('skip', skip));
      finish.addEventListener('click', handler('success', finish));
      next.addEventListener('click', handler('success', next));
    });
    return promise;
  }

  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }
}

export default PromptView;
