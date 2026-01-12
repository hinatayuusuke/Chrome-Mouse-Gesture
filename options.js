const STORAGE_KEY = "gestureMasterConfig";

const DEFAULT_CONFIG = {
  settings: {
    language: getDefaultLanguage(),
    minDistance: 12,
    angleTolerance: 35,
    lineWidth: 4,
    trailOpacity: 0.85,
    dragAllowDiagonal: false,
    dragNativeMode: true,
    trailColors: {
      normal: "#ff3b30",
      link: "#1e90ff",
      text: "#2ecc71",
      image: "#f59e0b"
    }
  },
  gestures: {
    L: { action: "historyBack", label: "" },
    R: { action: "historyForward", label: "" },
    URDL: { action: "reload", label: "" },
    U: { action: "scrollTop", label: "" },
    D: { action: "scrollBottom", label: "" },
    DR: { action: "closeTab", label: "" },
    DU: { action: "reopenTab", label: "" },
    RU: { action: "newTab", label: "" },
    UR: { action: "moveTabRight", label: "" },
    UL: { action: "moveTabLeft", label: "" },
    LD: { action: "moveTabFirst", label: "" },
    RD: { action: "moveTabLast", label: "" },
    LR: { action: "pinTab", label: "" },
    RL: { action: "unpinTab", label: "" },
    DL: { action: "duplicateTab", label: "" },
    UDL: { action: "muteTab", label: "" },
    UDR: { action: "unmuteTab", label: "" },
    LUR: { action: "moveTabToNewWindow", label: "" },
    RUL: { action: "openTabIncognitoWindow", label: "" },
    URD: { action: "windowMaximize", label: "" },
    ULD: { action: "windowMinimize", label: "" }
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

const ACTION_CATALOG = [
  { id: "historyBack", group: "navigation" },
  { id: "historyForward", group: "navigation" },
  { id: "reload", group: "navigation" },
  { id: "scrollTop", group: "other" },
  { id: "scrollBottom", group: "other" },
  { id: "closeTab", group: "tab" },
  { id: "reopenTab", group: "tab" },
  { id: "newTab", group: "tab" },
  { id: "moveTabLeft", group: "tab" },
  { id: "moveTabRight", group: "tab" },
  { id: "moveTabFirst", group: "tab" },
  { id: "moveTabLast", group: "tab" },
  { id: "pinTab", group: "tab" },
  { id: "unpinTab", group: "tab" },
  { id: "duplicateTab", group: "tab" },
  { id: "muteTab", group: "tab" },
  { id: "unmuteTab", group: "tab" },
  { id: "moveTabToNewWindow", group: "window" },
  { id: "openTabIncognitoWindow", group: "window" },
  { id: "windowMaximize", group: "window" },
  { id: "windowMinimize", group: "window" },
  { id: "openLinkActive", group: "link" },
  { id: "openLinkBackground", group: "link" },
  { id: "openLinkIncognito", group: "link" },
  { id: "copyLinkUrl", group: "link" },
  { id: "copyLinkText", group: "link" },
  { id: "searchGoogle", group: "text" },
  { id: "copySelectionText", group: "text" },
  { id: "openImageActive", group: "image" },
  { id: "openImageBackground", group: "image" },
  { id: "openImageIncognito", group: "image" },
  { id: "copyImageUrl", group: "image" }
];

const NORMAL_ACTION_IDS = [
  "historyBack",
  "historyForward",
  "reload",
  "scrollTop",
  "scrollBottom",
  "closeTab",
  "reopenTab",
  "newTab",
  "moveTabLeft",
  "moveTabRight",
  "moveTabFirst",
  "moveTabLast",
  "pinTab",
  "unpinTab",
  "duplicateTab",
  "muteTab",
  "unmuteTab",
  "moveTabToNewWindow",
  "openTabIncognitoWindow",
  "windowMaximize",
  "windowMinimize"
];

const DRAG_ACTION_IDS = {
  link: ["openLinkActive", "openLinkBackground", "openLinkIncognito", "copyLinkUrl", "copyLinkText"],
  text: ["searchGoogle", "copySelectionText"],
  image: ["openImageActive", "openImageBackground", "openImageIncognito", "copyImageUrl"]
};

const state = {
  config: deepClone(DEFAULT_CONFIG),
  language: getDefaultLanguage(),
  statusKey: "ui.status.loading",
  saveTimer: null,
  modal: {
    open: false,
    editingKey: null,
    path: ""
  }
};

const elements = {
  navItems: document.querySelectorAll(".nav-item"),
  sections: document.querySelectorAll(".section"),
  saveStatus: document.getElementById("save-status"),
  languageSelect: document.getElementById("language-select"),
  gestureList: document.getElementById("gesture-list"),
  gestureEmpty: document.getElementById("gesture-empty"),
  gestureCardTemplate: document.getElementById("gesture-card-template"),
  pathChipTemplate: document.getElementById("path-chip-template"),
  addGestureTop: document.getElementById("add-gesture-top"),
  addGestureFab: document.getElementById("add-gesture-fab"),
  dragDiagonal: document.getElementById("drag-diagonal"),
  dragNative: document.getElementById("drag-native"),
  dragTabs: document.getElementById("drag-tabs"),
  dragPanels: document.querySelectorAll(".drag-panel"),
  directionPads: document.querySelectorAll(".direction-pad"),
  colorNormal: document.getElementById("color-normal"),
  colorLink: document.getElementById("color-link"),
  colorText: document.getElementById("color-text"),
  lineWidth: document.getElementById("line-width"),
  lineWidthValue: document.getElementById("line-width-value"),
  trailOpacity: document.getElementById("trail-opacity"),
  trailOpacityValue: document.getElementById("trail-opacity-value"),
  minDistance: document.getElementById("min-distance"),
  minDistanceValue: document.getElementById("min-distance-value"),
  angleTolerance: document.getElementById("angle-tolerance"),
  angleToleranceValue: document.getElementById("angle-tolerance-value"),
  trailPreview: document.getElementById("trail-preview"),
  exclusionInput: document.getElementById("exclusion-input"),
  exclusionAdd: document.getElementById("exclusion-add"),
  exclusionList: document.getElementById("exclusion-list"),
  exclusionEmpty: document.getElementById("exclusion-empty"),
  exportBtn: document.getElementById("export-btn"),
  importInput: document.getElementById("import-input"),
  resetBtn: document.getElementById("reset-btn"),
  modal: document.getElementById("gesture-modal"),
  modalTitle: document.getElementById("modal-title"),
  modalPath: document.getElementById("gesture-path"),
  modalAction: document.getElementById("gesture-action"),
  modalLabel: document.getElementById("gesture-label"),
  modalError: document.getElementById("gesture-error"),
  modalSave: document.getElementById("gesture-save"),
  modalClear: document.getElementById("gesture-clear"),
  modalCanvas: document.getElementById("gesture-canvas")
};

const previewState = {
  drawing: false,
  lastPoint: null
};

const recordState = {
  drawing: false,
  lastPoint: null,
  segmentPoint: null,
  path: []
};

init();

function init() {
  bindNavigation();
  bindModal();
  bindLanguageControl();
  bindDragControls();
  bindVisualControls();
  bindExclusions();
  bindTransferControls();
  bindPreviewCanvas();

  setStatusKey("ui.status.loading");
  loadConfig().then((config) => {
    state.config = mergeConfig(DEFAULT_CONFIG, config);
    syncLanguage();
    applyLanguage();
    renderAll();
    setStatusKey("ui.status.loaded");
  });
}

function bindLanguageControl() {
  if (!elements.languageSelect) {
    return;
  }
  elements.languageSelect.addEventListener("change", () => {
    const next = normalizeLanguage(elements.languageSelect.value) || getDefaultLanguage();
    if (state.language === next) {
      return;
    }
    state.language = next;
    state.config.settings.language = next;
    applyLanguage();
    renderAll();
    scheduleSave();
  });
}

function syncLanguage() {
  const language = normalizeLanguage(state.config.settings && state.config.settings.language) || getDefaultLanguage();
  state.config.settings.language = language;
  state.language = language;
}

function applyLanguage() {
  document.documentElement.lang = state.language;
  document.title = getText("ui.pageTitle", state.language);
  if (elements.languageSelect) {
    elements.languageSelect.value = state.language;
  }
  applyI18nToDom();
  refreshModalActionSelect();
  updateModalTitle();
  renderModalPathLabel();
  setStatusKey(state.statusKey);
}

function applyI18nToDom() {
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = getText(element.dataset.i18n, state.language);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.placeholder = getText(element.dataset.i18nPlaceholder, state.language);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((element) => {
    element.setAttribute("aria-label", getText(element.dataset.i18nAria, state.language));
  });
}

function refreshModalActionSelect() {
  if (!elements.modalAction) {
    return;
  }
  const current = elements.modalAction.value;
  buildActionSelect(elements.modalAction, NORMAL_ACTION_IDS);
  if (current) {
    elements.modalAction.value = current;
  }
}

function updateModalTitle() {
  if (!elements.modalTitle) {
    return;
  }
  const key = state.modal.editingKey ? "ui.modal.titleEdit" : "ui.modal.titleAdd";
  elements.modalTitle.textContent = getText(key, state.language);
}

function renderModalPathLabel() {
  if (!elements.modalPath) {
    return;
  }
  if (recordState.drawing) {
    elements.modalPath.textContent = getText("ui.modal.recording", state.language);
    return;
  }
  elements.modalPath.textContent = state.modal.path || getText("ui.modal.pathEmpty", state.language);
}

function bindNavigation() {
  elements.navItems.forEach((item) => {
    item.addEventListener("click", () => {
      elements.navItems.forEach((nav) => nav.classList.remove("is-active"));
      item.classList.add("is-active");
      elements.sections.forEach((section) => {
        section.classList.toggle("is-active", section.id === item.dataset.target);
      });
    });
  });

  elements.addGestureTop.addEventListener("click", () => openGestureModal());
  elements.addGestureFab.addEventListener("click", () => openGestureModal());
}

function bindModal() {
  elements.modal.querySelectorAll("[data-close-modal]").forEach((btn) => {
    btn.addEventListener("click", closeGestureModal);
  });

  elements.modalSave.addEventListener("click", saveGestureFromModal);
  elements.modalClear.addEventListener("click", clearGestureCanvas);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.modal.open) {
      closeGestureModal();
    }
  });

  buildActionSelect(elements.modalAction, NORMAL_ACTION_IDS);
  setupGestureCanvas();
}

function bindDragControls() {
  elements.dragDiagonal.addEventListener("change", () => {
    state.config.settings.dragAllowDiagonal = elements.dragDiagonal.checked;
    scheduleSave();
    renderDragPads();
  });

  elements.dragNative.addEventListener("change", () => {
    state.config.settings.dragNativeMode = elements.dragNative.checked;
    scheduleSave();
  });

  elements.dragTabs.addEventListener("click", (event) => {
    const target = event.target.closest(".tab");
    if (!target) {
      return;
    }
    elements.dragTabs.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("is-active"));
    target.classList.add("is-active");
    elements.dragPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.dragPanel === target.dataset.dragTab);
    });
  });

  elements.directionPads.forEach((pad) => {
    pad.addEventListener("change", (event) => {
      const select = event.target;
      if (!(select instanceof HTMLSelectElement)) {
        return;
      }
      const direction = select.dataset.dir;
      const context = select.dataset.context;
      if (!direction || !context) {
        return;
      }
      if (!state.config.dragGestures[context]) {
        state.config.dragGestures[context] = {};
      }
      state.config.dragGestures[context][direction] = select.value;
      scheduleSave();
    });
  });
}

function bindVisualControls() {
  elements.colorNormal.addEventListener("input", () => {
    state.config.settings.trailColors.normal = elements.colorNormal.value;
    scheduleSave();
    refreshPreview();
  });

  elements.colorLink.addEventListener("input", () => {
    state.config.settings.trailColors.link = elements.colorLink.value;
    scheduleSave();
    refreshPreview();
  });

  elements.colorText.addEventListener("input", () => {
    state.config.settings.trailColors.text = elements.colorText.value;
    scheduleSave();
    refreshPreview();
  });

  elements.lineWidth.addEventListener("input", () => {
    state.config.settings.lineWidth = Number(elements.lineWidth.value);
    updateValue(elements.lineWidthValue, `${elements.lineWidth.value}px`);
    scheduleSave();
    refreshPreview();
  });

  elements.trailOpacity.addEventListener("input", () => {
    state.config.settings.trailOpacity = Number(elements.trailOpacity.value);
    updateValue(elements.trailOpacityValue, elements.trailOpacity.value);
    scheduleSave();
    refreshPreview();
  });

  elements.minDistance.addEventListener("input", () => {
    state.config.settings.minDistance = Number(elements.minDistance.value);
    updateValue(elements.minDistanceValue, `${elements.minDistance.value}px`);
    scheduleSave();
  });

  elements.angleTolerance.addEventListener("input", () => {
    state.config.settings.angleTolerance = Number(elements.angleTolerance.value);
    updateValue(elements.angleToleranceValue, `${elements.angleTolerance.value}°`);
    scheduleSave();
  });
}

function bindExclusions() {
  const addExclusion = () => {
    const value = elements.exclusionInput.value.trim();
    if (!value) {
      return;
    }
    if (!state.config.exclusions.includes(value)) {
      state.config.exclusions.push(value);
      scheduleSave();
      renderExclusions();
    }
    elements.exclusionInput.value = "";
  };

  elements.exclusionAdd.addEventListener("click", addExclusion);
  elements.exclusionInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addExclusion();
    }
  });
}

function bindTransferControls() {
  elements.exportBtn.addEventListener("click", exportConfig);

  elements.importInput.addEventListener("change", (event) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        state.config = mergeConfig(DEFAULT_CONFIG, imported);
        syncLanguage();
        applyLanguage();
        scheduleSave(true);
        renderAll();
      } catch (error) {
        alert(getText("messages.alert.importFailed", state.language));
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  });

  elements.resetBtn.addEventListener("click", () => {
    if (!confirm(getText("messages.confirm.reset", state.language))) {
      return;
    }
    state.config = deepClone(DEFAULT_CONFIG);
    syncLanguage();
    applyLanguage();
    scheduleSave(true);
    renderAll();
  });
}

function bindPreviewCanvas() {
  resizeCanvas(elements.trailPreview);
  window.addEventListener("resize", () => resizeCanvas(elements.trailPreview));

  elements.trailPreview.addEventListener("pointerdown", (event) => {
    previewState.drawing = true;
    previewState.lastPoint = getCanvasPoint(elements.trailPreview, event);
  });

  elements.trailPreview.addEventListener("pointermove", (event) => {
    if (!previewState.drawing) {
      return;
    }
    const point = getCanvasPoint(elements.trailPreview, event);
    drawPreviewLine(previewState.lastPoint, point);
    previewState.lastPoint = point;
  });

  ["pointerup", "pointerleave"].forEach((evt) => {
    elements.trailPreview.addEventListener(evt, () => {
      previewState.drawing = false;
      previewState.lastPoint = null;
    });
  });
}

function renderAll() {
  renderGestureCards();
  renderDragPads();
  renderVisualSettings();
  renderExclusions();
}

function renderGestureCards() {
  const entries = Object.entries(state.config.gestures || {});
  entries.sort((a, b) => a[0].length - b[0].length || a[0].localeCompare(b[0]));
  elements.gestureList.replaceChildren();

  if (entries.length === 0) {
    elements.gestureEmpty.style.display = "block";
    return;
  }
  elements.gestureEmpty.style.display = "none";

  entries.forEach(([key, gesture]) => {
    const card = createGestureCard(key, gesture);
    elements.gestureList.appendChild(card);
  });
}

function createGestureCard(key, gesture) {
  // JS 文字列でDOMを組むと、構造変更とサニタイズの両方が負債になりやすい
  if (!(elements.gestureCardTemplate instanceof HTMLTemplateElement)) {
    throw new Error("gesture-card-template が見つかりません");
  }
  if (!(elements.pathChipTemplate instanceof HTMLTemplateElement)) {
    throw new Error("path-chip-template が見つかりません");
  }

  const card = elements.gestureCardTemplate.content.firstElementChild.cloneNode(true);
  const actionLabel = getActionLabel(gesture.action, state.language);
  const title = gesture.label || actionLabel || getText("ui.common.unassigned", state.language);
  const meta = actionLabel || gesture.action || "";

  const path = card.querySelector('[data-part="path"]');
  const titleNode = card.querySelector('[data-part="title"]');
  const metaNode = card.querySelector('[data-part="meta"]');
  const editButton = card.querySelector('[data-action="edit"]');
  const deleteButton = card.querySelector('[data-action="delete"]');
  if (!path || !titleNode || !metaNode || !editButton || !deleteButton) {
    throw new Error("gesture-card-template の構造が想定と異なります");
  }

  path.replaceChildren(createPathChips(key));
  titleNode.textContent = title;
  metaNode.textContent = meta;

  const editLabel = getText("ui.template.edit", state.language);
  const deleteLabel = getText("ui.template.delete", state.language);
  editButton.setAttribute("aria-label", editLabel);
  editButton.setAttribute("title", editLabel);
  deleteButton.setAttribute("aria-label", deleteLabel);
  deleteButton.setAttribute("title", deleteLabel);
  editButton.addEventListener("click", () => openGestureModal(key));
  deleteButton.addEventListener("click", () => removeGesture(key));

  return card;
}

function createPathChips(key) {
  const fragment = document.createDocumentFragment();
  key.split("").forEach((char) => {
    const chip = elements.pathChipTemplate.content.firstElementChild.cloneNode(true);
    chip.textContent = directionLabel(char);
    fragment.appendChild(chip);
  });
  return fragment;
}

function directionLabel(char) {
  const map = { U: "^", D: "v", L: "<", R: ">" };
  return map[char] || char;
}

function openGestureModal(editKey) {
  state.modal.open = true;
  state.modal.editingKey = editKey || null;
  state.modal.path = editKey || "";
  const current = editKey ? state.config.gestures[editKey] : null;
  updateModalTitle();
  renderModalPathLabel();
  elements.modalAction.value = (current && current.action) || NORMAL_ACTION_IDS[0];
  elements.modalLabel.value = (current && current.label) || "";
  elements.modalError.textContent = "";
  clearGestureCanvas(true);
  elements.modal.classList.add("show");
  elements.modal.setAttribute("aria-hidden", "false");
}

function closeGestureModal() {
  state.modal.open = false;
  elements.modal.classList.remove("show");
  elements.modal.setAttribute("aria-hidden", "true");
}

function saveGestureFromModal() {
  const path = state.modal.path;
  if (!path) {
    showModalError(getText("messages.error.noPath", state.language));
    return;
  }
  const action = elements.modalAction.value;
  if (!action) {
    showModalError(getText("messages.error.noAction", state.language));
    return;
  }

  const duplicate = state.config.gestures[path] && state.modal.editingKey !== path;
  if (duplicate) {
    showModalError(getText("messages.error.duplicate", state.language));
    return;
  }
  if (state.modal.editingKey && state.modal.editingKey !== path) {
    delete state.config.gestures[state.modal.editingKey];
  }

  state.config.gestures[path] = {
    action,
    label: elements.modalLabel.value.trim()
  };
  scheduleSave(true);
  renderGestureCards();
  closeGestureModal();
}

function showModalError(message) {
  elements.modalError.textContent = message;
}

function removeGesture(key) {
  if (!confirm(getText("messages.confirm.deleteGesture", state.language))) {
    return;
  }
  delete state.config.gestures[key];
  scheduleSave(true);
  renderGestureCards();
}

function clearGestureCanvas(keepPath) {
  recordState.drawing = false;
  recordState.lastPoint = null;
  recordState.segmentPoint = null;
  recordState.path = [];
  if (!keepPath) {
    state.modal.path = "";
    renderModalPathLabel();
  }
  const ctx = elements.modalCanvas.getContext("2d");
  ctx.clearRect(0, 0, elements.modalCanvas.width, elements.modalCanvas.height);
}

function setupGestureCanvas() {
  resizeCanvas(elements.modalCanvas);
  window.addEventListener("resize", () => resizeCanvas(elements.modalCanvas));

  elements.modalCanvas.addEventListener("pointerdown", (event) => {
    recordState.drawing = true;
    recordState.lastPoint = getCanvasPoint(elements.modalCanvas, event);
    recordState.segmentPoint = recordState.lastPoint;
    recordState.path = [];
    state.modal.path = "";
    renderModalPathLabel();
  });

  elements.modalCanvas.addEventListener("pointermove", (event) => {
    if (!recordState.drawing) {
      return;
    }
    const point = getCanvasPoint(elements.modalCanvas, event);
    drawGestureLine(recordState.lastPoint, point);
    recordState.lastPoint = point;
    const dx = point.x - recordState.segmentPoint.x;
    const dy = point.y - recordState.segmentPoint.y;
    if (Math.hypot(dx, dy) < state.config.settings.minDistance) {
      return;
    }
    const direction = getCardinalDirection(dx, dy);
    if (direction && recordState.path[recordState.path.length - 1] !== direction) {
      recordState.path.push(direction);
      state.modal.path = recordState.path.join("");
      elements.modalPath.textContent = state.modal.path;
    }
    recordState.segmentPoint = point;
  });

  ["pointerup", "pointerleave"].forEach((evt) => {
    elements.modalCanvas.addEventListener(evt, () => {
      if (!recordState.drawing) {
        return;
      }
      recordState.drawing = false;
      if (!state.modal.path) {
        renderModalPathLabel();
      }
    });
  });
}

function getCardinalDirection(dx, dy) {
  if (Math.abs(dx) >= Math.abs(dy)) {
    return dx >= 0 ? "R" : "L";
  }
  return dy >= 0 ? "D" : "U";
}

function drawGestureLine(from, to) {
  const ctx = elements.modalCanvas.getContext("2d");
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  ctx.strokeStyle = "rgba(15, 118, 110, 0.8)";
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
}

function renderDragPads() {
  elements.dragDiagonal.checked = !!state.config.settings.dragAllowDiagonal;
  elements.dragNative.checked = !!state.config.settings.dragNativeMode;
  elements.directionPads.forEach((pad) => {
    const context = pad.dataset.dragContext;
    if (!context) {
      return;
    }
    pad.classList.toggle("diagonal-on", state.config.settings.dragAllowDiagonal);
    pad.innerHTML = "";
    const directions = [
      { dir: "UL", area: "dir-ul", diagonal: true },
      { dir: "U", area: "dir-u" },
      { dir: "UR", area: "dir-ur", diagonal: true },
      { dir: "L", area: "dir-l" },
      { dir: "C", area: "dir-center", center: true },
      { dir: "R", area: "dir-r" },
      { dir: "DL", area: "dir-dl", diagonal: true },
      { dir: "D", area: "dir-d" },
      { dir: "DR", area: "dir-dr", diagonal: true }
    ];

    directions.forEach((item) => {
      if (item.center) {
        const center = document.createElement("div");
        center.className = `dir-center ${item.area}`;
        center.textContent = getText("ui.section.drag.center", state.language, {
          context: contextLabel(context)
        });
        pad.appendChild(center);
        return;
      }

      const cell = document.createElement("div");
      cell.className = `dir-cell ${item.area} ${item.diagonal ? "dir-diagonal" : ""}`;
      const label = document.createElement("div");
      label.className = "dir-label";
      label.textContent = item.dir;
      const select = document.createElement("select");
      select.dataset.dir = item.dir;
      select.dataset.context = context;
      buildActionSelect(select, DRAG_ACTION_IDS[context] || []);
      const current = (state.config.dragGestures[context] || {})[item.dir] || "";
      select.value = current;
      cell.appendChild(label);
      cell.appendChild(select);
      pad.appendChild(cell);
    });
  });
}

function contextLabel(context) {
  switch (context) {
    case "link":
      return getText("context.link", state.language);
    case "text":
      return getText("context.text", state.language);
    case "image":
      return getText("context.image", state.language);
    default:
      return getText("context.target", state.language);
  }
}

function renderVisualSettings() {
  elements.colorNormal.value = state.config.settings.trailColors.normal;
  elements.colorLink.value = state.config.settings.trailColors.link;
  elements.colorText.value = state.config.settings.trailColors.text;
  elements.lineWidth.value = state.config.settings.lineWidth;
  elements.trailOpacity.value = state.config.settings.trailOpacity;
  elements.minDistance.value = state.config.settings.minDistance;
  elements.angleTolerance.value = state.config.settings.angleTolerance;
  updateValue(elements.lineWidthValue, `${state.config.settings.lineWidth}px`);
  updateValue(elements.trailOpacityValue, state.config.settings.trailOpacity.toFixed(2));
  updateValue(elements.minDistanceValue, `${state.config.settings.minDistance}px`);
  updateValue(elements.angleToleranceValue, `${state.config.settings.angleTolerance}°`);
  refreshPreview();
}

function renderExclusions() {
  elements.exclusionList.replaceChildren();
  if (!state.config.exclusions || state.config.exclusions.length === 0) {
    elements.exclusionEmpty.style.display = "block";
    return;
  }
  elements.exclusionEmpty.style.display = "none";
  state.config.exclusions.forEach((entry) => {
    const item = document.createElement("li");
    item.className = "list-item";
    const label = document.createElement("span");
    label.textContent = entry;
    const remove = document.createElement("button");
    remove.className = "button ghost";
    remove.textContent = getText("ui.template.delete", state.language);
    remove.addEventListener("click", () => {
      state.config.exclusions = state.config.exclusions.filter((value) => value !== entry);
      scheduleSave(true);
      renderExclusions();
    });
    item.appendChild(label);
    item.appendChild(remove);
    elements.exclusionList.appendChild(item);
  });
}

function refreshPreview() {
  const ctx = elements.trailPreview.getContext("2d");
  ctx.clearRect(0, 0, elements.trailPreview.width, elements.trailPreview.height);
  const center = {
    x: elements.trailPreview.width / 4,
    y: elements.trailPreview.height / 2
  };
  drawPreviewLine(center, { x: center.x + 80, y: center.y - 30 });
}

function drawPreviewLine(from, to) {
  const ctx = elements.trailPreview.getContext("2d");
  ctx.lineWidth = state.config.settings.lineWidth;
  ctx.lineCap = "round";
  ctx.globalAlpha = state.config.settings.trailOpacity;
  ctx.strokeStyle = state.config.settings.trailColors.normal;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, to.y);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function buildActionSelect(select, allowedIds) {
  select.replaceChildren();
  const none = document.createElement("option");
  none.value = "";
  none.textContent = getText("ui.common.unassigned", state.language);
  select.appendChild(none);

  const grouped = ACTION_CATALOG.filter((action) => allowedIds.includes(action.id)).reduce((map, action) => {
    if (!map[action.group]) {
      map[action.group] = [];
    }
    map[action.group].push(action);
    return map;
  }, {});

  Object.keys(grouped).forEach((group) => {
    const optgroup = document.createElement("optgroup");
    optgroup.label = getActionGroupLabel(group, state.language);
    grouped[group].forEach((action) => {
      const option = document.createElement("option");
      option.value = action.id;
      option.textContent = getActionLabel(action.id, state.language);
      optgroup.appendChild(option);
    });
    select.appendChild(optgroup);
  });
}

function scheduleSave(force) {
  if (force) {
    saveConfig();
    return;
  }
  // スライダー操作などで連続更新されるので、保存はまとめてI/Oを減らす
  setStatusKey("ui.status.saving");
  if (state.saveTimer) {
    clearTimeout(state.saveTimer);
  }
  state.saveTimer = setTimeout(saveConfig, 300);
}

function saveConfig() {
  const payload = { [STORAGE_KEY]: state.config };
  chrome.storage.local.set(payload, () => {
    setStatusKey("ui.status.saved");
  });
}

function loadConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (data) => {
      resolve(data[STORAGE_KEY]);
    });
  });
}

function exportConfig() {
  const blob = new Blob([JSON.stringify(state.config, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "gesturemaster-settings.json";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function setStatusKey(key) {
  state.statusKey = key;
  elements.saveStatus.textContent = getText(key, state.language);
}

function updateValue(element, value) {
  element.textContent = value;
}

function resizeCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * ratio;
  canvas.height = rect.height * ratio;
  const ctx = canvas.getContext("2d");
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function getCanvasPoint(canvas, event) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
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
