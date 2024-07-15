import { getColorsFromVars, getColorsFromStyles } from "./colors";
import { getFontsFromStyles } from "./fonts";

export async function getTwConfigStr() {
  const varColors = await getColorsFromVars();
  const styleColors = await getColorsFromStyles();
  const styleFonts = await getFontsFromStyles();

  const hasColors =
    Object.keys(varColors).length + Object.keys(styleColors).length > 0;

  const twConfig = {
    theme: {
      extend: {
        colors: { ...styleColors, ...varColors },
        fontFamily: { ...styleFonts },
      },
    },
  };

  return hasColors
    ? `"theme":  ${JSON.stringify(twConfig.theme, null, 2)}`
    : "";
}
