const Library = require('../../src/lib/lib');

describe('getOtherWorkspacesInfo', () => {
  test('passes', () => {
    const otherUrls = ['https://sample.slack.com/'];
    const expected = [{ name: 'sample', url: new URL('https://sample.slack.com/') }];
    expect(Library.getOtherWorkspacesInfo(otherUrls)).toMatchObject(expected);
  });
});

describe('getWebviews', () => {
  test('passes', () => {
    document.body.innerHTML = '<webview></webview>';
    expect(Library.getWebviews().length).toBe(1);
  });
});

describe('getOnly*Css', () => {
  test('passes', () => {
    expect(typeof Library.getOnlySidebarCss()).toBe('string');
    expect(typeof Library.getOnlyChannelCss()).toBe('string');
    expect(typeof Library.getOnlyBodyCss()).toBe('string');
  });
});

describe('isUrl', () => {
  test('is url', () => {
    const urlString = 'https://sample.slack.com/';
    expect(Library.isUrl(urlString)).toMatchObject(new URL(urlString));
  });

  test('is not url', () => {
    expect(Library.isUrl('foobar')).toBe(false);
  });
});

describe('modifySlackUrl', () => {
  test('is Thread', () => {
    const url = new URL('https://sample.slack.com/archives/ABC/pxxx?thread_ts=123.45&cid=DEF');
    const expected = 'https://sample.slack.com/messages/ABC/p12345';

    expect(typeof Library.modifySlackUrl(url)).toBe('string');
    expect(Library.modifySlackUrl(url)).toBe(expected);
  });

  test('is not Thread', () => {
    const url = new URL('https://sample.slack.com/archives/ABC/pxxx');
    const expected = 'https://sample.slack.com/messages/ABC/pxxx';

    expect(typeof Library.modifySlackUrl(url)).toBe('string');
    expect(Library.modifySlackUrl(url)).toBe(expected);
  });
});

describe('validateUrl', () => {
  test('is valid', () => {
    const url1 = new URL('https://sample.slack.com');
    const url2 = new URL('http://sample.slack.com');
    expect(Library.validateUrl(url1)).toBe(true);
    expect(Library.validateUrl(url2)).toBe(true);
  });

  test('is not valid', () => {
    const url = new URL('http://sample.com');
    expect(Library.validateUrl(url)).toBe(false);
  });
});

describe('createContainerDiv', () => {
  test('create div', () => {
    const div = Library.createContainerDiv(1, 'large');
    expect(div.id).toBe('1');
    expect(div.className).toBe('large');
  });
});

describe('createToolBarDiv', () => {
  test('create div', () => {
    const div = Library.createToolBarDiv();
    expect(div.childNodes.length).toBe(2);
    expect(div.className).toBe('tab-tool-bar');
    expect(div.firstChild.className).toBe('tab-tool-bar-button');
    expect(div.lastChild.className).toBe('tab-tool-bar-channel');
  });
});

describe('createWebviewDiv', () => {
  test('create div', () => {
    const div = Library.createWebviewDiv();
    expect(div.className).toBe('webview');
  });
});

describe('createWebview', () => {
  test('create webview', () => {
    const webview = Library.createWebview('body-only');
    expect(webview.tagName).toBe('WEBVIEW');
    expect(webview.src).toBe('about:blank');
    expect(webview.id).toBe('body-only');
  });
});

describe('setWebviewAutosize', () => {
  test('returns autosizable webview', () => {
    const webview = document.createElement('webview');
    const newWebview = Library.setWebviewAutosize(webview, true);
    expect(newWebview.tagName).toBe('WEBVIEW');
    expect(webview.autosize).toBe(true);
  });

  test('returns no autosizable webview', () => {
    const webview = document.createElement('webview');
    const newWebview = Library.setWebviewAutosize(webview, false);
    expect(newWebview.tagName).toBe('WEBVIEW');
    expect(webview.autosize).toBe(false);
  });
});

describe('getChannelUrl', () => {
  test('returns url', () => {
    const baseUrl = 'https://sample.slack.com';
    const urlString = Library.getChannelUrl(baseUrl, 'AAA');
    expect(urlString).toBe('https://sample.slack.com/messages/AAA');
  });
});

describe('shouldRenderOnly*', () => {
  test('channel list', () => {
    const webview = document.createElement('webview');
    webview.id = 'channel-only';
    expect(Library.shouldRenderOnlyChannelList(webview)).toBe(true);
  });

  test('side bar', () => {
    const webview = document.createElement('webview');
    webview.id = 'sidebar-only';
    expect(Library.shouldRenderOnlySidebar(webview)).toBe(true);
  });

  test('body', () => {
    const webview = document.createElement('webview');
    webview.id = 'body-only';
    expect(Library.shouldRenderOnlyBody(webview)).toBe(true);
  });

  test('no match', () => {
    const webview = document.createElement('webview');
    webview.id = 'foo-only';

    expect(Library.shouldRenderOnlyChannelList(webview)).toBe(false);
    expect(Library.shouldRenderOnlySidebar(webview)).toBe(false);
    expect(Library.shouldRenderOnlyBody(webview)).toBe(false);
  });
});

// describe('checkUrlIsDefault', () => {
//   test('is default', () => {
//     const webview = document.createElement('webview');
//     // webview.attributes.src.value = 'about:blank';
//     expect(Library.checkUrlIsDefault(webview)).toBe(true);
//   });
//
//   test('is not default', () => {
//     const webview = document.createElement('webview');
//     // webview.attributes.src.value = ''
//     expect(Library.checkUrlIsDefault(webview)).toBe(false);
//   });
// });

describe('validateJson', () => {
  test('valid', () => {
    const json = { url: 'url', other_urls: 'other_urls', contents: 'contents' };
    expect(Library.validateJson(json)).toBe(true);
  });

  /* eslint-disable no-undef */
  test('no url', () => {
    const json = { other_urls: 'other_urls', contents: 'contents' };
    window.alert = jest.fn();
    expect(Library.validateJson(json)).toBe(false);
  });

  test('no other_urls', () => {
    const json = { url: 'url', contents: 'contents' };
    window.alert = jest.fn();
    expect(Library.validateJson(json)).toBe(false);
  });

  test('no contents', () => {
    const json = { url: 'url', other_urls: 'other_urls' };
    window.alert = jest.fn();
    expect(Library.validateJson(json)).toBe(false);
  });
  /* eslint-enable no-undef */
});

describe('getRootElement', () => {
  test('get element', () => {
    document.body.innerHTML = '<div><ul class="horizontal-list"></div>';
    expect(Library.getRootElement()).toBeTruthy();
  });

  test('get no element', () => {
    document.body.innerHTML = '<div><ul></div>';
    expect(Library.getRootElement()).toBeFalsy();
  });
});

describe('generateTab', () => {
  test('get element', () => {
    document.body.innerHTML = '<div><ul class="horizontal-list"></div>';
    expect(Library.generateTab('small', 'body-only', 0).divContainer).toBeTruthy();
    expect(Library.generateTab('small', 'body-only', 0).divTabToolBar).toBeTruthy();
    expect(Library.generateTab('small', 'body-only', 0).divWebview).toBeTruthy();
  });
});

describe('addButtons', () => {
  test('passes', () => {
    document.body.innerHTML = '<div id="dummy"><div></div></div>';
    const div = document.getElementById('dummy');
    expect(Library.addButtons(div, 0).childNodes.length).toBe(4);

    expect(Library.addButtons(div, 0).childNodes[0].type).toBe('submit');
    expect(Library.addButtons(div, 0).childNodes[0].innerHTML).toBe('Reload');

    expect(Library.addButtons(div, 0).childNodes[1].type).toBe('submit');
    expect(Library.addButtons(div, 0).childNodes[1].innerHTML).toBe('Remove Column');

    expect(Library.addButtons(div, 0).childNodes[2].type).toBe('submit');
    expect(Library.addButtons(div, 0).childNodes[2].innerHTML).toBe('Add Column');

    expect(Library.addButtons(div, 0).childNodes[3].type).toBe('text');
  });
});
