// バックグラウンド側でタブ操作を実行する
chrome.runtime.onMessage.addListener((message, sender) => {
  if (!message || typeof message.type !== "string") {
    return;
  }

  switch (message.type) {
    case "closeTab": {
      if (sender.tab && typeof sender.tab.id === "number") {
        chrome.tabs.remove(sender.tab.id);
      }
      break;
    }
    case "reopenTab": {
      chrome.sessions.restore();
      break;
    }
    case "newTab": {
      const createProps = {
        url: message.url || "chrome://newtab",
        active: message.active !== false
      };
      // 呼び出し元がタブなら、その右隣に開き、親子関係を持たせる
      if (sender.tab && typeof sender.tab.id === "number") {
        createProps.openerTabId = sender.tab.id;
        createProps.index = sender.tab.index + 1;
      }
      chrome.tabs.create(createProps);
      break;
    }
    case "openTab": {
      if (typeof message.url === "string" && message.url) {
        const createProps = {
          url: message.url,
          active: message.active !== false
        };
        // 呼び出し元タブIDを指定することで、YouTube等のフォーカス奪還に対抗する
        if (sender.tab && typeof sender.tab.id === "number") {
          createProps.openerTabId = sender.tab.id;
          createProps.index = sender.tab.index + 1;
        }
        chrome.tabs.create(createProps);
      }
      break;
    }
    case "openTabIncognito": {
      if (typeof message.url === "string" && message.url) {
        openUrlInIncognitoWindow(message.url, message.active !== false);
      }
      break;
    }
    case "moveTab": {
      if (sender.tab) {
        moveTabInWindow(sender.tab, message.direction);
      }
      break;
    }
    default:
      break;
  }
});

function openUrlInIncognitoWindow(url, focus) {
  // 既存のシークレットウィンドウを優先して使い、増殖を避ける
  chrome.windows.getAll({}, (windows) => {
    const incognitoWindow = Array.isArray(windows) ? windows.find((win) => win && win.incognito) : null;

    if (incognitoWindow && typeof incognitoWindow.id === "number") {
      chrome.tabs.create({ windowId: incognitoWindow.id, url, active: focus });
      return;
    }

    chrome.windows.create({ url, incognito: true, focused: focus }, () => {
      // シークレット許可が無い場合に備え、例外ではなく失敗として扱う
      if (chrome.runtime.lastError) {
        console.warn("Failed to open incognito window:", chrome.runtime.lastError.message);
      }
    });
  });
}

// 現在のタブを左右に移動する
function moveTabInWindow(tab, direction) {
  if (
    typeof tab.id !== "number" ||
    typeof tab.index !== "number" ||
    typeof tab.windowId !== "number"
  ) {
    return;
  }

  const delta = direction === "left" ? -1 : direction === "right" ? 1 : 0;
  if (delta === 0) {
    return;
  }

  chrome.tabs.query({ windowId: tab.windowId }, (tabs) => {
    if (!Array.isArray(tabs) || tabs.length === 0) {
      return;
    }

    const maxIndex = tabs.length - 1;
    const newIndex = Math.max(0, Math.min(tab.index + delta, maxIndex));
    if (newIndex === tab.index) {
      return;
    }

    chrome.tabs.move(tab.id, { index: newIndex });
  });
}
