const builder = require('electron-builder');

builder.build({
  config: {
    'mac': {
      'target': 'zip',
    },
  },
});
