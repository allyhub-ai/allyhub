// A laptop, its lid open: the kit's own (components/kit/laptop.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import {
  laptop,
  LAPTOP_PRESETS,
  type LaptopOptions,
} from "../../components/kit/laptop.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  laptop(bpy, [0, 0, 0], kitOptions<LaptopOptions>(params, LAPTOP_PRESETS));
});
