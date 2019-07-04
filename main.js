// global variables
const json = require('./settings.json');
const menuModule = require('./menu');
const contents = json.contents;
const defaultChannel = 'general';
let uniqueIndex = 0;

const { shell } = require('electron');
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
    webview.addEventListener('page-title-updated', function() {
      const channelName = getChannelName(webview);
      updateChannelNameIfNeeded(channelName, index);
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
function incrementUniqueIndex() {
  uniqueIndex += 1;
}
function getUniqueIndex() {
  return uniqueIndex;
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
function getChannelNameFromTitle(webview) {
  const pageTitle = webview.getTitle();
  const titleElements = pageTitle.split(' ');

  if (titleElements.length == 4) return titleElements[0];
  return null;
}
function getChannelName(webview) {
  return getChannelNameFromTitle(webview);
}
function getWebviews() {
  return Array.from(document.getElementsByTagName("webview"));
}
function getNumberOfWebviews() {
  return getWebviews().length;
}
function initializeWebview(webview, channel) {
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
  registerToOpenUrl(webview, shell);
  setWebviewAutosize(webview, 'on');

  if (checkUrlIsDefault(webview)) {
    const channel = defaultChannel;
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
function addKeyEvnet(webview) {
  webview.getWebContents().on('before-input-event', (event, input) => {
    if(input.key === "Backspace" && webview.canGoBack()) { webview.goBack(); }
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
  const channel = defaultChannel;
  const index = getUniqueIndex();
  initializeDiv(style, width, index);

  const webview = getWebviews()[getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', function() {
    initializeWebview(webview, channel);
  });
  webview.addEventListener('page-title-updated', function() {
    const channelName = getChannelName(webview);
    updateChannelNameIfNeeded(channelName, index);
  });
}
function updateChannelNameIfNeeded(channelName, index) {
  if (!channelName) return;

  const displayName = channelName ? ('#' + channelName) : '';
  let targetTab = document.getElementById(index);
  let targetDiv = null;
  targetTab.children[0].childNodes.forEach(function(element) {
    if(element.className == 'tab-tool-bar') { targetDiv = element; }
  });
  targetDiv.children[1].innerHTML = displayName;
}
function loadWorkspace(workspaceUrl) {
  const style = "full-view";
  const width = "large-tab";
  const index = getUniqueIndex();
  initializeDiv(style, width, index);

  const webview = getWebviews()[getNumberOfWebviews() - 1];
  webview.addEventListener('dom-ready', function() {
    initializeWebviewForAnotherWorkspace(webview, workspaceUrl);
  });
  webview.addEventListener('page-title-updated', function() {
    const channelName = getChannelName(webview);
    updateChannelNameIfNeeded(channelName, index);
  });
}
function addButtons(div, index) {
  let divForButtons = div.children[0];
  divForButtons.innerHTML = `<button onclick=reload(${index});>Reload</button>`;
  divForButtons.innerHTML += `<button onclick=remove(${index});>Remove Column</button>`;
  divForButtons.innerHTML += '<button onclick=add();>Add Column</button>';
}
function initializeDiv(style, width, index) {
  const generatedDivs = generateTab(width, style);
  addButtons(generatedDivs['divTabToolBar'], getUniqueIndex());

  // update unique index
  incrementUniqueIndex();
}
function generateTab(width, style) {
  let divContainer = createContainerDiv(getUniqueIndex(), width);
  let divTabToolBar = createToolBarDiv();
  let divWebview = createWebviewDiv();
  let webview = createWebview(style);
  let root = getRootElement();

  root.appendChild(divContainer);
  divContainer.appendChild(divWebview);
  divWebview.appendChild(divTabToolBar);
  divWebview.appendChild(webview);

  return {
    divContainer: divContainer,
    divTabToolBar: divTabToolBar,
    divWebview: divWebview
  };
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

  let buttonDiv = document.createElement('div');
  buttonDiv.className = 'tab-tool-bar-button';
  divTabToolBar.appendChild(buttonDiv);

  let channelNameDiv = document.createElement('div');
  channelNameDiv.className = 'tab-tool-bar-channel';
  divTabToolBar.appendChild(channelNameDiv);

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
  // Hack: remove EventListener if already added
  webview.removeEventListener('new-window', openExternalUrl);
  webview.addEventListener('new-window', openExternalUrl);
}
function openExternalUrl(event){
  shell.openExternal(event.url);
};
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
