if (figma.editorType === "figma") {
  figma.showUI(__html__, { themeColors: true, width: 800, height: 600 });

  figma.ui.onmessage = async (message) => {
    if (message === "generate") {
      figma.ui.postMessage(await getTwConfigStr());
      console.log("style colors", await getColorsFromStyles());
    }

    if (message === "notify") {
      figma.notify("Copied to clipboard");
    }
  };
} else if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", async () => {
    return [
      {
        language: "JAVASCRIPT",
        code: await getTwConfigStr(),
        title: "tailwind.config.js",
      },
    ];
  });
}

interface ColorMode {
  [key: string]: string;
}

interface Colors {
  [key: string]: ColorMode;
}

async function getTwConfigStr() {
  const varColors = await getColorsFromVars();
  const styleColors = await getColorsFromStyles();

  const hasColors =
    Object.keys(varColors).length + Object.keys(styleColors).length > 0;

  const themeConfig = {
    theme: {
      extend: {
        colors: { ...styleColors, ...varColors },
      },
    },
  };

  return hasColors
    ? `export default ${JSON.stringify(themeConfig, null, 2)}`
    : "";
}

async function getColorsFromVars(): Promise<Colors> {
  let colors: Colors = {};
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  for (const collection of collections) {
    for (const varId of collection.variableIds) {
      let variable = await figma.variables.getVariableByIdAsync(varId);
      let colorName = toCamelCase(variable?.name || "unknown");
      colors[colorName] = {};

      if (!variable || variable.resolvedType !== "COLOR") continue;

      for (const mode of collection.modes) {
        let colorValue = rgbToString(
          variable.valuesByMode[mode.modeId] as RGB | RGBA
        );
        let colorMode = toCamelCase(mode.name);
        colors[colorName] = {
          ...colors[colorName],
          [colorMode]: colorValue,
        };
      }

      let colorValue = rgbToString(
        variable.valuesByMode[collection.defaultModeId] as RGB | RGBA
      );
      colors[colorName] = { ...colors[colorName], DEFAULT: colorValue };
    }
  }

  return colors;
}

async function getColorsFromStyles() {
  const colors: Colors = {};
  const paintStyles = await figma.getLocalPaintStylesAsync();

  for (let style of paintStyles) {
    if (style.paints.length !== 1 && style.paints[0].type !== "SOLID") continue;

    let colorName = toCamelCase(style.name);
    let colorValue = rgbToString((style.paints[0] as SolidPaint).color);
    colors[colorName] = { DEFAULT: colorValue };
  }

  return colors;
}

function rgbToString(color: RGB | RGBA) {
  const red = Math.round(color.r * 255)
    .toString()
    .padStart(2, "0");
  const green = Math.round(color.g * 255)
    .toString()
    .padStart(2, "0");
  const blue = Math.round(color.b * 255)
    .toString()
    .padStart(2, "0");
  const alpha = color.hasOwnProperty("a") ? (color as RGBA).a : 1;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[\s_-](.)/g, (_, group1) => {
    return group1.toUpperCase();
  });
}
