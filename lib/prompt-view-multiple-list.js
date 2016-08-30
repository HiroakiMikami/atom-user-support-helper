'use babel'

let SelectListView = require('atom-space-pen-views').SelectListView
let Emitter = null

let isInitialized = false
function initialize() {
  if (isInitialized) return

  Emitter = require('atom').Emitter
}

/**
 * This class was inspired by SelectListMultipleView in git-plus
 * https://github.com/akonwi/git-plus/blob/master/lib/views/select-list-multiple-view.coffee
 */
class PromptViewMultipleList extends SelectListView {
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

    this.selectedItems = []
    const children = this.element.querySelector('ol.list-group').children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.classList.remove('selected');
    }
  }
  viewForItem(item) {
    return `<li value='${item}'>${item}</li>`
  }
  confirmed(item) {
    // Update the selected items
    const index = this.selectedItems.indexOf(item)
    const children = this.element.querySelector('ol.list-group').children;
    if (index !== -1) {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.getAttribute('value') === item) {
          this.selectedItems.splice(index, 1)
          child.classList.remove('selected');
          child.classList.remove('prompt-selected');
          break ;
        }
      }
    } else {
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child.getAttribute('value') === item) {
          this.selectedItems.push(item)
          child.classList.remove('selected');
          child.classList.add('prompt-selected');
          break ;
        }
      }
    }

    this.emitter.emit('changed', item)
  }
  cancelled() {}
  onChanged(callback) {
    return this.emitter.on('changed', callback)
  }
  getSelectedItems() {
    return this.selectedItems
  }
  setSelectedItems(items) {
    const children = this.element.querySelector('ol.list-group').children;
    this.selectedItems = []
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.classList.remove('selected');
      child.classList.remove('prompt-selected');
      if (items.indexOf(child.getAttribute('value')) !== -1) {
        this.selectedItems.push(child.getAttribute('value'))
        child.classList.add('prompt-selected');
      }
    }

    this.emitter.emit("changed", items)
  }
  populateList() {
    super.populateList()

    if (!this.selectedItems) return

    const children = this.element.querySelector('ol.list-group').children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.classList.remove('selected');
      child.classList.remove('prompt-selected');
      if (this.selectedItems.indexOf(child.getAttribute('value')) !== -1) {
        child.classList.add('prompt-selected');
      }
    }
  }
}

export default PromptViewMultipleList;
