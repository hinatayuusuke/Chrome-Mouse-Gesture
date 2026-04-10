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
  const language = normalizeLanguage(config.settings && config.settings.language) || getDefaultLanguage();
  config.settings.language = language;
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
  return {
    settings: mergeDeep(deepClone(defaults.settings), stored.settings || {}),
    // WHY: Gesture maps need replace semantics so deleted default entries do not reappear after reload.
    gestures: stored.gestures && typeof stored.gestures === "object"
      ? deepClone(stored.gestures)
      : deepClone(defaults.gestures),
    dragGestures: stored.dragGestures && typeof stored.dragGestures === "object"
      ? deepClone(stored.dragGestures)
      : deepClone(defaults.dragGestures),
    exclusions: Array.isArray(stored.exclusions)
      ? stored.exclusions.slice()
      : deepClone(defaults.exclusions)
  };
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
