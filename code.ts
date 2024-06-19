if (figma.editorType === "dev" && figma.mode === "codegen") {
  figma.codegen.on("generate", async () => {
    const node = figma.currentPage.selection[0];
    let css = {};
    if (node) {
      css = await node.getCSSAsync();
    } else {
      figma.notify("Select something");
    }

    let rules = [];
    for (const key of Object.keys(css) as Array<keyof typeof css>) {
      const value = css[key];
      rules.push(`${key}: ${value};`);
    }

    return [
      {
        language: "CSS",
        code: rules.join("\n"),
        title: "My custom CSS",
      },
    ];
  });
}
