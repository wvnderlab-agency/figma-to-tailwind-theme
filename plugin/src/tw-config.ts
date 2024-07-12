import { rgbToString, toClassName } from "./utils";

interface ColorModes {
  [key: string]: string;
}

interface Colors {
  [key: string]: string | ColorModes;
}


export async function getTwConfigStr() {
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
    ? `"theme":  ${JSON.stringify(themeConfig.theme, null, 2)}`
    : "";
}

async function getColorsFromVars() {
  const colors: Colors = {};
  const collections = await figma.variables.getLocalVariableCollectionsAsync();

  for (const collection of collections) {
    const hasSingleMode = collection.modes.length === 1;

    if (hasSingleMode) {
      for (const varId of collection.variableIds) {
        let variable = await figma.variables.getVariableByIdAsync(varId);
        if (!variable || variable.resolvedType !== "COLOR") continue;

        let colorName = toClassName(variable.name);
        let colorValue = rgbToString(
          variable.valuesByMode[collection.defaultModeId] as RGB | RGBA,
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
            variable.valuesByMode[mode.modeId] as RGB | RGBA,
          );
          let colorMode = toClassName(mode.name);
          colors[colorName] = {
            ...(colors[colorName] as ColorModes),
            [colorMode]: colorValue,
          };
        }

        let colorValue = rgbToString(
          variable.valuesByMode[collection.defaultModeId] as RGB | RGBA,
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