const { shell, remote } = require('electron');

const {
  Menu, MenuItem,
} = remote;
const fs = require('fs');
const Store = require('electron-store');

const store = new Store();

// global variables
const json = loadSettings();
const menuModule = require('./menu');

const defaultChannel = 'unreads';
let uniqueIndex = 0;

// initialize function
initialize();

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
  const webviews = getWebviews();
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
  const nameAndUrls = getOtherWorkspacesInfo(json.other_urls);
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
function getOtherWorkspacesInfo(otherUrls) {
  const nameAndUrls = otherUrls.map((url) => {
    const workspaceName = new URL(url).hostname.replace(/.slack.com/g, '');
    return { name: workspaceName, url: new URL(url) };
  });
  return nameAndUrls;
}
function getWebviews() {
  return Array.from(document.getElementsByTagName('webview'));
}
function getNumberOfWebviews() {
  return getWebviews().length;
}
function initializeWebview(webview, channelId) {
  registerToOpenUrl(webview);
  const resizableWebview = setWebviewAutosize(webview, 'on');

  if (checkUrlIsDefault(resizableWebview)) {
    const channelUrl = getChannelUrl(json.url, channelId);
    loadURL(resizableWebview, channelUrl);
  }

  const onlyBodyCss = getOnlyBodyCss();
  const onlyChannelCss = getOnlyChannelCss();
  const onlySidebarCss = getOnlySidebarCss();
  selectAplicableCss(resizableWebview, { onlyBodyCss, onlyChannelCss, onlySidebarCss });
}
// TODO: integrate with `initializeWebview`
function initializeWebviewForAnotherWorkspace(webview, workspaceUrl) {
  registerToOpenUrl(webview);
  const resizableWebview = setWebviewAutosize(webview, 'on');

  if (checkUrlIsDefault(resizableWebview)) {
    const channelId = defaultChannel;
    const url = getChannelUrl(workspaceUrl, channelId);
    loadURL(resizableWebview, url);
  }
}
function getOnlySidebarCss() {
  const disableChannelList = '.p-workspace__sidebar { display: none !important; }';
  const widenSidebar = '.p-workspace--context-pane-expanded { grid-template-columns: 0px auto 100% !important; }';
  const disableTeamHeader = '.p-classic_nav__team_header { display: none !important; }';
  const disableChannelHeader = '.p-classic_nav__channel_header { display: none !important; }';
  const disableBody = '.p-workspace__primary_view { display: none !important; }';
  return disableChannelList + widenSidebar + disableTeamHeader + disableChannelHeader + disableBody;
}
function getOnlyChannelCss() {
  const disableBody = '.p-workspace__primary_view { display: none !important; }';
  const disableChannelHeader = '.p-classic_nav__channel_header { display: none !important; }';
  const disableRightHeader = '.p-classic_nav__right_header { display: none !important; }';
  const disableSidebar = '.p-workspace__secondary_view { display: none !important; }';
  return disableBody + disableChannelHeader + disableRightHeader + disableSidebar;
}
function getOnlyBodyCss() {
  const disableChannelList = '.p-workspace__sidebar { display: none !important; }';
  const disableTeamHeader = '.p-classic_nav__team_header { display: none !important; }';
  const widenBody = '.p-workspace--context-pane-collapsed { grid-template-columns: 0px auto !important; }';
  const adjustHeight = '.p-workspace--classic-nav { grid-template-rows: min-content 60px auto !important; }';
  const adjustLeftPadding = '.p-workspace--context-pane-expanded { grid-template-columns: 0px auto !important; }';
  return disableChannelList + widenBody + adjustHeight + disableTeamHeader + adjustLeftPadding;
}
/* eslint-disable no-unused-vars */
function opendev() {
  const webviews = getWebviews();
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
  if (!isUrl(element.value)) return;

  const maybeUrl = new URL(element.value);
  if (validateUrl(maybeUrl)) {
    const slackUrl = modifySlackUrl(maybeUrl);
    loadURL(webview, slackUrl);
    element.value = '';
  }
}
function add() {
  const style = 'body-only';
  const width = 'large-tab';
  const channelId = defaultChannel;
  initializeDiv(style, width);

  const webview = getWebviews()[getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', () => {
    initializeWebview(webview, channelId);
  });
}
/* eslint-enable no-unused-vars */
function isUrl(str) {
  try {
    const url = new URL(str);
    return url;
  } catch (err) {
    return false;
  }
}
function modifySlackUrl(url) {
  const isThread = url.href.includes('thread_ts');
  if (!isThread) {
    return url.href.replace('archives', 'messages');
  }

  const parentMessageId = `p${url.search.replace(/(\?thread_ts=)|(&cid.*)|(\.)/g, '')}`;
  const channelId = url.pathname.split('/')[2];
  return `${url.origin}/messages/${channelId}/${parentMessageId}`;
}
function validateUrl(url) {
  const cond1 = url.protocol === 'http:' || url.protocol === 'https:';
  const cond2 = url.hostname.endsWith('.slack.com');
  return cond1 && cond2;
}
function loadWorkspace(workspaceUrl) {
  const style = 'full-view';
  const width = 'large-tab';
  initializeDiv(style, width);

  const webview = getWebviews()[getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', () => {
    initializeWebviewForAnotherWorkspace(webview, workspaceUrl);
  });
}
function addButtons(div, index) {
  const divForButtons = div.children[0];
  divForButtons.innerHTML = `<button onclick=reload(${index});>Reload</button>`;
  divForButtons.innerHTML += `<button onclick=remove(${index});>Remove Column</button>`;
  divForButtons.innerHTML += '<button onclick=add();>Add Column</button>';
  divForButtons.innerHTML
    += `<input type="text"
      id="${index}-message-url"
      placeholder="Message URL"
      onKeyDown="if(event.keyCode == 13) jumpLink(${index})">`;
}
function initializeDiv(style, width) {
  const generatedDivs = generateTab(width, style);
  addButtons(generatedDivs.divTabToolBar, getUniqueIndex());

  // update unique index
  incrementUniqueIndex();
}
function generateTab(width, style) {
  const divContainer = createContainerDiv(getUniqueIndex(), width);
  const divTabToolBar = createToolBarDiv();
  const divWebview = createWebviewDiv();
  const webview = createWebview(style);
  const root = getRootElement();

  root.appendChild(divContainer);
  divContainer.appendChild(divWebview);
  divWebview.appendChild(divTabToolBar);
  divWebview.appendChild(webview);

  return {
    divContainer,
    divTabToolBar,
    divWebview,
  };
}
function getRootElement() {
  return document.getElementsByClassName('horizontal-list')[0];
}
function createContainerDiv(index, width) {
  const div = document.createElement('div');
  div.id = index;
  div.className = width;
  return div;
}
function createToolBarDiv() {
  const divTabToolBar = document.createElement('div');
  divTabToolBar.className = 'tab-tool-bar';

  const buttonDiv = document.createElement('div');
  buttonDiv.className = 'tab-tool-bar-button';
  divTabToolBar.appendChild(buttonDiv);

  const channelNameDiv = document.createElement('div');
  channelNameDiv.className = 'tab-tool-bar-channel';
  divTabToolBar.appendChild(channelNameDiv);

  return divTabToolBar;
}
function createWebviewDiv() {
  const divWebview = document.createElement('div');
  divWebview.className = 'webview';
  return divWebview;
}
function createWebview(style) {
  const webview = document.createElement('webview');
  webview.src = 'about:blank';
  webview.id = style;
  return webview;
}
function setWebviewAutosize(webview, autosize) {
  const hoge = webview;
  hoge.autosize = autosize;
  return hoge;
}
function selectAplicableCss(webview, { onlyBodyCss, onlyChannelCss, onlySidebarCss }) {
  if (shouldRenderOnlyBody(webview)) { applyCss(webview, onlyBodyCss); }
  if (shouldRenderOnlyChannelList(webview)) { applyCss(webview, onlyChannelCss); }
  if (shouldRenderOnlySidebar(webview)) { applyCss(webview, onlySidebarCss); }
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
function getChannelUrl(baseUrl, channelId) {
  const url = `messages/${channelId}`;
  return new URL(url, baseUrl).href.toString();
}
function shouldRenderOnlyChannelList(webview) {
  return webview.id === 'channel-only';
}
function shouldRenderOnlyBody(webview) {
  return webview.id === 'body-only';
}
function shouldRenderOnlySidebar(webview) {
  return webview.id === 'sidebar-only';
}
function checkUrlIsDefault(webview) {
  return webview.attributes.src.value === 'about:blank';
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
  if (!validateJson(settings)) { return; }

  store.set(settings);
  forceReload();
}
function validateJson(jsonObj) {
  if (!jsonObj.url) {
    alert('jsonObj.url is invalid');
    return false;
  }
  if (!jsonObj.other_urls) {
    alert('jsonObj.other_urls is invalid');
    return false;
  }
  if (!jsonObj.contents) {
    alert('jsonObj.contents is invalid');
    return false;
  }

  return true;
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
  };
  if (!validateJson(jsonObj)) { return null; }

  return jsonObj;
}
function noSettings() {
  return store.size === 0;
}
