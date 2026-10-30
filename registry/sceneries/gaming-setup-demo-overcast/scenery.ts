// The gaming setup, its desk and wall alone (a demo filmed close), on an overcast day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { gamingSetup } from "../../components/settings/gaming-setup/scenery.ts";

export default defineScenery(gamingSetup("overcast", "demo", "preview"));
