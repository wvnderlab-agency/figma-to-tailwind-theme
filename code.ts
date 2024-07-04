function main() {
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
}

main();

interface ColorModes {
  [key: string]: string;
}

interface Colors {
  [key: string]: string | ColorModes;
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

async function getColorsFromVars() {
  let colors: Colors = {};
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  for (const collection of collections) {
    const hasSingleMode = collection.modes.length === 1;

    if (hasSingleMode) {
      for (const varId of collection.variableIds) {
        let variable = await figma.variables.getVariableByIdAsync(varId);
        if (!variable || variable.resolvedType !== "COLOR") continue;

        let colorName = toClassName(variable.name);
        let colorValue = rgbToString(
          variable.valuesByMode[collection.defaultModeId] as RGB | RGBA
        );

        colors[colorName] = colorValue;
      }
    } else {
      for (const varId of collection.variableIds) {
        let variable = await figma.variables.getVariableByIdAsync(varId);
        if (!variable || variable.resolvedType !== "COLOR") continue;

        let colorName = toClassName(variable?.name || "unknown");

        for (const mode of collection.modes) {
          let colorValue = rgbToString(
            variable.valuesByMode[mode.modeId] as RGB | RGBA
          );
          let colorMode = toClassName(mode.name);
          colors[colorName] = {
            ...(colors[colorName] as ColorModes),
            [colorMode]: colorValue,
          };
        }

        let colorValue = rgbToString(
          variable.valuesByMode[collection.defaultModeId] as RGB | RGBA
        );
        colors[colorName] = {
          ...(colors[colorName] as ColorModes),
          DEFAULT: colorValue,
        };
      }
    }
  }

  return colors;
}

async function getColorsFromStyles() {
  const colors: Colors = {};
  const paintStyles = await figma.getLocalPaintStylesAsync();

  for (let style of paintStyles) {
    if (style.paints.length !== 1 || style.paints[0]?.type !== "SOLID")
      continue;

    let colorName = toClassName(style.name);
    let colorValue = rgbToString((style.paints[0] as SolidPaint).color);
    colors[colorName] = colorValue;
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

function toClassName(str: string) {
  return toCamelCase(removeGroupPrefix(str));
}

function removeGroupPrefix(str: string) {
  let nameParts = str.split("/");
  return nameParts[nameParts.length - 1];
}
