'use babel'

import PromptViewList from '../lib/prompt-view-list';

describe('PromptViewList', () => {
  describe('when setSelectedItem is called', () => {
    it('changes the selected item', () => {
      const list = new PromptViewList()
      list.initialize()
      list.open(['1', '2', '3'])
      list.setSelectedItem('1')
      expect(list.getItem()).toBe('1')
    })
  })
})
