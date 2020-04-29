// ////////////////
// Libraries
// ////////////////

const { shell, remote } = require('electron');
const fs = require('fs');
const Store = require('electron-store');
const menuModule = require('./menu');
const Library = require('./lib/lib');

// ////////////////
// Global Variables
// ////////////////

const { Menu, MenuItem } = remote;
const store = new Store();
const json = loadSettings();
const defaultChannel = 'unreads';
let uniqueIndex = 0;

// ////////////////
// Initialize
// ////////////////

initialize();

// ////////////////
// Functions
// ////////////////

function initialize() {
  if (noSettings()) { return; }

  // create menu bar
  initializeMenu(menuModule.menuTemplate);

  // create div elements
  const { contents } = json;
  contents.forEach((content) => {
    initializeDiv(content.style, content.width);
  });

  // create webviews in div
  const webviews = Library.getWebviews();
  webviews.forEach((webview, index) => {
    webview.addEventListener('dom-ready', () => {
      initializeWebview(webview, contents[index].channel_id);
    });
  });
}
function initializeMenu(template) {
  const menu = Menu.buildFromTemplate(template);
  if (hasMultipleWorkspaces()) {
    const menuItemForWorkspaces = generateMenuItemForWorkspaces();
    menu.append(menuItemForWorkspaces);
  }

  const settingsMenu = generateSettingsMenu();
  menu.append(settingsMenu);

  Menu.setApplicationMenu(menu);
}
function incrementUniqueIndex() {
  uniqueIndex += 1;
}
function getUniqueIndex() {
  return uniqueIndex;
}
function hasMultipleWorkspaces() {
  return json.other_urls;
}
function generateMenuItemForWorkspaces() {
  const menuItem = new MenuItem(
    { id: 'workspaces', label: 'Workspaces', submenu: [] },
  );
  const nameAndUrls = Library.getOtherWorkspacesInfo(json.other_urls);
  const otherWorkspacesMenuItems = generateOtherWorkspaceMenuItems(nameAndUrls);

  otherWorkspacesMenuItems.forEach((owsMenuItem) => {
    menuItem.submenu.append(owsMenuItem);
  });
  return menuItem;
}
function generateSettingsMenu() {
  const menuItem = new MenuItem(
    {
      id: 'settings',
      label: 'Settings',
      submenu: [
        {
          label: 'Import Settings',
          click() { saveSettings(); },
        },
        {
          label: 'Clear Settings',
          click() { clearStoredSettings(); },
        },
      ],
    },
  );

  return menuItem;
}
function generateOtherWorkspaceMenuItems(nameAndUrls) {
  const otherWorkspacesMenuItems = nameAndUrls.map((nameAndUrl) => new MenuItem({
    label: nameAndUrl.name,
    click() { loadWorkspace(nameAndUrl.url); },
  }));

  return otherWorkspacesMenuItems;
}
function initializeWebview(webview, channelId) {
  registerToOpenUrl(webview);
  const resizableWebview = Library.setWebviewAutosize(webview, 'on');

  if (Library.checkUrlIsDefault(resizableWebview)) {
    const channelUrl = Library.getChannelUrl(json.url, channelId);
    loadURL(resizableWebview, channelUrl);
  }

  const onlyBodyCss = Library.getOnlyBodyCss();
  const onlyChannelCss = Library.getOnlyChannelCss();
  selectAplicableCss(resizableWebview, { onlyBodyCss, onlyChannelCss });
}
// TODO: integrate with `initializeWebview`
function initializeWebviewForAnotherWorkspace(webview, workspaceUrl) {
  registerToOpenUrl(webview);
  const resizableWebview = Library.setWebviewAutosize(webview, 'on');

  if (Library.checkUrlIsDefault(resizableWebview)) {
    const channelId = defaultChannel;
    const url = Library.getChannelUrl(workspaceUrl, channelId);
    loadURL(resizableWebview, url);
  }
}
/* eslint-disable no-unused-vars */
function opendev() {
  const webviews = Library.getWebviews();
  const webview = webviews[1];
  webview.openDevTools();
}
function reload(index) {
  const targetTab = document.getElementById(index);
  let webview = null;
  targetTab.children[0].childNodes.forEach((element) => {
    if (element.tagName === 'WEBVIEW') { webview = element; }
  });
  webview.reload();
}
function remove(index) {
  const targetTab = document.getElementById(index);
  targetTab.parentNode.removeChild(targetTab);
}
function jumpLink(index) {
  const targetTab = document.getElementById(index);
  let webview = null;
  targetTab.children[0].childNodes.forEach((element) => {
    if (element.tagName === 'WEBVIEW') { webview = element; }
  });

  const element = document.getElementById(`${index.toString()}-message-url`);
  if (!Library.isUrl(element.value)) return;

  const maybeUrl = new URL(element.value);
  if (Library.validateUrl(maybeUrl)) {
    const slackUrl = Library.modifySlackUrl(maybeUrl);
    loadURL(webview, slackUrl);
    element.value = '';
  }
}
function add() {
  const style = 'body-only';
  const width = 'large-tab';
  const channelId = defaultChannel;
  initializeDiv(style, width);

  const webview = Library.getWebviews()[Library.getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', () => {
    initializeWebview(webview, channelId);
  });
}
/* eslint-enable no-unused-vars */
function loadWorkspace(workspaceUrl) {
  const style = 'full-view';
  const width = 'large-tab';
  initializeDiv(style, width);

  const webview = Library.getWebviews()[Library.getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', () => {
    initializeWebviewForAnotherWorkspace(webview, workspaceUrl);
  });
}
function initializeDiv(style, width) {
  const shouldSticky = json.sticky;
  const generatedDivs = Library.generateTab(width, style, getUniqueIndex(), shouldSticky);
  Library.addButtons(generatedDivs.divTabToolBar, getUniqueIndex());

  // update unique index
  incrementUniqueIndex();
}
function selectAplicableCss(webview, { onlyBodyCss, onlyChannelCss }) {
  if (Library.shouldRenderOnlyBody(webview)) { applyCss(webview, onlyBodyCss); }
  if (Library.shouldRenderOnlyChannelList(webview)) { applyCss(webview, onlyChannelCss); }
}
function registerToOpenUrl(webview) {
  // Hack: remove EventListener if already added
  webview.removeEventListener('new-window', openExternalUrl);
  webview.addEventListener('new-window', openExternalUrl);
}
function openExternalUrl(event) {
  const { url } = event;
  // https://electronjs.org/docs/tutorial/security#14-do-not-use-openexternal-with-untrusted-content
  // Page 20 of https://www.blackhat.com/docs/us-17/thursday/us-17-Carettoni-Electronegativity-A-Study-Of-Electron-Security-wp.pdf
  if (url.startsWith('http://') || url.startsWith('https://')) {
    shell.openExternal(url);
  }
}
function loadURL(webview, url) {
  webview.loadURL(url.toString());
}
function applyCss(webview, css) {
  webview.insertCSS(css);
}
function saveSettings() {
  openFileAndSave();
}
function openFileAndSave() {
  const win = remote.getCurrentWindow();
  remote.dialog.showOpenDialog(
    win,
    {
      properties: ['openFile'],
      filters: [{
        name: 'settings',
        extensions: ['json'],
      }],
    },
    (filePath) => {
      if (filePath) { saveJson(filePath[0]); }
    },
  );
}
function saveJson(jsonPath) {
  const settings = JSON.parse(fs.readFileSync(jsonPath));
  if (!Library.validateJson(settings)) { return; }

  store.set(settings);
  forceReload();
}
function forceReload() {
  remote.getCurrentWindow().reload();
}
function clearStoredSettings() {
  store.clear();
  forceReload();
}
function loadSettings() {
  if (noSettings()) {
    saveSettings();
    return null;
  }

  return buildJsonObjectFromStoredData();
}
function buildJsonObjectFromStoredData() {
  const jsonObj = {
    url: store.get('url'),
    other_urls: store.get('other_urls'),
    contents: store.get('contents'),
    sticky: store.get('sticky'),
  };
  if (!Library.validateJson(jsonObj)) { return null; }

  return jsonObj;
}
function noSettings() {
  return store.size === 0;
}
