// A desktop monitor on its stand: the kit's own (components/kit/monitor.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name where the product has presets, then any
// option (a size, a finish) as the kit names it.
import { defineModel } from "@allyhub-next/model";
import {
  monitor,
  MONITOR_PRESETS,
  type MonitorOptions,
} from "../../components/kit/monitor.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  monitor(bpy, [0, 0, 0], kitOptions<MonitorOptions>(params, MONITOR_PRESETS));
});
