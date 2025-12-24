const SUPPORTED_LANGUAGES = ["ja", "en"];

const I18N = {
  ja: {
    ui: {
      pageTitle: "GestureMaster 設定",
      brandTitle: "GestureMaster",
      brandSub: "カスタマイズパネル",
      language: {
        label: "言語",
        ja: "日本語",
        en: "English"
      },
      nav: {
        normal: "ノーマルジェスチャー",
        drag: "スーパードラッグ",
        visual: "外観・感度",
        exclusions: "除外リスト",
        transfer: "インポート/エクスポート"
      },
      status: {
        loading: "保存状況 読み込み中...",
        loaded: "保存状況 読み込み完了",
        saving: "保存状況 変更中...",
        saved: "保存状況 保存しました"
      },
      section: {
        normal: {
          title: "ノーマルジェスチャー",
          description: "右クリックの軌跡で実行する操作を登録します。",
          add: "新規ジェスチャーを追加",
          empty: "まだジェスチャーがありません。右上のボタンから登録できます。",
          fab: "ジェスチャーを追加"
        },
        drag: {
          title: "スーパードラッグ",
          description: "リンクやテキストを掴んで投げる方向で動作を切り替えます。",
          diagonal: "斜め方向も有効にする",
          native: "ネイティブドラッグ方式に切り替える（ページ外ドロップはChrome標準）",
          center: "{context}をドラッグ",
          tab: {
            link: "リンク",
            text: "テキスト",
            image: "画像"
          }
        },
        visual: {
          title: "外観・感度",
          description: "ジェスチャーの線と判定感度を調整します。",
          trailTitle: "トレイル設定",
          sensitivityTitle: "感度設定",
          normal: "ノーマル",
          link: "リンク",
          text: "テキスト",
          width: "太さ",
          opacity: "透明度",
          minDistance: "最小認識距離",
          angle: "判定許容角度",
          preview: "リアルタイムプレビュー"
        },
        exclusions: {
          title: "除外リスト",
          description: "指定したサイトではジェスチャーが無効になります。",
          placeholder: "example.com または https://example.com/*",
          add: "追加",
          hint: "ワイルドカード* が使えます。",
          empty: "除外サイトはまだありません。"
        },
        transfer: {
          title: "インポート/エクスポート",
          description: "設定をバックアップしたり共有できます。",
          exportTitle: "エクスポート",
          exportDescription: "現在の設定をJSONとして保存します。",
          exportButton: "エクスポート",
          importTitle: "インポート",
          importDescription: "JSONファイルを読み込みます。",
          chooseFile: "ファイルを選択",
          reset: "初期設定に戻す"
        }
      },
      modal: {
        titleAdd: "ジェスチャーを追加",
        titleEdit: "ジェスチャーを編集",
        close: "閉じる",
        drawArea: "描画エリア",
        pathEmpty: "未入力",
        recording: "記録中...",
        clear: "クリア",
        action: "アクション",
        label: "ラベル（任意）",
        labelPlaceholder: "画面に表示する名称",
        cancel: "キャンセル",
        save: "保存"
      },
      template: {
        edit: "編集",
        delete: "削除"
      },
      common: {
        unassigned: "未設定"
      }
    },
    messages: {
      error: {
        noPath: "軌跡を描いてください。",
        noAction: "アクションを選択してください。",
        duplicate: "同じ軌跡が既に登録されています。"
      },
      confirm: {
        reset: "設定を初期状態に戻しますか？",
        deleteGesture: "このジェスチャーを削除しますか？"
      },
      alert: {
        importFailed: "JSONの読み込みに失敗しました。"
      }
    },
    preview: {
      cancel: "キャンセル"
    },
    context: {
      link: "リンク",
      text: "テキスト",
      image: "画像",
      target: "対象"
    },
    actions: {
      historyBack: "戻る",
      historyForward: "進む",
      reload: "更新",
      scrollTop: "トップへ",
      scrollBottom: "ボトムへ",
      closeTab: "タブを閉じる",
      reopenTab: "閉じたタブを開く",
      newTab: "新しいタブ",
      moveTabLeft: "タブを左へ",
      moveTabRight: "タブを右へ",
      openLinkActive: "リンクを新しいタブで開く（前面）",
      openLinkBackground: "リンクを新しいタブで開く（背面）",
      openLinkIncognito: "リンクをシークレットウィンドウで開く",
      copyLinkUrl: "リンクURLをコピー",
      copyLinkText: "リンクテキストをコピー",
      searchGoogle: "選択テキストをGoogle検索",
      copySelectionText: "選択テキストをコピー",
      openImageActive: "画像を新しいタブで開く（前面）",
      openImageBackground: "画像を新しいタブで開く（背面）",
      openImageIncognito: "画像をシークレットウィンドウで開く",
      copyImageUrl: "画像URLをコピー"
    },
    actionGroups: {
      navigation: "ナビゲーション",
      tab: "タブ操作",
      other: "その他",
      link: "リンク操作",
      text: "テキスト操作",
      image: "画像操作"
    }
  },
  en: {
    ui: {
      pageTitle: "GestureMaster Settings",
      brandTitle: "GestureMaster",
      brandSub: "Customization Panel",
      language: {
        label: "Language",
        ja: "Japanese",
        en: "English"
      },
      nav: {
        normal: "Normal Gestures",
        drag: "Super Drag",
        visual: "Appearance & Sensitivity",
        exclusions: "Exclusions",
        transfer: "Import/Export"
      },
      status: {
        loading: "Status: Loading...",
        loaded: "Status: Loaded",
        saving: "Status: Changes pending...",
        saved: "Status: Saved"
      },
      section: {
        normal: {
          title: "Normal Gestures",
          description: "Register actions triggered by right-click gesture paths.",
          add: "Add Gesture",
          empty: "No gestures yet. Use the button above to add one.",
          fab: "Add gesture"
        },
        drag: {
          title: "Super Drag",
          description: "Pick actions by dragging links or text in a direction.",
          diagonal: "Enable diagonal directions",
          native: "Use native drag mode (drops outside the page follow Chrome defaults)",
          center: "Drag {context}",
          tab: {
            link: "Link",
            text: "Text",
            image: "Image"
          }
        },
        visual: {
          title: "Appearance & Sensitivity",
          description: "Adjust gesture trails and recognition sensitivity.",
          trailTitle: "Trail Settings",
          sensitivityTitle: "Sensitivity Settings",
          normal: "Normal",
          link: "Link",
          text: "Text",
          width: "Width",
          opacity: "Opacity",
          minDistance: "Minimum distance",
          angle: "Angle tolerance",
          preview: "Live preview"
        },
        exclusions: {
          title: "Exclusions",
          description: "Gestures are disabled on the sites you list.",
          placeholder: "example.com or https://example.com/*",
          add: "Add",
          hint: "Wildcard * is supported.",
          empty: "No excluded sites yet."
        },
        transfer: {
          title: "Import/Export",
          description: "Back up and share your settings.",
          exportTitle: "Export",
          exportDescription: "Save your current settings as JSON.",
          exportButton: "Export",
          importTitle: "Import",
          importDescription: "Import settings from a JSON file.",
          chooseFile: "Choose file",
          reset: "Reset to defaults"
        }
      },
      modal: {
        titleAdd: "Add Gesture",
        titleEdit: "Edit Gesture",
        close: "Close",
        drawArea: "Drawing area",
        pathEmpty: "Not set",
        recording: "Recording...",
        clear: "Clear",
        action: "Action",
        label: "Label (optional)",
        labelPlaceholder: "Name shown on screen",
        cancel: "Cancel",
        save: "Save"
      },
      template: {
        edit: "Edit",
        delete: "Delete"
      },
      common: {
        unassigned: "Unassigned"
      }
    },
    messages: {
      error: {
        noPath: "Please draw a gesture path.",
        noAction: "Please select an action.",
        duplicate: "That gesture path is already registered."
      },
      confirm: {
        reset: "Reset settings to defaults?",
        deleteGesture: "Delete this gesture?"
      },
      alert: {
        importFailed: "Failed to read JSON."
      }
    },
    preview: {
      cancel: "Cancel"
    },
    context: {
      link: "Link",
      text: "Text",
      image: "Image",
      target: "Target"
    },
    actions: {
      historyBack: "Back",
      historyForward: "Forward",
      reload: "Reload",
      scrollTop: "Scroll to Top",
      scrollBottom: "Scroll to Bottom",
      closeTab: "Close Tab",
      reopenTab: "Reopen Closed Tab",
      newTab: "New Tab",
      moveTabLeft: "Move Tab Left",
      moveTabRight: "Move Tab Right",
      openLinkActive: "Open Link in New Tab (Foreground)",
      openLinkBackground: "Open Link in New Tab (Background)",
      openLinkIncognito: "Open Link in Incognito Window",
      copyLinkUrl: "Copy Link URL",
      copyLinkText: "Copy Link Text",
      searchGoogle: "Search Selection with Google",
      copySelectionText: "Copy Selected Text",
      openImageActive: "Open Image in New Tab (Foreground)",
      openImageBackground: "Open Image in New Tab (Background)",
      openImageIncognito: "Open Image in Incognito Window",
      copyImageUrl: "Copy Image URL"
    },
    actionGroups: {
      navigation: "Navigation",
      tab: "Tab",
      other: "Other",
      link: "Link",
      text: "Text",
      image: "Image"
    }
  }
};

function normalizeLanguage(language) {
  if (!language) {
    return "";
  }
  const lower = String(language).toLowerCase();
  if (lower.startsWith("ja")) {
    return "ja";
  }
  if (lower.startsWith("en")) {
    return "en";
  }
  if (SUPPORTED_LANGUAGES.includes(lower)) {
    return lower;
  }
  return "";
}

function getDefaultLanguage() {
  const candidates = Array.isArray(navigator.languages) && navigator.languages.length
    ? navigator.languages
    : [navigator.language];
  for (const candidate of candidates) {
    const normalized = normalizeLanguage(candidate);
    if (normalized) {
      return normalized;
    }
  }
  return "en";
}

function getText(key, language, params) {
  const lang = normalizeLanguage(language) || "en";
  const value = getI18nValue(I18N[lang], key) ?? getI18nValue(I18N.en, key);
  if (typeof value !== "string") {
    return "";
  }
  return applyParams(value, params);
}

function getActionLabel(actionId, language) {
  const label = getText(`actions.${actionId}`, language);
  return label || actionId;
}

function getActionGroupLabel(groupId, language) {
  const label = getText(`actionGroups.${groupId}`, language);
  return label || groupId;
}

function getI18nValue(source, key) {
  if (!source || !key) {
    return undefined;
  }
  return key.split(".").reduce((value, part) => (value ? value[part] : undefined), source);
}

function applyParams(text, params) {
  if (!params) {
    return text;
  }
  return Object.keys(params).reduce((value, key) => value.replaceAll(`{${key}}`, params[key]), text);
}
