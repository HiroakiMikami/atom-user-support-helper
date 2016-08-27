'use babel'

import PromptViewList from '../lib/prompt-view-list';

describe('PromptViewList', () => {
  describe('.setSelectedItem', () => {
    it('changes the selected item', () => {
      const list = new PromptViewList()
      list.initialize()
      list.open(['1', '2', '3'])
      list.setSelectedItem('1')
      expect(list.getItem()).toBe('1')
    })
  })
  describe('.onConfirmed', () => {
    it('emit the event.', () => {
      let isCalled = false
      const callback = (item) => {
        expect(item).toBe('1')
        isCalled = true
      }

      const list = new PromptViewList()
      list.initialize()
      list.open(['1', '2', '3'])
      list.onConfirmed(callback)
      list.setSelectedItem('1')

      expect(isCalled).toBe(true)
    })
  })
})
