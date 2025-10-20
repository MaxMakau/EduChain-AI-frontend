// src/hooks/useThemeColor.js
import { useEffect } from "react";

export default function useThemeColor(color) {
  useEffect(() => {
    let meta = document.querySelector("meta[name='theme-color']");
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      document.head.appendChild(meta);
    }

    // Apply color or gradient
    meta.content = color;
  }, [color]);
}
