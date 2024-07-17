import { getColorsFromVars, getColorsFromStyles, Colors } from "./colors";
import { Fonts, getFontsFromStyles } from "./fonts";

interface TwConfig {
  theme: {
    extend: {
      colors?: Colors;
      fontFamily?: Fonts;
    };
  };
}

export async function getTwConfigStr() {
  const varColors = await getColorsFromVars();
  const styleColors = await getColorsFromStyles();
  const styleFonts = await getFontsFromStyles();

  const hasColors =
    Object.keys(varColors).length + Object.keys(styleColors).length > 0;
  const hasFonts = Object.keys(styleFonts).length > 0;

  const twConfig: TwConfig = {
    theme: {
      extend: {},
    },
  };

  if (hasColors) {
    twConfig.theme.extend.colors = { ...styleColors, ...varColors };
  }

  if (hasFonts) {
    twConfig.theme.extend.fontFamily = { ...styleFonts };
  }

  let result = "";
  try {
    result =
      hasColors || hasFonts
        ? `"theme":  ${JSON.stringify(twConfig.theme, null, 2)}`
        : "No colors or fonts on this page";
  } catch (err) {
    if (err instanceof Error) {
      result = err.message;
    }  

    if (typeof err === "string") {
      result = err;
    }
  }

  return result;
}
