module.exports = class Library {
  static getOtherWorkspacesInfo(otherUrls) {
    const nameAndUrls = otherUrls.map((url) => {
      const workspaceName = new URL(url).hostname.replace(/.slack.com/g, '');
      return { name: workspaceName, url: new URL(url) };
    });
    return nameAndUrls;
  }

  static getWebviews() {
    return Array.from(document.getElementsByTagName('webview'));
  }

  static getNumberOfWebviews() {
    return this.getWebviews().length;
  }

  static getOnlySidebarCss() {
    const disableChannelList = '.p-workspace__sidebar { display: none !important; }';
    const widenSidebar = '.p-workspace--context-pane-expanded { grid-template-columns: 0px auto 100% !important; }';
    const disableTeamHeader = '.p-classic_nav__team_header { display: none !important; }';
    const disableChannelHeader = '.p-classic_nav__channel_header { display: none !important; }';
    const disableBody = '.p-workspace__primary_view { display: none !important; }';
    return (
      disableChannelList + widenSidebar + disableTeamHeader + disableChannelHeader + disableBody
    );
  }

  static getOnlyChannelCss() {
    const disableBody = '.p-workspace__primary_view { display: none !important; }';
    const disableChannelHeader = '.p-classic_nav__channel_header { display: none !important; }';
    const disableRightHeader = '.p-classic_nav__right_header { display: none !important; }';
    const disableSidebar = '.p-workspace__secondary_view { display: none !important; }';
    return disableBody + disableChannelHeader + disableRightHeader + disableSidebar;
  }

  static getOnlyBodyCss() {
    const disableChannelList = '.p-workspace__sidebar { display: none !important; }';
    const disableTeamHeader = '.p-classic_nav__team_header { display: none !important; }';
    const widenBody = '.p-workspace--context-pane-collapsed { grid-template-columns: 0px auto !important; }';
    const adjustHeight = '.p-workspace--classic-nav { grid-template-rows: min-content 60px auto !important; }';
    const adjustLeftPadding = '.p-workspace--context-pane-expanded { grid-template-columns: 0px auto !important; }';
    return disableChannelList + widenBody + adjustHeight + disableTeamHeader + adjustLeftPadding;
  }

  static isUrl(str) {
    try {
      const url = new URL(str);
      return url;
    } catch (err) {
      return false;
    }
  }

  static modifySlackUrl(url) {
    const isThread = url.href.includes('thread_ts');
    if (!isThread) {
      return url.href.replace('archives', 'messages');
    }

    const parentMessageId = `p${url.search.replace(/(\?thread_ts=)|(&cid.*)|(\.)/g, '')}`;
    const channelId = url.pathname.split('/')[2];
    return `${url.origin}/messages/${channelId}/${parentMessageId}`;
  }

  static validateUrl(url) {
    const cond1 = url.protocol === 'http:' || url.protocol === 'https:';
    const cond2 = url.hostname.endsWith('.slack.com');
    return cond1 && cond2;
  }

  static createContainerDiv(index, width) {
    const div = document.createElement('div');
    div.id = index;
    div.className = width;
    return div;
  }

  static createToolBarDiv() {
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

  static createWebviewDiv() {
    const divWebview = document.createElement('div');
    divWebview.className = 'webview';
    return divWebview;
  }

  static createWebview(style) {
    const webview = document.createElement('webview');
    webview.src = 'about:blank';
    webview.id = style;
    return webview;
  }

  static setWebviewAutosize(webview, autosize) {
    const newWebview = webview;
    newWebview.autosize = autosize;
    return newWebview;
  }

  static getChannelUrl(baseUrl, channelId) {
    const url = `messages/${channelId}`;
    return new URL(url, baseUrl).href.toString();
  }

  static shouldRenderOnlyChannelList(webview) {
    return webview.id === 'channel-only';
  }

  static shouldRenderOnlyBody(webview) {
    return webview.id === 'body-only';
  }

  static shouldRenderOnlySidebar(webview) {
    return webview.id === 'sidebar-only';
  }

  static checkUrlIsDefault(webview) {
    return webview.attributes.src.value === 'about:blank';
  }

  static validateJson(jsonObj) {
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
};
