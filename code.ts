if (figma.editorType === "figma") {
  figma.showUI(__html__);
} else if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", async () => {
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();
    const colorsConfig = {
      theme: {
        extend: {
          colors: await getColors(),
        },
      },
    };
    const colorsConfigStr = JSON.stringify(colorsConfig, null, 2);
    const tailwindConfigStr = `export default ${colorsConfigStr}`;

    interface ColorMode {
      [key: string]: string;
    }

    interface Colors {
      [key: string]: ColorMode;
    }

    async function getColors(): Promise<Colors> {
      let colors: Colors = {};

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

    return [
      {
        language: "JAVASCRIPT",
        code: tailwindConfigStr,
        title: "tailwind.config.js",
      },
    ];
  });
}
