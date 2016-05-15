'use babel';

let Promise = null;
let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;

let templates = {};

let initialized = false;
function initialize() {
  if (initialized) return ;

  Promise = require('bluebird');
  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;
  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      templates.promptView =
        pug.compileFile(`${atom.configDirPath}/packages/user-support-helper/pug/prompt-view.pug`);
      templates.list = "";
      templates.dropdown = "";
      templates.checkbox = "";
    })
  });
  templates.input = (options) => {
    const editorElement = document.createElement('atom-text-editor');
    const editor = atom.workspace.buildTextEditor({
      mini: true,
      lineNumberGutterVisible: false,
      placeholderText: options.name || ''
    });

    editorElement.setModel(editor);
    return {
      elem: editorElement,
      setValue: (v) => { editor.setText(v); },
      getValue: () => { return editor.getText(); },
      onChange: (callback) => {
        editorElement.onkeyup = callback;
      }
    };
  };

  initialized = true;
}

const defaultWords = {
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
    this.type = prompt.type;
    this.name = prompt.name || "";
    this.inputGenerator = templates[this.type];
    this.validate = prompt.validate || ((result) => { return true; })
    this.map = prompt.map || ((result) => { return result; })

    // Generate a HTML
    const elemString = templates.promptView({
      name: this.name,
      message: prompt.message || "",
      detail: prompt.detail || "",
      className: prompt.className || "",
      words: words || defaultWords
    });

    // Generate a DOM
    const dom = document.createElement("div")
    dom.innerHTML = elemString;
    this.element = dom.children[0];

    // Initialize the fields
    this.updateMenu(false, false);
    this.updateInput(prompt.default, prompt.choices);
  }

  updateInput(defaultValue, choices) {
    // Update the input interface
    this.interface = this.inputGenerator({ name: this.name });
    this.element.querySelector('.user-support-helper .container .input').appendChild(
      this.interface.elem
    );

    // Set default value
    if (defaultValue !== null && defaultValue !== undefined) {
      this.interface.setValue(defaultValue);
    }

    // Set validate function
    const finish = this.element.querySelector('.user-support-helper>.section-footer>.prompt-finish');
    const next = this.element.querySelector('.user-support-helper>.section-footer>.prompt-next');
    const label = this.element.querySelector('.user-support-helper>.container>.row>.status>.label');
    const updateButtons = () => {
      const retval = this.validate(this.interface.getValue());
      if (retval === true) {
        const removeTooltip = (elem) => {
          elem.removeAttribute('data-toggle');
          elem.removeAttribute('data-placement');
          elem.removeAttribute('title');
        }
        finish.removeAttribute('disabled');
        next.removeAttribute('disabled');
        removeTooltip(finish);
        removeTooltip(next);
        removeTooltip(label);
        label.classList.remove('label-danger');
        label.classList.add('label-success');
        label.innerHTML = 'valid';
      } else {
        finish.setAttribute('disabled', 'true');
        next.setAttribute('disabled', 'true');

        // Add a tooltip
        const addTooltip = (btn) => {
          btn.setAttribute('data-toggle', 'tooltip');
          btn.setAttribute('data-placement', 'auto');
          btn.setAttribute('title', retval);
        }
        if ((typeof retval) === 'string') {
          addTooltip(finish);
          addTooltip(next);
          addTooltip(label);
        }
        label.classList.add('label-danger');
        label.classList.remove('label-success');
        label.innerHTML = 'invalid';
      }
    };
    this.interface.onChange(updateButtons);
    updateButtons();
  }

  updateMenu(isOptional, finished) {
    // TODO: should be able to disable 'back' button
    this.isOptional = isOptional;
    this.finished = finished;

    // Update the buttons
    const skip = this.element.querySelector('.user-support-helper>.section-footer>.prompt-skip');
    const finish = this.element.querySelector('.user-support-helper>.section-footer>.prompt-finish');
    const next = this.element.querySelector('.user-support-helper>.section-footer>.prompt-next');

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
            value: this.interface.getValue()
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
