(() => {
  const ADAPTER_VERSION = "whatsapp-web-dom-v1";
  const APP_URL = "https://aether-flow-production-0798.up.railway.app/capturar";
  const buttonId = "aether-flow-capture-button";

  function text(selectors) {
    for (const selector of selectors) {
      const node = document.querySelector(selector);
      const value = node?.getAttribute("title") || node?.textContent || "";
      if (value.trim()) return value.trim();
    }
    return "";
  }

  function capture() {
    const urlPhone = new URL(location.href).searchParams.get("phone") || "";
    const name = text(["header [title]", "header span[dir=auto]", "header h1"]).slice(0, 120);
    const phone = urlPhone || text(["header [data-testid=conversation-info-header]", "header"]).match(/[+]?\d[\d ()-]{7,}/)?.[0] || "";
    return { name: name || "Contato do WhatsApp", phone, adapter: ADAPTER_VERSION };
  }

  function install() {
    if (document.getElementById(buttonId)) return;
    const target = document.querySelector("header") || document.body;
    if (!target) return;
    const button = document.createElement("button");
    button.id = buttonId;
    button.type = "button";
    button.textContent = "Adicionar ao Aether";
    button.title = "Capturar contato e criar oportunidade no Aether Flow";
    Object.assign(button.style, {
      marginLeft: "8px", padding: "7px 10px", border: "0", borderRadius: "8px",
      background: "#1457d9", color: "#fff", font: "600 12px system-ui", cursor: "pointer",
      zIndex: "9999"
    });
    button.addEventListener("click", () => {
      const data = capture();
      if (!data.phone) {
        button.textContent = "Telefone não encontrado";
        setTimeout(() => { button.textContent = "Adicionar ao Aether"; }, 2200);
        return;
      }
      const query = new URLSearchParams({ ...data, capture: "1" });
      window.open(`${APP_URL}?${query.toString()}`, "_blank", "noopener");
    });
    target.appendChild(button);
  }

  new MutationObserver(install).observe(document.documentElement, { childList: true, subtree: true });
  install();
})();
