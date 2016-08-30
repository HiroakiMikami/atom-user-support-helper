'use babel'

import PromptViewMultipleList from '../lib/prompt-view-multiple-list';

describe('PromptViewMultipleList', () => {
  describe('when an item is clicked', () => {
    it('adds the item to the selected items if it is not selected.', () => {
      const list = new PromptViewMultipleList()
      list.initialize()
      list.open(['1', '2', '3'])

      list.confirmed('2')
      expect(list.element.querySelector('ol.list-group').children[1].classList.contains('prompt-selected')).toBe(true)
      expect(list.getSelectedItems()[0]).toBe('2')
    })
    it('removes the item to the selected items if it is selected.', () => {
      const list = new PromptViewMultipleList()
      list.initialize()
      list.open(['1', '2', '3'])

      list.confirmed('2')
      list.confirmed('2')
      expect(list.element.querySelector('ol.list-group').children[1].classList.contains('prompt-selected')).toBe(false)
      expect(list.getSelectedItems().length).toBe(0)
    })
  })
  describe('.setSelectedItems', () => {
    it('changes the selected items', () => {
      const list = new PromptViewMultipleList()
      list.initialize()
      list.open(['1', '2', '3'])
      list.setSelectedItems(['1'])
      expect(list.getSelectedItems().length).toBe(1)
      expect(list.getSelectedItems()[0]).toBe('1')
    })
  })
  describe('.onChanged', () => {
    it('emit the event.', () => {
      let isCalled = false
      const callback = (item) => {
        expect(item[0]).toBe('1')
        isCalled = true
      }

      const list = new PromptViewMultipleList()
      list.initialize()
      list.open(['1', '2', '3'])
      list.onChanged(callback)
      list.setSelectedItems(['1'])

      expect(isCalled).toBe(true)
    })
  })
})
