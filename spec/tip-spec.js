'use babel'

import Tip from '../lib/tip'

describe('Tip', () => {
  it('contains the HTML element.', () => {
    const tip = new Tip("foo", "bar")
    expect(tip.getElement().querySelector('.section-container>.section-header>span').innerHTML).toBe("Tip: foo")
    expect(tip.getElement().querySelector('.section-container>.content').innerHTML).toBe("bar")
  })
})
