# user-support-helper [![APM Version](https://img.shields.io/apm/v/user-support-helper.svg)](https://atom.io/packages/user-support-helper) [![APM Downloads](https://img.shields.io/apm/dm/user-support-helper.svg)](https://atom.io/packages/user-support-helper) [![Build Status](https://travis-ci.org/HiroakiMikami/atom-user-support-helper.svg?branch=master)](https://travis-ci.org/HiroakiMikami/atom-user-support-helper)

This package helps developers to create the user support features in Atom.io.

| Interactive Configuration Panel | Random Tips | Step-by-Step Tutorial|
| :------------- | :------------- | :------------- |
| ![](http://hiroakimikami.github.io/atom-user-support-helper/interactive-configuration-panel.gif) | ![](http://hiroakimikami.github.io/atom-user-support-helper/random-tips.gif) | WIP |

# Usage
This package provides a service to create the user support features.
Add `user-support-helper` in the `consumedService` section of your `package.json` to use it:

```json
{
  "consumedServices": {
    "user-support-helper": {
      "versions": {
        "^0.0.0": "consumeUserSupportHelper"
      }
    }
  }
}
```

Then, write the initialization process in your main module:

```javascript
export default {
  activate(state) {},
  deactivate() {},
  consumeUserSupportHelper(helper) {
    // Write your initialization process using `helper`
  }
}
```

## Interactive Configuration Panel
This feature enables users to configure the settings by using the panel.
It is useful if your package requires users to set some configurations at the beginning (e.g., the path of the command and the default value of something).

### Add Configurations
First add configuration keys to the helper:

```javascript
const config = helper.getInteractiveConfigurationPanel()
config.add('atom-user-support-helper-sample.key1', {
  type: 'input',
  name: 'Key 1',
  message: 'The sample of "input" type interface',
  detail: 'The sample of "input" type interface',
  default: 'key',
  validate: (result) => { return (result.length !== 0) ? true: 'too short' }
})
config.add('atom-user-support-helper-sample.key2', {
  type: 'multipleList',
  name: 'Key 2',
  message: 'The sample of "multipleList" type interface',
  default: ['key1', 'key2'],
  choices: ['key1', 'key2', 'key3'],
  map: (result) => { return result.join(','); }
})
config.add('atom-user-support-helper-sample.key3', {
  type: 'list',
  name: 'Key 3',
  message: 'The sample of "list" type interface',
  choices: ['key1', 'key2', 'key3']
})
config.add('atom-user-support-helper-sample.key4', {
  type: 'dropdown',
  name: 'Key 4',
  message: 'The sample of "dropdown" type interface',
  default: 'key1',
  choices: ['key1', 'key2', 'key3']
})
```

There are 4 types of the input interfaces, a text editor (`input`), list / multiple list (they like [the command palette](https://github.com/atom/command-palette)), and a dropdown list (`dropdown`). You can select the UI depending on a configuration.

A `validate` function checks a user's input. A `map` function converts a user's input to the configuration value.

### Show Panel
To show the panel, write:

```javascript
helper.getInteractiveConfigurationPanel().show(
  ['atom-user-support-helper-sample.key1', 'atom-user-support-helper-sample.key2',
   'atom-user-support-helper-sample.key3', 'atom-user-support-helper-sample.key4']
).then((result) => { console.log(result) }, (err) => { console.log(err) })
```

The `show` function returns the instance of `Promise`, which contains the `Map` instance between configuration keys and these values.

## Random Tips
This feature enables your package to show the randomly selected tips.

### Create and Add Tips
First add tips that you want to show:

```javascript
const panel = helper.createRandomTipPanel('atom-user-support-helper-sample')
panel.add('tip1', '<h1>Tip1</h1>')
panel.add('tip2', document.createElement('div'))
```

### Show Tips
To show the tip, write:

```javascript
panel.show()
```

# Sample Repository
[This repository](https://github.com/HiroakiMikami/atom-user-support-helper-sample) provides the simple example of this package usage.

# License
This software is released under the MIT License, see [LICESE.md](LICENSE.md)
