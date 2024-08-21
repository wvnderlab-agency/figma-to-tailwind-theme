export function toCamelCase(str: string) {
  return str.toLowerCase().replace(/[\s_-](.)/g, (_, group1) => {
    return group1.toUpperCase();
  });
}

export function toKebabCase(str: string) {
  return str.toLowerCase().replace(/[\s_-]+/g, "-");
}

export function toClassName(str: string) {
  let parts = str.split("/");

  // Remove DEFAULT suffix if it ends with it
  if (parts[parts.length - 1] === "DEFAULT") parts.pop();

  return toKebabCase(parts.join(" "));
}

export function rgbToString(color: RGB | RGBA) {
  let alpha = 1;

  const red = Math.round(color.r * 255).toString();
  const green = Math.round(color.g * 255).toString();
  const blue = Math.round(color.b * 255).toString();

  if (color.hasOwnProperty("a")) {
    let colorRGBA = color as RGBA;
    alpha =
      colorRGBA.a === 0 || colorRGBA.a === 1
        ? colorRGBA.a
        : Number(colorRGBA.a.toFixed(2));
  }

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export async function resolveValue(
  value: VariableValue,
): Promise<VariableValue> {
  let resolvedValue = value;

  while (isVariableAlias(resolvedValue)) {
    const aliasValue = resolvedValue as VariableAlias;
    const nextVariable = await figma.variables.getVariableByIdAsync(
      aliasValue.id,
    );

    if (nextVariable) {
      const modeId = Object.keys(nextVariable.valuesByMode)[0];
      resolvedValue = nextVariable.valuesByMode[modeId];
    } else {
      throw new Error(`Figma variable with id ${aliasValue.id} not found`);
    }
  }

  return resolvedValue;
}

export function isVariableAlias(value: VariableValue) {
  return (
    typeof value === "object" &&
    "type" in value &&
    value.type === "VARIABLE_ALIAS"
  );
}
