// A mouse (`kind` picks which): the kit's own (components/kit/desk-items.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import { mouse, type MouseOptions } from "../../components/kit/desk-items.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  mouse(bpy, [0, 0, 0], kitOptions<MouseOptions>(params));
});
