// const node = figma.currentPage.selection[0];

if (figma.editorType === "dev") {
  // Read the current page and listen to API events
  const numChildren = figma.currentPage.children.length;
  figma.notify(
    `This is running in Dev Mode.
    The current page has ${numChildren}`
  );
} else {
  figma.notify(
    `This is NOT running in Dev Mode.
    We can modify the file!`
  );
  const node = figma.createRectangle();
  node.name = "I proved that I can edit files!";
}
figma.closePlugin();
