const SETTINGS = {
  minDistance: 12,
  cancelRadius: 24,
  lineWidth: 4,
  trailColors: {
    normal: "#ff3b30",
    link: "#1e90ff",
    text: "#2ecc71"
  },
  previewOffset: { x: 14, y: 16 }
};

// ジェスチャーごとの動作定義
const ACTIONS = {
  normal: {
    L: { label: "戻る", action: { type: "historyBack" } },
    R: { label: "進む", action: { type: "historyForward" } },
    URDL: { label: "更新", action: { type: "reload" } },
    U: { label: "トップへ", action: { type: "scrollTop" } },
    D: { label: "ボトムへ", action: { type: "scrollBottom" } },
    DR: { label: "タブを閉じる", action: { type: "closeTab" } },
    DU: { label: "閉じたタブを開く", action: { type: "reopenTab" } },
    RU: { label: "新しいタブ", action: { type: "newTab" } },
    RR: { label: "タブを右へ", action: { type: "moveTabRight" } },
    LL: { label: "タブを左へ", action: { type: "moveTabLeft" } }
  },
  link: {
    U: { label: "新規タブ(前面)", action: { type: "openLink", active: true } },
    D: { label: "新規タブ(背面)", action: { type: "openLink", active: false } },
    L: { label: "URLをコピー", action: { type: "copyLinkUrl" } },
    R: { label: "テキストをコピー", action: { type: "copyLinkText" } }
  },
  text: {
    R: { label: "Google検索", action: { type: "searchGoogle" } }
  }
};

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
  selectionText: ""
};

let blockNextClick = false;
let suppressContextMenu = false;
let canvas = null;
let ctx = null;
let preview = null;

// 入力イベントの監視を開始する
document.addEventListener("mousedown", onMouseDown, true);
document.addEventListener("mousemove", onMouseMove, true);
document.addEventListener("mouseup", onMouseUp, true);
document.addEventListener("contextmenu", onContextMenu, true);
document.addEventListener("dragstart", onDragStart, true);
document.addEventListener("click", onClick, true);
document.addEventListener("keydown", onKeyDown, true);
window.addEventListener("resize", onResize, true);

// 押下開始時にジェスチャー種別を決定する
function onMouseDown(event) {
  if (event.button === 2) {
    startGesture("normal", event, {});
    return;
  }

  if (event.button !== 0) {
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

  const selectionText = getSelectionText();
  if (selectionText) {
    startGesture("text", event, { selectionText });
  }
}

// 移動量から方向列を生成する
function onMouseMove(event) {
  if (!state.active) {
    return;
  }

  const x = event.clientX;
  const y = event.clientY;

  drawTrail(state.lastX, state.lastY, x, y);
  state.lastX = x;
  state.lastY = y;

  const segmentDx = x - state.segmentX;
  const segmentDy = y - state.segmentY;
  const segmentDistance = Math.hypot(segmentDx, segmentDy);

  if (!state.hasMoved && distanceBetween(state.startX, state.startY, x, y) >= SETTINGS.minDistance) {
    state.hasMoved = true;
  }

  if (segmentDistance < SETTINGS.minDistance) {
    updatePreviewPosition(x, y);
    return;
  }

  const direction = getDirection(segmentDx, segmentDy);
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

  updatePreviewPosition(x, y);
}

// ボタンを離したら最終判定を行う
function onMouseUp(event) {
  if (!state.active || event.button !== state.button) {
    return;
  }

  const key = state.path.join("");
  const shouldExecute = state.hasMoved && key && !state.cancelled;

  if (shouldExecute) {
    const executed = executeAction(state.type, key);
    if (executed && (state.type === "link" || state.type === "text")) {
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

// ブラウザのドラッグ開始を抑止する
function onDragStart(event) {
  if (state.active) {
    event.preventDefault();
  }
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
  if (canvas) {
    resizeCanvas();
  }
}

// ジェスチャーを開始する
function startGesture(type, event, context) {
  ensureOverlay();

  state.active = true;
  state.type = type;
  state.button = event.button;
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

  setTrailStyle(type);
  clearTrail();
  hidePreview();
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
  state.hasMoved = false;
  state.cancelled = false;

  clearTrail();
  hidePreview();

  if (keepSuppressMenu) {
    // コンテキストメニューの発火タイミングに合わせて少しだけ保持する
    setTimeout(() => {
      suppressContextMenu = false;
    }, 300);
  }
}

// 方向列に対応するアクションを実行する
function executeAction(type, key) {
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
      if (state.linkUrl) {
        sendMessage({ type: "openTab", url: state.linkUrl, active: action.active });
        return true;
      }
      return false;
    case "copyLinkUrl":
      return copyToClipboard(state.linkUrl);
    case "copyLinkText":
      return copyToClipboard(state.linkText);
    case "searchGoogle": {
      const text = state.selectionText.trim();
      if (!text) {
        return false;
      }
      const url = `https://www.google.com/search?q=${encodeURIComponent(text)}`;
      sendMessage({ type: "openTab", url, active: true });
      return true;
    }
    default:
      return false;
  }
}

function getActionEntry(type, key) {
  const map = ACTIONS[type];
  return map ? map[key] : null;
}

// バックグラウンドへメッセージを送る
function sendMessage(message) {
  if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
    chrome.runtime.sendMessage(message);
  }
}

// 方向を上下左右の1文字に変換する
function getDirection(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "R" : "L";
  }
  return dy >= 0 ? "D" : "U";
}

function findLinkElement(target) {
  if (!target || !target.closest) {
    return null;
  }
  return target.closest("a[href]");
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

// 画面上に描画用レイヤーを準備する
function ensureOverlay() {
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

  resizeCanvas();
}

// 高DPIでも崩れないように補正する
function resizeCanvas() {
  if (!canvas || !ctx) {
    return;
  }

  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.floor(window.innerWidth * ratio);
  canvas.height = Math.floor(window.innerHeight * ratio);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

// ジェスチャー種別に応じて線の色を切り替える
function setTrailStyle(type) {
  if (!ctx) {
    return;
  }
  ctx.lineWidth = SETTINGS.lineWidth;
  ctx.lineCap = "round";
  ctx.strokeStyle = SETTINGS.trailColors[type] || SETTINGS.trailColors.normal;
}

// マウスの軌跡を描画する
function drawTrail(fromX, fromY, toX, toY) {
  if (!ctx) {
    return;
  }
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
}

// 描画済みの線を消去する
function clearTrail() {
  if (!ctx || !canvas) {
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// プレビュー表示を更新する
function updatePreviewText(forcedText) {
  if (!preview) {
    return;
  }

  const text = forcedText || (state.cancelled ? "キャンセル" : getPreviewLabel());
  if (!text) {
    preview.style.display = "none";
    return;
  }

  preview.textContent = text;
  preview.style.display = "block";
}

// プレビューをカーソル付近に移動する
function updatePreviewPosition(x, y) {
  if (!preview || preview.style.display === "none") {
    return;
  }
  preview.style.left = `${x + SETTINGS.previewOffset.x}px`;
  preview.style.top = `${y + SETTINGS.previewOffset.y}px`;
}

// プレビューを非表示にする
function hidePreview() {
  if (preview) {
    preview.style.display = "none";
    preview.textContent = "";
  }
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
