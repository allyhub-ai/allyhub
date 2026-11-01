// The minimal walnut desk, its desk and wall alone (a demo filmed close), on an overcast day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { minimalWalnut } from "../../components/settings/minimal-walnut/scenery.ts";

export default defineScenery(minimalWalnut("overcast", "demo", "release"));
