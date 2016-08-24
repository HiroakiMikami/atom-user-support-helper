'use babel';

let Promise = null;
let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;
let PromptViewList = null;
let PUG_DIRECTORY_PATH = null;

let templates = {};
let inputInterfaces = {}

let initialized = false;
function initialize() {
  if (initialized) return ;

  Promise = require('bluebird');
  loophole = require('loophole');
  allowUnsafeEval = loophole.allowUnsafeEval;
  allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;

  PUG_DIRECTORY_PATH = require("./constants").PUG_DIRECTORY_PATH
  PromptViewList = require('./prompt-view-list')

  allowUnsafeEval(() => {
    allowUnsafeNewFunction(() => {
      pug = require('pug');
      templates.promptView = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view.pug`);
      templates.promptViewDropdown = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view-dropdown.pug`);
      templates.promptViewCheckbox = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view-checkbox.pug`);
    })
  });
  inputInterfaces.input = (options) => {
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
      onChange: (callback) => { editorElement.addEventListener('keyup', callback); }
    };
  };
  inputInterfaces.list = (options) => {
    const view = new PromptViewList();
    view.open(options.choices)
    return {
      elem: view.element,
      setValue: (v) => {
        view.setSelectedItem(v);
      },
      getValue: () => {
        return view.getItem();
      },
      onChange: (callback) => {
        // TODO should set event handlers
        /*
        // should call obs.disconnect
        const obs = new MutationObserver(callback);
        obs.observe(view.element.querySelector('ol.list-group'), {
          childList: true,
          subtree: true
        })
        */
      }
    }
  };
  inputInterfaces.dropdown = (options) => {
    const html = templates.promptViewDropdown(options)
    const t = document.createElement('div')
    t.innerHTML = html;
    const elem = t.children[0];
    t.remove();

    return {
      elem: elem,
      setValue: (v) => {
        const children = elem.children;
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          if (child.value === v) {
            elem.selectedIndex = i;
          }
        }
      },
      getValue: () => {
        return elem.options[elem.selectedIndex].value;
      },
      onChange: (callback) => { elem.addEventListener("change", callback); }
    }
  };
  inputInterfaces.checkbox = (options) => {
    const html = templates.promptViewCheckbox(options);
    const t = document.createElement('div')
    t.innerHTML = html;
    const elem = t.children[0];
    t.remove();

    return {
      elem: elem,
      setValue: (vs) => {
        const checkboxes = elem.querySelectorAll('input');
        for (let i = 0; i < checkboxes.length; i++) {
          const checkbox = checkboxes[i];
          checkbox.checked = false;
          for (v of vs) {
            if (checkbox.value === v) {
              checkbox.checked = true;
              break;
            }
          }
        }
      },
      getValue: () => {
        let arr = [];
        const checkboxes = elem.querySelectorAll('input');
        for (let i = 0; i < checkboxes.length; i++) {
          const checkbox = checkboxes[i];
          if (checkbox.checked) {
            arr.push(checkbox.value);
          }
        }
        return arr;
      },
      onChange: (callback) => { elem.addEventListener('change', callback); }
    }
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
    // Obtain the parameters from prompt
    this.type = prompt.type;
    this.name = prompt.name || "";
    this.choices = prompt.choices
    this.inputGenerator = inputInterfaces[this.type];
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
    dom.remove()

    // Initialize the fields
    this.updateMenu(false, false);
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
