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

// mousemove は頻度が高いので、描画と判定を rAF にまとめて負荷を抑える
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

// 移動量から方向を生成する
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
        updatePreviewText(getText("preview.cancel", SETTINGS.language));
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
    // 終了状態を初期化する前に、アクション実行に必要な値だけ退避する
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

  // 新方式: ネイティブドラッグを開始させ、ドロップ場所で動作を決める
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
    // 既定のドロップ挙動(ナビゲーションなど)を抑止する
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

// ジェスチャー完了のクリックを抑止する
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
    updatePreviewText(getText("preview.cancel", SETTINGS.language));
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
  state.originTarget = event.target || null;
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
  state.originTarget = null;
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
    originTarget: state.originTarget,
    linkUrl: state.linkUrl,
    linkText: state.linkText,
    selectionText: state.selectionText,
    imageUrl: state.imageUrl
  };
}

// プレビュー表示を更新する
function updatePreviewText(forcedText) {
  const text = forcedText || (state.cancelled ? getText("preview.cancel", SETTINGS.language) : getPreviewLabel());
  overlay.setPreviewText(text);
}

// 現在の方向から表示名を決定する
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
