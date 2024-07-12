import { getTwConfigStr } from "./tw-config";

if (figma.editorType === "figma") {
  figma.showUI(__html__, { themeColors: true, width: 800, height: 600 });

  figma.ui.onmessage = async (message) => {
    if (message === "generate") {
      figma.ui.postMessage(await getTwConfigStr());
    }

    if (message === "notify") {
      figma.notify("Copied to clipboard");
    }
  };
} else if (figma.editorType === "dev" && figma.mode === "codegen") {
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
}
