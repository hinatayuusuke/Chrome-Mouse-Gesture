const STORAGE_KEY = "gestureMasterConfig";

const DEFAULT_CONFIG = {
  settings: {
    minDistance: 12,
    cancelRadius: 24,
    lineWidth: 4,
    trailOpacity: 0.85,
    angleTolerance: 35,
    dragAllowDiagonal: false,
    dragNativeMode: false,
    trailColors: {
      normal: "#ff3b30",
      link: "#1e90ff",
      text: "#2ecc71",
      image: "#f59e0b"
    },
    previewOffset: { x: 14, y: 16 }
  },
  gestures: {
    L: { action: "historyBack", label: "戻る" },
    R: { action: "historyForward", label: "進む" },
    URDL: { action: "reload", label: "更新" },
    U: { action: "scrollTop", label: "トップへ" },
    D: { action: "scrollBottom", label: "ボトムへ" },
    DR: { action: "closeTab", label: "タブを閉じる" },
    DU: { action: "reopenTab", label: "閉じたタブを開く" },
    RU: { action: "newTab", label: "新しいタブ" },
    RR: { action: "moveTabRight", label: "タブを右へ" },
    LL: { action: "moveTabLeft", label: "タブを左へ" }
  },
  dragGestures: {
    link: {
      U: "openLinkActive",
      D: "openLinkBackground",
      L: "copyLinkUrl",
      R: "copyLinkText"
    },
    text: {
      R: "searchGoogle"
    },
    image: {
      U: "openImageActive",
      D: "openImageBackground",
      L: "copyImageUrl",
      R: ""
    }
  },
  exclusions: []
};

const ACTION_DEFS = {
  historyBack: { label: "戻る", action: { type: "historyBack" } },
  historyForward: { label: "進む", action: { type: "historyForward" } },
  reload: { label: "更新", action: { type: "reload" } },
  scrollTop: { label: "トップへ", action: { type: "scrollTop" } },
  scrollBottom: { label: "ボトムへ", action: { type: "scrollBottom" } },
  closeTab: { label: "タブを閉じる", action: { type: "closeTab" } },
  reopenTab: { label: "閉じたタブを開く", action: { type: "reopenTab" } },
  newTab: { label: "新しいタブ", action: { type: "newTab" } },
  moveTabLeft: { label: "タブを左へ", action: { type: "moveTabLeft" } },
  moveTabRight: { label: "タブを右へ", action: { type: "moveTabRight" } },
  openLinkActive: { label: "新規タブ(前面)", action: { type: "openLink", active: true } },
  openLinkBackground: { label: "新規タブ(背面)", action: { type: "openLink", active: false } },
  openLinkIncognito: { label: "シークレットで開く", action: { type: "openLinkIncognito" } },
  copyLinkUrl: { label: "URLをコピー", action: { type: "copyLinkUrl" } },
  copyLinkText: { label: "テキストをコピー", action: { type: "copyLinkText" } },
  searchGoogle: { label: "Google検索", action: { type: "searchGoogle" } },
  copySelectionText: { label: "選択テキストをコピー", action: { type: "copySelectionText" } },
  openImageActive: { label: "画像を新規タブ(前面)", action: { type: "openImage", active: true } },
  openImageBackground: { label: "画像を新規タブ(背面)", action: { type: "openImage", active: false } },
  openImageIncognito: { label: "画像をシークレットで開く", action: { type: "openImageIncognito" } },
  copyImageUrl: { label: "画像URLをコピー", action: { type: "copyImageUrl" } }
};

const SETTINGS = {
  minDistance: DEFAULT_CONFIG.settings.minDistance,
  cancelRadius: DEFAULT_CONFIG.settings.cancelRadius,
  lineWidth: DEFAULT_CONFIG.settings.lineWidth,
  trailOpacity: DEFAULT_CONFIG.settings.trailOpacity,
  angleTolerance: DEFAULT_CONFIG.settings.angleTolerance,
  dragAllowDiagonal: DEFAULT_CONFIG.settings.dragAllowDiagonal,
  dragNativeMode: DEFAULT_CONFIG.settings.dragNativeMode,
  trailColors: { ...DEFAULT_CONFIG.settings.trailColors },
  previewOffset: { ...DEFAULT_CONFIG.settings.previewOffset }
};

let config = deepClone(DEFAULT_CONFIG);
let actionMap = buildActionMap(config);
let exclusionMatchers = [];
let gesturesEnabled = true;

const state = {
  active: false,
  type: null,
  button: null,
  startX: 0,
  startY: 0,
  lastX: 0,
  lastY: 0,
  segmentX: 0,
  segmentY: 0,
  hasMoved: false,
  cancelled: false,
  path: [],
  linkUrl: "",
  linkText: "",
  selectionText: "",
  imageUrl: "",
  nativeDrag: false,
  dropInside: false
};

let blockNextClick = false;
let suppressContextMenu = false;
const overlay = createGestureOverlay();
const moveScheduler = {
  ticking: false,
  pendingX: 0,
  pendingY: 0
};

startConfigSync();

// mousemove は頻度が高いので、描画と判定は rAF にまとめて負荷を抑える
document.addEventListener("mousedown", onMouseDown, true);
document.addEventListener("mousemove", onMouseMove, true);
document.addEventListener("mouseup", onMouseUp, true);
document.addEventListener("contextmenu", onContextMenu, true);
document.addEventListener("dragstart", onDragStart, true);
document.addEventListener("dragover", onDragOver, true);
document.addEventListener("drop", onDrop, true);
document.addEventListener("dragend", onDragEnd, true);
document.addEventListener("click", onClick, true);
document.addEventListener("keydown", onKeyDown, true);
window.addEventListener("resize", onResize, true);

// 押下開始時にジェスチャー種別を決定する
function onMouseDown(event) {
  if (!gesturesEnabled) {
    return;
  }

  if (event.button === 2) {
    startGesture("normal", event, {});
    return;
  }

  if (event.button !== 0) {
    return;
  }

  if (SETTINGS.dragNativeMode) {
    return;
  }

  const link = findLinkElement(event.target);
  if (link) {
    startGesture("link", event, {
      linkUrl: link.href,
      linkText: link.textContent || link.href
    });
    return;
  }

  const image = findImageElement(event.target);
  if (image) {
    startGesture("image", event, {
      imageUrl: image.currentSrc || image.src
    });
    return;
  }

  const selectionText = getSelectionText();
  if (selectionText) {
    startGesture("text", event, { selectionText });
  }
}

function schedulePointerMove(x, y) {
  if (!state.active) {
    return;
  }

  moveScheduler.pendingX = x;
  moveScheduler.pendingY = y;
  if (moveScheduler.ticking) {
    return;
  }
  moveScheduler.ticking = true;
  window.requestAnimationFrame(() => {
    moveScheduler.ticking = false;
    processMouseMove(moveScheduler.pendingX, moveScheduler.pendingY);
  });
}

// 移動量から方向列を生成する
function onMouseMove(event) {
  if (!state.active) {
    return;
  }

  schedulePointerMove(event.clientX, event.clientY);
}

function processMouseMove(x, y) {
  if (!state.active) {
    return;
  }

  overlay.drawTrail(state.lastX, state.lastY, x, y);
  state.lastX = x;
  state.lastY = y;

  const segmentDx = x - state.segmentX;
  const segmentDy = y - state.segmentY;
  const segmentDistance = Math.hypot(segmentDx, segmentDy);

  if (!state.hasMoved && distanceBetween(state.startX, state.startY, x, y) >= SETTINGS.minDistance) {
    state.hasMoved = true;
  }

  if (segmentDistance < SETTINGS.minDistance) {
    overlay.updatePreviewPosition(x, y);
    return;
  }

  const allowDiagonal = SETTINGS.dragAllowDiagonal && state.type !== "normal";
  const direction = getDirection(segmentDx, segmentDy, allowDiagonal);
  if (direction && state.path[state.path.length - 1] !== direction) {
    state.path.push(direction);
    updatePreviewText();
  }

  state.segmentX = x;
  state.segmentY = y;

  if (!state.cancelled && state.path.length >= 2) {
    const backToStart = distanceBetween(state.startX, state.startY, x, y) <= SETTINGS.cancelRadius;
    if (backToStart) {
      state.cancelled = true;
      updatePreviewText("キャンセル");
    }
  }

  if (state.type === "normal" && state.hasMoved) {
    suppressContextMenu = true;
  }

  overlay.updatePreviewPosition(x, y);
}

// ボタンを離したら最終判定を行う
function onMouseUp(event) {
  if (!state.active || event.button !== state.button) {
    return;
  }

  if (state.nativeDrag) {
    return;
  }

  const key = state.path.join("");
  const shouldExecute = state.hasMoved && key && !state.cancelled;

  if (shouldExecute) {
    // 終了処理で状態を初期化する前に、アクション実行に必要な情報だけ退避する
    const executed = executeAction(state.type, key, getActionContext());
    if (executed && (state.type === "link" || state.type === "text" || state.type === "image")) {
      blockNextClick = true;
    }
  }

  endGesture();
}

// 右クリックの標準メニューを制御する
function onContextMenu(event) {
  if (suppressContextMenu) {
    event.preventDefault();
    suppressContextMenu = false;
  }
}

function onDragStart(event) {
  if (!gesturesEnabled) {
    return;
  }

  if (!SETTINGS.dragNativeMode) {
    // 旧方式: ドラッグ開始を抑止して mousemove/mouseup で判定する
    if (state.active) {
      event.preventDefault();
    }
    return;
  }

  // 新方式: ネイティブドラッグを開始させ、ドロップ場所で動作を分ける
  if (state.active) {
    return;
  }

  const info = getNativeDragGestureInfo(event);
  if (!info) {
    return;
  }

  startGesture(info.type, event, { ...info.context, nativeDrag: true });
}

function onDragOver(event) {
  if (!state.active || !state.nativeDrag) {
    return;
  }

  schedulePointerMove(event.clientX, event.clientY);

  const minDistance = typeof SETTINGS.minDistance === "number" ? SETTINGS.minDistance : 12;
  if (distanceBetween(state.startX, state.startY, event.clientX, event.clientY) >= minDistance) {
    // ページ内ドロップ判定のために drop を有効化する
    event.preventDefault();
  }
}

function onDrop(event) {
  if (!state.active || !state.nativeDrag) {
    return;
  }

  state.dropInside = true;
  processMouseMove(event.clientX, event.clientY);

  const key = state.path.join("");
  const shouldExecute = state.hasMoved && key && !state.cancelled;

  if (state.hasMoved) {
    // 既定のドロップ挙動（ナビゲーションなど）を抑止する
    event.preventDefault();
    event.stopPropagation();
  }

  if (shouldExecute) {
    const executed = executeAction(state.type, key, getActionContext());
    if (executed && (state.type === "link" || state.type === "text" || state.type === "image")) {
      blockNextClick = true;
    }
  }
}

function onDragEnd() {
  if (!state.active || !state.nativeDrag) {
    return;
  }
  // ページ外にドロップされた場合は drop が来ないため、ここでは何も実行せず終了だけ行う
  endGesture();
}

function getNativeDragGestureInfo(event) {
  const link = findLinkElement(event.target);
  if (link) {
    return {
      type: "link",
      context: {
        linkUrl: link.href,
        linkText: link.textContent || link.href
      }
    };
  }

  const image = findImageElement(event.target);
  if (image) {
    return {
      type: "image",
      context: {
        imageUrl: image.currentSrc || image.src
      }
    };
  }

  const selectionText = getSelectionText();
  if (selectionText && !isEditableTarget(event.target)) {
    return {
      type: "text",
      context: { selectionText }
    };
  }

  return null;
}

function isEditableTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  const host = target.closest("input, textarea, [contenteditable]");
  if (!host) {
    return false;
  }

  if (host instanceof HTMLTextAreaElement) {
    return true;
  }

  if (host instanceof HTMLInputElement) {
    const type = (host.type || "").toLowerCase();
    return !["button", "checkbox", "radio", "submit", "reset", "file", "range", "color"].includes(type);
  }

  return host instanceof HTMLElement ? host.isContentEditable : false;
}

// ジェスチャー完了時のクリックを抑止する
function onClick(event) {
  if (blockNextClick) {
    event.preventDefault();
    event.stopPropagation();
    blockNextClick = false;
  }
}

// ESCでキャンセル扱いにする
function onKeyDown(event) {
  if (event.key === "Escape" && state.active) {
    state.cancelled = true;
    updatePreviewText("キャンセル");
  }
}

// 表示領域の変化に追従する
function onResize() {
  overlay.resize();
}

// ジェスチャーを開始する
function startGesture(type, event, context) {
  overlay.ensure();

  state.active = true;
  state.type = type;
  state.button = typeof event.button === "number" ? event.button : 0;
  state.startX = event.clientX;
  state.startY = event.clientY;
  state.lastX = event.clientX;
  state.lastY = event.clientY;
  state.segmentX = event.clientX;
  state.segmentY = event.clientY;
  state.hasMoved = false;
  state.cancelled = false;
  state.path = [];
  state.linkUrl = context.linkUrl || "";
  state.linkText = context.linkText || "";
  state.selectionText = context.selectionText || "";
  state.imageUrl = context.imageUrl || "";
  state.nativeDrag = !!context.nativeDrag;
  state.dropInside = false;

  overlay.setTrailStyle(type);
  overlay.clearTrail();
  overlay.hidePreview();
}

// ジェスチャーを終了して状態をリセットする
function endGesture() {
  const keepSuppressMenu = state.type === "normal" && state.hasMoved;

  state.active = false;
  state.type = null;
  state.button = null;
  state.path = [];
  state.linkUrl = "";
  state.linkText = "";
  state.selectionText = "";
  state.imageUrl = "";
  state.nativeDrag = false;
  state.dropInside = false;
  state.hasMoved = false;
  state.cancelled = false;

  overlay.clearTrail();
  overlay.hidePreview();

  if (keepSuppressMenu) {
    // コンテキストメニューの発火タイミングに合わせて少しだけ保持する
    setTimeout(() => {
      suppressContextMenu = false;
    }, 300);
  }
}

function getActionContext() {
  return {
    linkUrl: state.linkUrl,
    linkText: state.linkText,
    selectionText: state.selectionText,
    imageUrl: state.imageUrl
  };
}

// 方向列に対応するアクションを実行する
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

// タブ操作はコンテンツ側から直接できないためバックグラウンド経由にする
function sendMessage(message) {
  if (typeof chrome === "undefined" || !chrome.runtime || !chrome.runtime.sendMessage) {
    return;
  }
  chrome.runtime.sendMessage(message);
}

// 方向を上下左右の1文字に変換する
function getDirection(dx, dy, allowDiagonal) {
  const absX = Math.abs(dx);
  const absY = Math.abs(dy);
  if (absX === 0 && absY === 0) {
    return null;
  }

  const angle = normalizeAngle((Math.atan2(dy, dx) * 180) / Math.PI);

  if (allowDiagonal) {
    const sector = Math.round(angle / 45) % 8;
    switch (sector) {
      case 0:
        return "R";
      case 1:
        return "DR";
      case 2:
        return "D";
      case 3:
        return "DL";
      case 4:
        return "L";
      case 5:
        return "UL";
      case 6:
        return "U";
      case 7:
        return "UR";
      default:
        return null;
    }
  }

  const axis = absX >= absY ? (dx >= 0 ? 0 : 180) : dy >= 0 ? 90 : 270;
  const tolerance = typeof SETTINGS.angleTolerance === "number" ? SETTINGS.angleTolerance : 45;
  if (angleDiff(angle, axis) > tolerance) {
    return null;
  }

  if (absX >= absY) {
    return dx >= 0 ? "R" : "L";
  }
  return dy >= 0 ? "D" : "U";
}

function normalizeAngle(angle) {
  return (angle + 360) % 360;
}

function angleDiff(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

function findLinkElement(target) {
  if (!target || !target.closest) {
    return null;
  }
  return target.closest("a[href]");
}

function findImageElement(target) {
  if (!target || !target.closest) {
    return null;
  }
  const image = target.closest("img");
  if (image && image.src) {
    return image;
  }
  return null;
}

function getSelectionText() {
  const selection = window.getSelection();
  return selection ? selection.toString().trim() : "";
}

// ページ最下部の高さを取得する
function getDocumentBottom() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
}

// 画面への常駐要素を必要時のみ生成し、通常の閲覧体験への影響を最小化する
function createGestureOverlay() {
  let canvas = null;
  let ctx = null;
  let preview = null;

  function ensure() {
    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.style.position = "fixed";
      canvas.style.left = "0";
      canvas.style.top = "0";
      canvas.style.pointerEvents = "none";
      canvas.style.zIndex = "2147483647";
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      document.documentElement.appendChild(canvas);
      ctx = canvas.getContext("2d");
    }

    if (!preview) {
      preview = document.createElement("div");
      preview.style.position = "fixed";
      preview.style.pointerEvents = "none";
      preview.style.zIndex = "2147483647";
      preview.style.padding = "6px 10px";
      preview.style.borderRadius = "10px";
      preview.style.background = "rgba(0, 0, 0, 0.75)";
      preview.style.color = "#fff";
      preview.style.fontSize = "12px";
      preview.style.fontFamily = "sans-serif";
      preview.style.whiteSpace = "nowrap";
      preview.style.display = "none";
      document.documentElement.appendChild(preview);
    }

    resize();
  }

  function resize() {
    if (!canvas || !ctx) {
      return;
    }

    // 高DPI 環境でも線の太さと座標を一致させたい
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.floor(window.innerWidth * ratio);
    canvas.height = Math.floor(window.innerHeight * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function setTrailStyle(type) {
    if (!ctx) {
      return;
    }
    ctx.lineWidth = SETTINGS.lineWidth;
    ctx.lineCap = "round";
    ctx.strokeStyle = SETTINGS.trailColors[type] || SETTINGS.trailColors.normal;
    ctx.globalAlpha = SETTINGS.trailOpacity;
  }

  function drawTrail(fromX, fromY, toX, toY) {
    if (!ctx) {
      return;
    }
    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();
  }

  function clearTrail() {
    if (!ctx || !canvas) {
      return;
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function setPreviewText(text) {
    if (!preview) {
      return;
    }
    if (!text) {
      preview.style.display = "none";
      preview.textContent = "";
      return;
    }
    preview.textContent = text;
    preview.style.display = "block";
  }

  function updatePreviewPosition(x, y) {
    if (!preview || preview.style.display === "none") {
      return;
    }
    preview.style.left = `${x + SETTINGS.previewOffset.x}px`;
    preview.style.top = `${y + SETTINGS.previewOffset.y}px`;
  }

  function hidePreview() {
    if (preview) {
      preview.style.display = "none";
      preview.textContent = "";
    }
  }

  return {
    ensure,
    resize,
    setTrailStyle,
    drawTrail,
    clearTrail,
    setPreviewText,
    updatePreviewPosition,
    hidePreview
  };
}

// プレビュー表示を更新する
function updatePreviewText(forcedText) {
  const text = forcedText || (state.cancelled ? "キャンセル" : getPreviewLabel());
  overlay.setPreviewText(text);
}

// 現在の方向列から表示文言を決定する
function getPreviewLabel() {
  if (!state.hasMoved) {
    return "";
  }

  const key = state.path.join("");
  if (!key) {
    return "";
  }

  const entry = getActionEntry(state.type, key);
  if (entry) {
    return entry.label;
  }

  return key;
}

// 座標間の距離を計算する
function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
}

// クリップボードコピーをフォールバック付きで行う
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

function startConfigSync() {
  if (typeof chrome === "undefined" || !chrome.storage || !chrome.storage.local) {
    return;
  }

  chrome.storage.local.get(STORAGE_KEY, (data) => {
    applyConfig(data[STORAGE_KEY]);
  });

  if (!chrome.storage.onChanged) {
    return;
  }

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[STORAGE_KEY]) {
      return;
    }
    applyConfig(changes[STORAGE_KEY].newValue);
  });
}

function applyConfig(stored) {
  config = mergeConfig(DEFAULT_CONFIG, stored);
  Object.assign(SETTINGS, config.settings);
  SETTINGS.trailColors = {
    ...DEFAULT_CONFIG.settings.trailColors,
    ...(config.settings ? config.settings.trailColors : {})
  };
  SETTINGS.previewOffset = {
    ...DEFAULT_CONFIG.settings.previewOffset,
    ...(config.settings ? config.settings.previewOffset : {})
  };
  actionMap = buildActionMap(config);
  exclusionMatchers = compileExclusions(config.exclusions || []);
  updateEnabledState();
}

function buildActionMap(source) {
  const map = { normal: {}, link: {}, text: {}, image: {} };
  Object.entries(source.gestures || {}).forEach(([key, gesture]) => {
    const def = ACTION_DEFS[gesture.action];
    if (!def) {
      return;
    }
    const label = typeof gesture.label === "string" && gesture.label.trim() ? gesture.label.trim() : def.label;
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
      map[context][dir] = { label: def.label, action: def.action };
    });
  });

  return map;
}

function updateEnabledState() {
  gesturesEnabled = !isExcludedUrl(window.location.href);
  if (!gesturesEnabled && state.active) {
    endGesture();
  }
}

function isExcludedUrl(url) {
  return exclusionMatchers.some((matcher) => matcher.test(url));
}

function compileExclusions(exclusions) {
  return exclusions
    .map((entry) => normalizeExclusion(entry))
    .filter(Boolean)
    .map((entry) => patternToRegExp(entry))
    .filter(Boolean);
}

function normalizeExclusion(entry) {
  if (!entry || typeof entry !== "string") {
    return "";
  }
  const value = entry.trim();
  if (!value) {
    return "";
  }
  if (!value.includes("://") && !value.includes("/")) {
    return `*://${value}/*`;
  }
  return value;
}

function patternToRegExp(pattern) {
  try {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\*]/g, "\\$&");
    const regexString = `^${escaped.replace(/\\\*/g, ".*")}$`;
    return new RegExp(regexString, "i");
  } catch (error) {
    return null;
  }
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function mergeConfig(defaults, stored) {
  if (!stored || typeof stored !== "object") {
    return deepClone(defaults);
  }
  const merged = deepClone(defaults);
  return mergeDeep(merged, stored);
}

function mergeDeep(target, source) {
  Object.keys(source || {}).forEach((key) => {
    const sourceValue = source[key];
    if (Array.isArray(sourceValue)) {
      target[key] = sourceValue.slice();
      return;
    }
    if (sourceValue && typeof sourceValue === "object") {
      if (!target[key] || typeof target[key] !== "object") {
        target[key] = {};
      }
      mergeDeep(target[key], sourceValue);
      return;
    }
    target[key] = sourceValue;
  });
  return target;
}
