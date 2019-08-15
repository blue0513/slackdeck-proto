const builder = require('electron-builder');
const Platform = builder.Platform;

builder.build({
  targets: Platform.WINDOWS.createTarget(),
  config: {
    'win': {
      'target': {
        'target': 'nsis',
        'arch': [
          'x64',
        ],
      },
    },
  },
});
