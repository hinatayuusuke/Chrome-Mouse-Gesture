function executeAction(type, key, context) {
  const entry = getActionEntry(type, key);
  if (!entry) {
    return false;
  }

  const action = entry.action;
  switch (action.type) {
    case "historyBack":
      window.history.back();
      return true;
    case "historyForward":
      window.history.forward();
      return true;
    case "reload":
      window.location.reload();
      return true;
    case "scrollTop":
      window.scrollTo({ top: 0, behavior: "smooth" });
      return true;
    case "scrollBottom":
      window.scrollTo({ top: getDocumentBottom(), behavior: "smooth" });
      return true;
    case "closeTab":
      sendMessage({ type: "closeTab" });
      return true;
    case "reopenTab":
      sendMessage({ type: "reopenTab" });
      return true;
    case "newTab":
      sendMessage({ type: "newTab" });
      return true;
    case "moveTabLeft":
      sendMessage({ type: "moveTab", direction: "left" });
      return true;
    case "moveTabRight":
      sendMessage({ type: "moveTab", direction: "right" });
      return true;
    case "openLink":
      if (context.linkUrl) {
        sendMessage({ type: "openTab", url: context.linkUrl, active: action.active });
        return true;
      }
      return false;
    case "openLinkIncognito":
      if (context.linkUrl) {
        sendMessage({ type: "openTabIncognito", url: context.linkUrl, active: true });
        return true;
      }
      return false;
    case "openImage":
      if (context.imageUrl) {
        sendMessage({ type: "openTab", url: context.imageUrl, active: action.active });
        return true;
      }
      return false;
    case "openImageIncognito":
      if (context.imageUrl) {
        sendMessage({ type: "openTabIncognito", url: context.imageUrl, active: true });
        return true;
      }
      return false;
    case "copyLinkUrl":
      return copyToClipboard(context.linkUrl);
    case "copyLinkText":
      return copyToClipboard(context.linkText);
    case "copyImageUrl":
      return copyToClipboard(context.imageUrl);
    case "searchGoogle": {
      const text = (context.selectionText || "").trim();
      if (!text) {
        return false;
      }
      const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
      sendMessage({ type: "openTab", url, active: true });
      return true;
    }
    case "copySelectionText":
      return copyToClipboard((context.selectionText || "").trim());
    default:
      return false;
  }
}

function getActionEntry(type, key) {
  const map = actionMap[type];
  return map ? map[key] : null;
}

// タブ操作はコンテンツから直接できないためバックグラウンド経由にする
function sendMessage(message) {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }
  chrome.runtime.sendMessage(message);
}

function buildActionMap(source) {
  const map = { normal: {}, link: {}, text: {}, image: {} };
  Object.entries(source.gestures || {}).forEach(([key, gesture]) => {
    const def = ACTION_DEFS[gesture.action];
    if (!def) {
      return;
    }
    const label = typeof gesture.label === "string" && gesture.label.trim()
      ? gesture.label.trim()
      : getActionLabel(gesture.action, SETTINGS.language);
    map.normal[key] = { label, action: def.action };
  });

  ["link", "text", "image"].forEach((context) => {
    const contextMap = (source.dragGestures || {})[context] || {};
    Object.entries(contextMap).forEach(([dir, actionKey]) => {
      if (!actionKey) {
        return;
      }
      const def = ACTION_DEFS[actionKey];
      if (!def) {
        return;
      }
      map[context][dir] = { label: getActionLabel(actionKey, SETTINGS.language), action: def.action };
    });
  });

  return map;
}

function copyToClipboard(text) {
  if (!text) {
    return false;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    return true;
  }

  return fallbackCopy(text);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.setAttribute("readonly", "");
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(textarea);
  return ok;
}
