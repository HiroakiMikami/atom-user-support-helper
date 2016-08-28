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

  describe('when the first configuration is shown', () => {
    it('disables the back button.', () => {
        const p = panel.show(['foo'])

        const back= panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-back')
        expect(back.style.display).toBe('none')
    })
  })

  describe('when the finish button is clicked', () => {
    it('set the configuration.', () => {
      waitsForPromise(() => {
        const p = panel.show(['foo'])

        const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
        const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
        expect(finish.style.display).toBe('block')
        expect(next.style.display).toBe('none')

        expect(atom.config.get('foo')).toBe(undefined)
        finish.click()
        return p;
      })

      runs(() => {
        expect(atom.config.get('foo')).toBe('')
      })
    })
  })
  describe('when the next button is clicked', () => {
    it('show the next configuration.', () => {
      panel.show(['foo', 'bar'])

      waitsForPromise(() => {
        const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
        const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
        expect(finish.style.display).toBe('none')
        expect(next.style.display).toBe('block')

        const p = new Promise((resolve, reject) => { panel.onPromptChanged(resolve) })

        next.click()
        return p
      })

      runs(() => {
        const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
        const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
        const name = panel.getPanel().getItem().querySelector('.user-support-helper .section-heading h3').innerText

        expect(name).toBe('Key 2')
        expect(finish.style.display).toBe('block')
        expect(next.style.display).toBe('none')
      })
    })
  })
  describe('when the back button is clicked', () => {
    it('show the previous configuration.', () => {
      panel.show(['foo', 'bar'])

      waitsForPromise(() => {
        const finish = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-finish')
        const next = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-next')
        expect(finish.style.display).toBe('none')
        expect(next.style.display).toBe('block')

        const p = new Promise((resolve) => {
          const disposable = panel.onPromptChanged(() => { resolve(disposable) })
        }).then((d) => {
          d.dispose()
          return new Promise((resolve) => {
            const back = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-back')
            expect(back.style.display).not.toBe('none')

            panel.onPromptChanged(resolve)
            back.click()
          })
        })

        next.click()
        return p
      })

      runs(() => {
        const name = panel.getPanel().getItem().querySelector('.user-support-helper .section-heading h3').innerText
        expect(name).toBe('Key 1')
      })
    })
  })
  describe('when the skip button is clicked', () => {
    it('show the next configuration.', () => {
      waitsForPromise(() => {
        let isCalled = false
        const p = panel.show(() => {
          if (isCalled) {
            return null
          } else {
            isCalled = true
            return {
              id: "foo",
              optional: true
            }
          }
        })

        const skip = panel.getPanel().getItem().querySelector('.user-support-helper .section-footer .prompt-skip')
        expect(skip.style.display).not.toBe('none')

        skip.click()
        return p
      })

      runs(() => {
        expect(atom.config.get('foo')).toBe(undefined)
      })
    })
  })
})
