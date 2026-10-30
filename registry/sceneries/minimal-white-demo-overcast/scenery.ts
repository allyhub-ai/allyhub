// The minimal white desk, its desk and wall alone (a demo filmed close), on an overcast day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { minimalWhite } from "../../components/settings/minimal-white/scenery.ts";

export default defineScenery(minimalWhite("overcast", "demo", "preview"));
