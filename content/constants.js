const STORAGE_KEY = "gestureMasterConfig";

const DEFAULT_CONFIG = {
  settings: {
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
