applyConfig();
startConfigSync();

document.addEventListener("mousedown", onMouseDown, true);
document.addEventListener("mousemove", onMouseMove, true);
document.addEventListener("mouseup", onMouseUp, true);
document.addEventListener("contextmenu", onContextMenu, true);
document.addEventListener("dragstart", onDragStart, true);
document.addEventListener("dragover", onDragOver, true);
document.addEventListener("drop", onDrop, true);
document.addEventListener("dragend", onDragEnd, true);
document.addEventListener("click", onClick, true);
document.addEventListener("keydown", onKeyDown, true);
window.addEventListener("resize", onResize, true);
