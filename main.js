// global variables
const json = require('./settings.json');
const { shell } = require('electron')
const contents = json.contents;

// initialize function
initialize();

function initialize() {
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
function getWebviews() {
  return Array.from(document.getElementsByTagName("webview"));
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
  const channel = "general";
  const index = getWebviews().length;
  initializeDiv(style, width, index);

  let webview = getWebviews()[index];
  webview.addEventListener('dom-ready', function() {
    initializeWebview(webview, channel);
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
