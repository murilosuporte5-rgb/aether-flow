import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Aether Flow · Capturar lead",
    short_name: "Aether Capture",
    description: "Envie um contato compartilhado do WhatsApp para o Aether Flow.",
    start_url: "/capturar",
    display: "standalone",
    background_color: "#f5f8fc",
    theme_color: "#123b68",
    icons: [{ src: "/brand/aether-mark.png", sizes: "256x256", type: "image/png" }],
    share_target: {
      action: "/capturar/share",
      method: "POST",
      enctype: "application/x-www-form-urlencoded",
      params: { title: "title", text: "text", url: "url" },
    },
  };
}
