// global variables
const json = require('./settings.json');
const menuModule = require('./menu');

const { shell } = require('electron');
const contents = json.contents;
var { remote } = require('electron')
var { isMac, app, Menu, MenuItem } = remote;

// initialize function
initialize();

function initialize() {
  // create menu bar
  initializeMenu(menuModule.menuTemplate);

  // create div elements
  contents.forEach(function(content, index) {
    initializeDiv(content['style'], content['width'], index);
  });

  // create webviews in div
  const webviews = getWebviews();
  webviews.forEach(function(webview, index) {
    webview.addEventListener('dom-ready', function() {
      initializeWebview(webview, contents[index]['channel']);
    });
  });
}
function initializeMenu(template) {
  let menu = Menu.buildFromTemplate(template);
  if (hasMultipleWorkspaces()) {
    const menuItemForWorkspaces = generateMenuItemForWorkspaces();
    menu.append(menuItemForWorkspaces);
  }
  Menu.setApplicationMenu(menu);
}
function hasMultipleWorkspaces () {
  return json.other_urls
}
function generateMenuItemForWorkspaces() {
  const menuItem = new MenuItem(
    { id: 'workspaces', label: 'Workspaces', submenu: [] }
  );
  const nameAndUrls = getOtherWorkspacesInfo(json.other_urls);
  const otherWorkspacesMenuItems = generateOtherWorkspaceMenuItems(nameAndUrls);

  otherWorkspacesMenuItems.forEach(function(owsMenuItem) {
    menuItem.submenu.append(owsMenuItem);
  });
  return menuItem;
}
function generateOtherWorkspaceMenuItems(nameAndUrls) {
  const otherWorkspacesMenuItems = nameAndUrls.map(function(nameAndUrl) {
    return new MenuItem({
        label: nameAndUrl['name'],
        click(){ loadWorkspace(nameAndUrl['url']); }
      });
  });

  return otherWorkspacesMenuItems;
}
function getOtherWorkspacesInfo(other_urls) {
  const nameAndUrls = other_urls.map(function(url) {
    const workspaceName = new URL(url).hostname.replace(/.slack.com/g, "");
    return {'name': workspaceName, 'url': new URL(url)};
  });
  return nameAndUrls;
}
function getWebviews() {
  return Array.from(document.getElementsByTagName("webview"));
}
function initializeWebview(webview, channel) {
  addKeyEvents(webview);
  registerToOpenUrl(webview, shell);
  setWebviewAutosize(webview, 'on');

  if (checkUrlIsDefault(webview)) {
    const channelUrl = getChannelUrl(json.url, channel);
    loadURL(webview, channelUrl);
  }

  const onlyBodyCss = getOnlyBodyCss();
  const onlyChannelCss = getOnlyChannelCss();
  const onlySidebarCss = getOnlySidebarCss();
  selectAplicableCss(webview, { onlyBodyCss, onlyChannelCss, onlySidebarCss });
}
// TODO: integrate with `initializeWebview`
function initializeWebviewForAnotherWorkspace(webview, workspaceUrl) {
  addKeyEvents(webview);
  registerToOpenUrl(webview, shell);
  setWebviewAutosize(webview, 'on');

  if (checkUrlIsDefault(webview)) {
    const channel = 'general';
    const url = getChannelUrl(workspaceUrl, channel);
    loadURL(webview, url);
  }
}
function getOnlySidebarCss() {
  const disableChannelList = '.client_channels_list_container { display: none !important; }';
  const disableBody = '#col_messages { display: none !important; }';
  const disableHeader = '.messages_header { display: none !important; }';
  return disableChannelList + disableBody + disableHeader;
}
function getOnlyChannelCss() {
  const disableBody = '.client_main_container { display: none !important; }';
  return disableBody;
}
function getOnlyBodyCss() {
  const disableChannelList = '.client_channels_list_container { display: none !important; }';
  const disableHeader = '#client_header { display: none !important; }';
  const widenBody = '#col_messages { width 100% !important; }';
  return disableChannelList + disableHeader + widenBody;
}
function addKeyEvents(webview) {
  webview.getWebContents().on('before-input-event', (event, input) => {
    if(input.meta && input.key === '[' && webview.canGoBack()) { webview.goBack(); }
    // NOTE: canGoForward() and goForward() do not work somewhy....
    if(input.meta && input.key === ']' && webview.canGoForward()) { webview.goForward(); }
  });
}
function opendev() {
  const webviews = getWebviews();
  let webview = webviews[1];
  webview.goBack();
  webview.openDevTools();
}
function reload(index) {
  const targetTab = document.getElementById(index);
  let webview = null;
  targetTab.children[0].childNodes.forEach(function(element) {
    if(element.tagName == "WEBVIEW") { webview = element; }
  });
  webview.reload();
}
function remove(index) {
  let targetTab = document.getElementById(index);
  targetTab.parentNode.removeChild(targetTab);
}
function add() {
  const style = "body-only";
  const width = "large-tab";
  const channel = "general";
  const index = getWebviews().length;
  initializeDiv(style, width, index);

  let webview = getWebviews()[index];
  webview.addEventListener('dom-ready', function() {
    initializeWebview(webview, channel);
  });
}
function loadWorkspace(workspaceUrl) {
  const style = "full-view";
  const width = "large-tab";
  const index = getWebviews().length;
  initializeDiv(style, width, index);

  const webview = getWebviews()[index];
  webview.addEventListener('dom-ready', function() {
    initializeWebviewForAnotherWorkspace(webview, workspaceUrl);
  });
}
function addButtons(div, index) {
  div.innerHTML = `<button onclick=reload(${index});>Reload</button>`;
  div.innerHTML += `<button onclick=remove(${index});>Remove Column</button>`;
  div.innerHTML += '<button onclick=add();>Add Column</button>';
}
function initializeDiv(style, width, index) {
  let divContainer = createContainerDiv(index, width);
  let divTabToolBar = createToolBarDiv();
  let divWebview = createWebviewDiv();
  let webview = createWebview(style);
  let root = getRootElement();

  root.appendChild(divContainer);
  divContainer.appendChild(divWebview);
  divWebview.appendChild(divTabToolBar);
  divWebview.appendChild(webview);

  addButtons(divTabToolBar, index);
}
function getRootElement() {
  return document.getElementsByClassName("horizontal-list")[0];
}
function createContainerDiv(index, width) {
  let div = document.createElement('div');
  div.id = index;
  div.className = width;
  return div;
}
function createToolBarDiv() {
  let divTabToolBar = document.createElement('div');
  divTabToolBar.className = 'tab-tool-bar';
  return divTabToolBar;
}
function createWebviewDiv() {
  let divWebview = document.createElement('div');
  divWebview.className = 'webview';
  return divWebview;
}
function createWebview(style) {
  let webview = document.createElement('webview');
  webview.src = 'about:blank';
  webview.id = style;
  return webview;
}
function setWebviewAutosize(webview, autosize) {
  webview.autosize = autosize;
}
function selectAplicableCss(webview, { onlyBodyCss, onlyChannelCss, onlySidebarCss }) {
  if (shouldRenderOnlyBody(webview)) { applyCss(webview, onlyBodyCss); }
  if (shouldRenderOnlyChannelList(webview)) { applyCss(webview, onlyChannelCss); }
  if (shouldRenderOnlySidebar(webview)) { applyCss(webview, onlySidebarCss); }
}
function registerToOpenUrl(webview, shell) {
  webview.addEventListener('new-window', function(e){
    shell.openExternal(e.url);
  });
}
function getChannelUrl(baseUrl, channel) {
  const url = "messages/" + channel;
  return new URL(url, baseUrl).href.toString();
}
function shouldRenderOnlyChannelList(webview) {
  return webview.id == "channel-only";
}
function shouldRenderOnlyBody(webview) {
  return webview.id == "body-only";
}
function shouldRenderOnlySidebar(webview) {
  return webview.id == "sidebar-only";
}
function checkUrlIsDefault(webview) {
  return webview.attributes.src.value == "about:blank";
}
function loadURL(webview, url) {
  webview.loadURL(url.toString());
}
function applyCss(webview, css) {
  webview.insertCSS(css);
}
