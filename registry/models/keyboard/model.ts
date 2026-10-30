// A keyboard with its keycaps and legends: the kit's own (components/kit/keyboard.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import {
  keyboard,
  KEYBOARD_PRESETS,
  type KeyboardOptions,
} from "../../components/kit/keyboard.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  keyboard(
    bpy,
    [0, 0, 0],
    kitOptions<KeyboardOptions>(params, KEYBOARD_PRESETS),
  );
});
