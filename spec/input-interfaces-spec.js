'use babel'

import InputInterfaces from '../lib/input-interfaces'

describe('InputInterfaces', () => {
  function testInterface(constructor, options, value, equals) {
    equals = equals || ((v1, v2) => { expect(v1).toBe(v2) })
    it('set/get the value.', () => {
      const interface = constructor(options)
      interface.setValue(value)
      equals(interface.getValue(), value)
    })
    it('emit the event when the value is changed.', () => {
      let isCalled = false

      const interface = constructor(options)
      const disposable = interface.onChange((value) => {
        isCalled = true
      })
      interface.setValue(value)
      expect(isCalled).toBe(true)

      isCalled = false
      disposable.dispose()
      interface.setValue(value)
      expect(isCalled).not.toBe(true)
    })
  }

  describe('.input', () => {
    testInterface(InputInterfaces.input, {}, 'foo')
  })
  describe('.list', () => {
    testInterface(InputInterfaces.list, {choices: ['1', '2', '3']}, '1')
  })
  describe('.dropdown', () => {
    testInterface(InputInterfaces.dropdown, {choices: ['1', '2', '3']}, '1')
  })
  describe('.multiple-list', () => {
    testInterface(InputInterfaces.multipleList, {choices: ['1', '2', '3']}, ['1', '2'], (v1, v2) => {
      expect(v1.length).toBe(v2.length)
    })
  })
})
