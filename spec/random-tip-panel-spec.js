'use babel'

import RandomTipPanel from '../lib/random-tip-panel'

describe('RandomTipPanel', () => {
  let panel = null
  beforeEach(() => {
    panel = new RandomTipPanel('user-support-helper-test')

    panel.add('foo', 'bar')
  })

  describe('when showForcedly is called', () => {
    it('shows the panel.', () => {
      panel.showForcedly()

      expect(panel.panel.isVisible()).toBe(true)
    })
  })
  describe('when the show-tips configuration is false', () => {
    it('does not show the panel.', () => {
      const currentValue = atom.config.get('user-support-helper-test.show-tips')
      atom.config.set('user-support-helper-test.show-tips', true)

      panel.show()
      expect(panel.panel.isVisible()).not.toBe(true)

      if (currentValue) {
        atom.config.set('user-support-helper-test.show-tips', currentValue)
      } else {
        atom.config.unset('user-support-helper-test.show-tips')
      }
    })
  })
})
