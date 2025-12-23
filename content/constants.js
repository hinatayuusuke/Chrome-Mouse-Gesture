const STORAGE_KEY = "gestureMasterConfig";

const DEFAULT_CONFIG = {
  settings: {
    language: getDefaultLanguage(),
    minDistance: 12,
    cancelRadius: 24,
    lineWidth: 4,
    trailOpacity: 0.85,
    angleTolerance: 35,
    dragAllowDiagonal: false,
    dragNativeMode: true,
    trailColors: {
      normal: "#ff3b30",
      link: "#1e90ff",
      text: "#2ecc71",
      image: "#f59e0b"
    },
    previewOffset: { x: 14, y: 16 }
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
    UL: { action: "moveTabLeft", label: "" }
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
  historyBack: { action: { type: "historyBack" } },
  historyForward: { action: { type: "historyForward" } },
  reload: { action: { type: "reload" } },
  scrollTop: { action: { type: "scrollTop" } },
  scrollBottom: { action: { type: "scrollBottom" } },
  closeTab: { action: { type: "closeTab" } },
  reopenTab: { action: { type: "reopenTab" } },
  newTab: { action: { type: "newTab" } },
  moveTabLeft: { action: { type: "moveTabLeft" } },
  moveTabRight: { action: { type: "moveTabRight" } },
  openLinkActive: { action: { type: "openLink", active: true } },
  openLinkBackground: { action: { type: "openLink", active: false } },
  openLinkIncognito: { action: { type: "openLinkIncognito" } },
  copyLinkUrl: { action: { type: "copyLinkUrl" } },
  copyLinkText: { action: { type: "copyLinkText" } },
  searchGoogle: { action: { type: "searchGoogle" } },
  copySelectionText: { action: { type: "copySelectionText" } },
  openImageActive: { action: { type: "openImage", active: true } },
  openImageBackground: { action: { type: "openImage", active: false } },
  openImageIncognito: { action: { type: "openImageIncognito" } },
  copyImageUrl: { action: { type: "copyImageUrl" } }
};
