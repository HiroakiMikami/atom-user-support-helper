'use babel';

import fs from 'fs';
import PromptView from '../lib/prompt-view';

describe('PromptView', () => {
  beforeEach((done) => {
    let destination = `${atom.configDirPath}/packages/user-support-helper`;
    let source = `${fs.realpathSync('./')}`;
    fs.accessSync(`${destination}`, fs.R_OK, (err) => {
      if (err) {
        fs.symlink(source, destination, 'dir', () => {
          done();
        })
      }
    })
  })

  describe('when constructing', () => {
    it('generates a DOM using the parameters', () => {
      const prompt = new PromptView({
        type: 'input',
        name: 'Test',
        message: '',
        detail: document.createElement('div')
      });
      expect(prompt.getElement()).not.toBe(null)
      expect(prompt.getElement()).not.toBe(undefined)
    })
  })
  describe('.updateMenu', () => {
    it('enables skip button if isOptional is true', () => {
      const prompt = new PromptView({
        type: 'input',
        name: 'Test',
        message: '',
        detail: document.createElement('div')
      });
      prompt.updateMenu(true, false);
      expect(prompt.getElement().querySelector(
        '.user-support-helper .section-footer .prompt-skip'
      ).hasAttribute('disabled')).toBe(false)
    })
    it('shows finish button if finished is true', () => {
      const prompt = new PromptView({
        type: 'input',
        name: 'Test',
        message: '',
        detail: document.createElement('div')
      });
      prompt.updateMenu(false, true);
      expect(prompt.getElement().querySelector(
        '.user-support-helper .section-footer .prompt-finish'
      ).style["display"]).toBe('block')
      expect(prompt.getElement().querySelector(
        '.user-support-helper .section-footer .prompt-next'
      ).style["display"]).toBe('none')
    })
  })
  describe('when the input is changed', () => {
    it('validates the input result', () => {
      const prompt = new PromptView({
        type: 'input',
        name: 'Test',
        message: '',
        detail: document.createElement('div'),
        validate: (result) => { return result.length > 0; }
      });

      expect(prompt.getElement().querySelector(
        '.user-support-helper .section-footer .prompt-next'
      ).hasAttribute('disabled')).toBe(true)

      prompt.getElement().querySelector('atom-text-editor').getModel().setText('test');
      prompt.getElement().querySelector('atom-text-editor').onkeyup();
      expect(prompt.getElement().querySelector(
        '.user-support-helper .section-footer .prompt-next'
      ).hasAttribute('disabled')).toBe(false)
    })
  })
  describe('.activate', () => {
    it('returns a promise of the input value', () => {
      const prompt = new PromptView({
        type: 'input',
        name: 'Test',
        message: '',
        detail: document.createElement('div')
      });
      const p = prompt.activate()
      let isCalled = false;
      p.then((result) => {
        isCalled = true;
        expect(result.event).toBe('success');
        expect(result.value).toBe('foo');
      })
      prompt.getElement().querySelector('atom-text-editor').getModel().setText('foo');
      prompt.getElement().querySelector('.prompt-next').click();
      waitsForPromise(() => {
        return p;
      });
      runs(() => {
        expect(isCalled).toBe(true);
      });
    })
  })
});
