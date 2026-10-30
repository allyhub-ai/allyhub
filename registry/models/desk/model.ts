// A sit-stand desk: the kit's own (components/kit/desk.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import { desk, type DeskOptions } from "../../components/kit/desk.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  desk(bpy, [0, 0, 0], kitOptions<DeskOptions>(params));
});
