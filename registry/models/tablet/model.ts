// A tablet, flat or on its stand: the kit's own (components/kit/tablet.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import {
  tablet,
  TABLET_PRESETS,
  type TabletOptions,
} from "../../components/kit/tablet.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  tablet(bpy, [0, 0, 0], kitOptions<TabletOptions>(params, TABLET_PRESETS));
});
