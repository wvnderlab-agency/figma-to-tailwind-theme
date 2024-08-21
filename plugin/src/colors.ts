import { PLUGIN_NAME } from "./settings";
import { toClassName, rgbToString, resolveValue } from "./utils";

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
      const isSingleMode = collection.modes.length === 1;
      for (const varId of collection.variableIds) {
        let variable = await figma.variables.getVariableByIdAsync(varId);
        if (!variable || variable.resolvedType !== "COLOR") continue;

        if (isSingleMode) {
          await handleSingleModeVar(variable, collection, colors);
        } else {
          await handleMultiModeVar(variable, collection, colors);
        }
      }
    }
  } catch (err) {
    console.error(`Fetching color variables failed from ${PLUGIN_NAME}`, err);
  }

  return colors;
}

async function handleSingleModeVar(
  variable: Variable,
  collection: VariableCollection,
  colors: Colors,
) {
  let colorName = toClassName(variable.name);
  try {
    let colorValue = rgbToString(
      (await resolveValue(variable.valuesByMode[collection.defaultModeId])) as
        | RGB
        | RGBA,
    );
    colors[colorName] = colorValue;
  } catch (err) {
    console.error(err);
  }
}

async function handleMultiModeVar(
  variable: Variable,
  collection: VariableCollection,
  colors: Colors,
) {
  let colorName = toClassName(variable?.name || "unknown");
  for (const mode of collection.modes) {
    try {
      let colorValue = rgbToString(
        (await resolveValue(variable.valuesByMode[mode.modeId])) as RGB | RGBA,
      );
      let colorMode = toClassName(mode.name);

      colors[colorName] = {
        ...(colors[colorName] as ColorModes),
        [colorMode]: colorValue,
      };
    } catch (err) {
      console.error(err);
    }
  }

  try {
    let colorValue = rgbToString(
      (await resolveValue(variable.valuesByMode[collection.defaultModeId])) as
        | RGB
        | RGBA,
    );

    colors[colorName] = {
      ...(colors[colorName] as ColorModes),
      DEFAULT: colorValue,
    };
  } catch (err) {
    console.error(err);
  }
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
