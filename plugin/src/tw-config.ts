import { getColorsFromVars, getColorsFromStyles } from "./colors";

export async function getTwConfigStr() {
  const varColors = await getColorsFromVars();
  const styleColors = await getColorsFromStyles();

  const hasColors =
    Object.keys(varColors).length + Object.keys(styleColors).length > 0;

  const twConfig = {
    theme: {
      extend: {
        colors: { ...styleColors, ...varColors },
      },
    },
  };

  return hasColors
    ? `"theme":  ${JSON.stringify(twConfig.theme, null, 2)}`
    : "";
}
