// The minimal white desk, the whole room (a talking head, a desk tour), by day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { minimalWhite } from "../../components/settings/minimal-white/scenery.ts";

export default defineScenery(minimalWhite("day", "room", "preview"));
