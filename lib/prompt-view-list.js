'use babel'

let SelectListView = require('atom-space-pen-views').SelectListView
let Emitter = null

let isInitialized = false
function initialize() {
  if (isInitialized) return

  Emitter = require('atom').Emitter
}

class PromptViewList extends SelectListView {
  constructor() {
    super();
    initialize();

    this.emitter = new Emitter()
  }
  initialize() {
    super.initialize();
  }
  destroy() {
    this.emitter.dispose()
  }
  open(items) {
    this.setItems(items || []);
    this.focusFilterEditor();
  }
  viewForItem(item) {
    return `<li value='${item}'>${item}</li>`
  }
  confirmed(item) {
    this.emitter.emit('confirmed', item)
  }
  cancelled() {}
  onConfirmed(callback) {
    return this.emitter.on('confirmed', callback)
  }
  getItem() {
    return this.getSelectedItem();
  }
  setSelectedItem(item) {
    const children = this.element.querySelector('ol.list-group').children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.classList.remove('selected');
      if (child.getAttribute('value') === item) {
        child.classList.add('selected');
        this.confirmed(item)
      }
    }
  }
}

export default PromptViewList;
