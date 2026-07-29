(() => {
  if (window.__wbgStructGridFitInstalled) return;
  window.__wbgStructGridFitInstalled = true;

  let delayedFit = 0;
  const resetEachView = () => {
    document.querySelectorAll(".viewport-cell.multi").forEach(pane => {
      pane.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
    });
  };
  const fitAfterLayout = () => {
    requestAnimationFrame(() => requestAnimationFrame(resetEachView));
    clearTimeout(delayedFit);
    delayedFit = window.setTimeout(resetEachView, 240);
  };

  window.addEventListener("message", event => {
    const message = event.data || {};
    if (message.type === "struct" && typeof message.cif === "string" && message.cif) {
      fitAfterLayout();
    }
  });
  window.addEventListener("load", fitAfterLayout, { once: true });
})();
