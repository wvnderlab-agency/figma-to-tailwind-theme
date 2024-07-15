import { toKebabCase } from "./utils";

interface Fonts {
  [key: string]: string | string[];
}

export async function getFontsFromStyles() {
  const fonts: Fonts = {};

  try {
    const fontStyles = await figma.getLocalTextStylesAsync();
    fontStyles.forEach((style) => {
      const fontName = toKebabCase(style.fontName.family);
      fonts[fontName] = style.fontName.family; 
    })
    console.log(fonts);
  } catch (err) {
    console.error("Fetching fonts from figma failed", err);
  }

  return fonts;
}
