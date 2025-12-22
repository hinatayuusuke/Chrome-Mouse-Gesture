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

let config = null;
let actionMap = { normal: {}, link: {}, text: {}, image: {} };
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
const moveScheduler = {
  ticking: false,
  pendingX: 0,
  pendingY: 0
};
