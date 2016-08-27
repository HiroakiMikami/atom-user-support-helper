'use babel';

let loophole = null;
let allowUnsafeEval = null;
let allowUnsafeNewFunction = null;
let pug = null;
let Disposable = null
let PromptViewList = null;
let PUG_DIRECTORY_PATH = null;

let templates = {};

// Initialize the modules
loophole = require('loophole');
allowUnsafeEval = loophole.allowUnsafeEval;
allowUnsafeNewFunction = loophole.allowUnsafeNewFunction;
Disposable = require('atom').Disposable

// Initilaize the local modules
PUG_DIRECTORY_PATH = require("./constants").PUG_DIRECTORY_PATH
PromptViewList = require('./prompt-view-list')

// Compile the pug files
allowUnsafeEval(() => {
  allowUnsafeNewFunction(() => {
    pug = require('pug');
    templates.promptViewDropdown = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view-dropdown.pug`);
    templates.promptViewCheckbox = pug.compileFile(`${PUG_DIRECTORY_PATH}/prompt-view-checkbox.pug`);
  })
});

export default class inputInterfaces {
  static input(options) {
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
      onChange: (callback) => { return editor.onDidChange(callback) }
    };
  }
  static list(options) {
    const view = new PromptViewList();
    view.open(options.choices)
    return {
      elem: view.element,
      setValue: (v) => { view.setSelectedItem(v); },
      getValue: () => { return view.getItem(); },
      onChange: (callback) => { return view.onConfirmed(callback) }
    }
  }
  static dropdown(options) {
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
        elem.dispatchEvent(new Event('change'))
      },
      getValue: () => { return elem.options[elem.selectedIndex].value; },
      onChange: (callback) => {
        elem.addEventListener("change", callback);
        return new Disposable(() => {
          elem.removeEventListener("change", callback)
        })
      }
    }
  }
  static checkbox(options) {
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
              elem.dispatchEvent(new Event('change'))
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
      onChange: (callback) => {
        elem.addEventListener('change', callback);
        return new Disposable(() => {
          elem.removeEventListener('change', callback)
        })
      }
    }
  }
}
