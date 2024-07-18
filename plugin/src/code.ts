import { getTwConfigStr } from "./tw-config";

if (figma.editorType === "figma") {
  setupUI();
} else if (figma.editorType === "dev") {
  if (figma.mode === "codegen") {
    figma.codegen.on("generate", async () => {
      const code = await getTwConfigStr();

      return [
        {
          language: "JAVASCRIPT",
          code,
          title: "tailwind.config.js",
        },
      ];
    });
  } else if (figma.mode === "inspect") {
    setupUI();
  }
}

function setupUI() {
  figma.showUI(__html__, { themeColors: true, width: 800, height: 600 });

  figma.ui.onmessage = async (message) => {
    if (message === "generate") {
      figma.ui.postMessage(await getTwConfigStr());
    }

    if (message === "notify") {
      figma.notify("Copied to clipboard");
    }
  };
}
