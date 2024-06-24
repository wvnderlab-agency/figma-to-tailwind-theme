if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", async () => {
    const selection = figma.currentPage.selection;

    if (!selection) return [];

    // Extract name,value for each variable
    const colors = [];
    const collections =
      await figma.variables.getLocalVariableCollectionsAsync();

    collections.forEach((collection) => {
      collection.variableIds.forEach(async (varId) => {
        let variable = await figma.variables.getVariableByIdAsync(varId);

        if (!variable || variable.resolvedType !== "COLOR") return;

        collection.modes.forEach((mode) => {
          console.log(
            toCamelCase(variable.name),
            toCamelCase(mode.name),
            toCamelCase(
              rgbToString(variable.valuesByMode[mode.modeId] as RGB | RGBA)
            )
          );
        });
        console.log(
          toCamelCase(variable.name),
          "DEFAULT",
          toCamelCase(
            rgbToString(
              variable.valuesByMode[collection.defaultModeId] as RGB | RGBA
            )
          )
        );
      });
    });

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
        language: "PLAINTEXT",
        code: ``,
        title: "COLOR variables",
      },
    ];
  });
}
