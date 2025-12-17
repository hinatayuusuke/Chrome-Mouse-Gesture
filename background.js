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
      chrome.tabs.create({
        url: message.url || "chrome://newtab",
        active: message.active !== false
      });
      break;
    }
    case "openTab": {
      if (typeof message.url === "string" && message.url) {
        chrome.tabs.create({
          url: message.url,
          active: message.active !== false
        });
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
