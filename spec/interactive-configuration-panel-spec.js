'use babel'

import InteractiveConfigurationPanel from '../lib/interactive-configuration-panel';

describe('InteractiveConfigurationPanel', () => {
  let panel = null

  beforeEach(() => {
    panel = new InteractiveConfigurationPanel()

    panel.add('foo', {
      type: 'input',
      name: 'Key 1',
      description: '',
      default: ''
    })
    panel.add('bar', {
      type: 'input',
      name: 'Key 2',
      description: '',
      default: ''
    })
  })

  it('enables finish button if the last configuration is shown.', () => {
    panel.show(['foo'])
    const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
    const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
    expect(finish.style.display).toBe('block')
    expect(next.style.display).toBe('none')
  })
  it('enables next button if the last configuration is shown.', () => {
    panel.show(['foo', 'bar'])
    const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
    const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
    expect(finish.style.display).toBe('none')
    expect(next.style.display).toBe('block')
  })
  it('enables skip button if the configuration is skippable.', () => {
    panel.show(() => {
      return {
        id: "foo",
        optional: true
      }
    })
    const skip = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-skip')

    expect(skip.hasAttribute('disabled')).toBe(false)
  })
})
