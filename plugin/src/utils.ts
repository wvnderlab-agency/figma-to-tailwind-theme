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
  return toKebabCase(parts.join(" "));
}

export function rgbToString(color: RGB | RGBA) {
  const red = Math.round(color.r * 255)
    .toString()
  const green = Math.round(color.g * 255)
    .toString()
  const blue = Math.round(color.b * 255)
    .toString()
  const alpha = color.hasOwnProperty("a") ? (color as RGBA).a : 1;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export async function resolveValue(value: VariableValue): Promise<VariableValue> {
  if (!isVariableAlias(value)) return value;

  const aliasValue = value as VariableAlias;
  const nextVariable = await figma.variables.getVariableByIdAsync(aliasValue.id)
  if (nextVariable) {
    const modeId = Object.keys(nextVariable.valuesByMode)[0];
    return nextVariable.valuesByMode[modeId];

  } else {
    throw new Error(`Figma variable with id ${aliasValue.id} not found`);
  }
}

export function isVariableAlias(value: VariableValue) {
  return (typeof value === "object" && "type" in value && value.type === "VARIABLE_ALIAS");
}
