// The minimal walnut desk, its desk and wall alone (a demo filmed close), at night.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { minimalWalnut } from "../../components/settings/minimal-walnut/scenery.ts";

export default defineScenery(minimalWalnut("night", "demo", "release"));
