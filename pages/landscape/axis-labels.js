(() => {
  if (window.__wbgLandscapeAxisLabels) return;
  window.__wbgLandscapeAxisLabels = true;

  const axisTitles = new Set(["Band Gap (eV)", "Defect Formation Energy (eV)"]);
  const canvasProto = window.CanvasRenderingContext2D && CanvasRenderingContext2D.prototype;
  if (canvasProto) {
    const originalFillText = canvasProto.fillText;
    canvasProto.fillText = function (text, ...args) {
      if (axisTitles.has(String(text))) return;
      return originalFillText.call(this, text, ...args);
    };
  }

  const install = () => {
    const canvas = document.querySelector("#app canvas");
    const pane = canvas && canvas.parentElement;
    if (!pane || pane.querySelector(".wbg-landscape-axis")) return !!pane;

    const common = [
      "position:absolute", "z-index:4", "pointer-events:none", "color:#111827",
      "background:#fff", "font:400 20px/1 'Arial Narrow','Arial Narrow Web',Arial,sans-serif",
      "white-space:nowrap"
    ].join(";");
    const x = document.createElement("div");
    x.className = "wbg-landscape-axis wbg-landscape-axis-x";
    x.textContent = "Band Gap (eV)";
    x.style.cssText = common + ";left:calc(50% + 10px);bottom:0;transform:translateX(-50%);padding:1px 7px";

    const y = document.createElement("div");
    y.className = "wbg-landscape-axis wbg-landscape-axis-y";
    y.textContent = "Defect Formation Energy (eV)";
    y.style.cssText = common + ";left:17px;top:calc(50% - 8px);writing-mode:vertical-rl;transform:translateY(-50%) rotate(180deg);padding:7px 1px";

    pane.append(x, y);
    return true;
  };

  if (!install()) {
    const observer = new MutationObserver(() => {
      if (install()) observer.disconnect();
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
