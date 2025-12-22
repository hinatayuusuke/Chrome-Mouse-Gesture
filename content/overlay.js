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

    // 高DPI 環境も線の太さと座標を一致させたい
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

const overlay = createGestureOverlay();
