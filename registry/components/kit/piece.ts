// A kit product shown as a piece of its own (models/<name>/model.ts): its options from the piece's
// parameters, a preset by name first (`preset`, one of the product's PRESETS), then any option given.
import type { ModelParameters } from "@allyhub-next/model";

export function kitOptions<O>(
  params: ModelParameters,
  presets: Readonly<Record<string, Partial<O>>> = {},
): Partial<O> {
  const { preset, ...given } = params;
  if (
    preset !== undefined &&
    (typeof preset !== "string" || !Object.hasOwn(presets, preset))
  )
    throw new Error(
      `preset is one of ${Object.keys(presets).join(", ") || "none: this product has no presets"}.`,
    );
  return {
    ...(typeof preset === "string" ? presets[preset] : {}),
    ...(given as Partial<O>),
  };
}
