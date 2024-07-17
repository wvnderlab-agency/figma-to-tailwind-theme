import { PLUGIN_NAME } from "./settings";
import { toClassName, rgbToString } from "./utils";

interface ColorModes {
  [key: string]: string;
}

export interface Colors {
  [key: string]: string | ColorModes;
}

export async function getColorsFromVars() {
  const colors: Colors = {};

  try {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();

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
  } catch (err) {
    console.error(`Fetching color variables failed from ${PLUGIN_NAME}`, err);
  }

  return colors;
}

export async function getColorsFromStyles() {
  const colors: Colors = {};

  try {
    const paintStyles = await figma.getLocalPaintStylesAsync();

    for (let style of paintStyles) {
      if (style.paints.length !== 1 || style.paints[0]?.type !== "SOLID")
        continue;

      let colorName = toClassName(style.name);
      let colorValue = rgbToString((style.paints[0] as SolidPaint).color);
      colors[colorName] = colorValue;
    }
  } catch (err) {
    console.error(`Fetching color styles failed from ${PLUGIN_NAME}:`, err);
  }

  return colors;
}
