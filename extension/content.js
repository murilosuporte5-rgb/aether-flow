(() => {
  const ADAPTER_VERSION = "whatsapp-web-dom-v2";
  const APP_URL = "https://aether-flow-production-0798.up.railway.app/capturar";
  const buttonId = "aether-flow-capture-button";
  const phonePattern = /(?:\+?\d[\d ()-]{7,}\d)/;

  function read(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node?.getAttribute("title") || node?.getAttribute("aria-label") || node?.textContent || "";
      if (value.trim()) return value.trim().replace(/\s+/g, " ");
    }
    return "";
  }

  function capture() {
    const url = new URL(location.href);
    const name = read([
      '[data-testid="conversation-info-header-chat-title"]',
      '[data-testid="conversation-header"] span[dir="auto"]',
      'header span[dir="auto"]',
      'header [title]'
    ]).replace(/\s*\(.*?\)\s*$/, "").slice(0, 120);
    const headerText = read(["header", '[data-testid="conversation-header"]']);
    const phone = (url.searchParams.get("phone") || headerText.match(phonePattern)?.[0] || "").replace(/[^\d+]/g, "").slice(0, 40);
    return { name: name || "Contato do WhatsApp", phone, adapter: ADAPTER_VERSION, source: "WhatsApp Web" };
  }

  function setButton(button, label, timeout = 2200) {
    button.textContent = label;
    window.setTimeout(() => { if (button.isConnected) button.textContent = "Capturar lead"; }, timeout);
  }

  function install() {
    if (document.getElementById(buttonId)) return;
    const target = document.querySelector('[data-testid="conversation-header"]') || document.querySelector("header");
    if (!target) return;
    const button = document.createElement("button");
    button.id = buttonId;
    button.type = "button";
    button.textContent = "Capturar lead";
    button.title = "Revisar nome e telefone e adicionar ao Aether Flow";
    button.setAttribute("aria-label", "Capturar lead no Aether Flow");
    Object.assign(button.style, {
      marginLeft: "8px", padding: "7px 10px", border: "0", borderRadius: "8px",
      background: "#1457d9", color: "#fff", font: "600 12px system-ui", cursor: "pointer",
      zIndex: "9999", whiteSpace: "nowrap"
    });
    button.addEventListener("click", () => {
      const data = capture();
      if (!data.phone) { setButton(button, "Telefone não encontrado"); return; }
      const payload = new URLSearchParams({ ...data, capture: "1" });
      // PII stays in the fragment and is never sent in the initial HTTP request.
      window.open(`${APP_URL}#${payload.toString()}`, "_blank", "noopener");
      setButton(button, "Lead enviado");
    });
    target.appendChild(button);
  }

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
  install();
})();
