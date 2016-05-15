'use babel'

let SelectListView = require('atom-space-pen-views').SelectListView

class PromptViewList extends SelectListView {
  constructor() {
    super();
  }
  initialize() {
    super.initialize();
  }
  open(items) {
    this.setItems(items || []);
    this.focusFilterEditor();
  }
  viewForItem(item) {
    return `<li value='${item}'>${item}</li>`
  }
  confirmed(item) {}
  cancelled() {}
  getItem() {
    return this.getSelectedItem();
  }
  setItem(item) {
    const children = this.element.querySelector('ol.list-group').children;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.classList.remove('selected');
      if (child.getAttribute('value') === item) {
        child.classList.add('selected');
      }
    }
  }
}

export default PromptViewList;
