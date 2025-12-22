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

function getDocumentBottom() {
  return Math.max(
    document.body.scrollHeight,
    document.documentElement.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.offsetHeight
  );
}

function distanceBetween(x1, y1, x2, y2) {
  return Math.hypot(x2 - x1, y2 - y1);
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
