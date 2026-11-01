// A desk USB microphone on its cast stand: the kit's own (components/kit/audio.ts) as a piece, made once and put in any scenery that
// imports it. Its parameters are the kit's options: `preset` by name (blackout or silver), then any option as the
// kit names it.
import { defineModel } from "@allyhub-next/model";
import {
  usbMic,
  USB_MIC_PRESETS,
  type UsbMicOptions,
} from "../../components/kit/audio.ts";
import { kitOptions } from "../../components/kit/piece.ts";

export default defineModel((bpy, params) => {
  usbMic(bpy, [0, 0, 0], kitOptions<UsbMicOptions>(params, USB_MIC_PRESETS));
});
