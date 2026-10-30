// The bedroom desk, its desk and wall alone (a demo filmed close), on an overcast day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { bedroomDesk } from "../../components/settings/bedroom-desk/scenery.ts";

export default defineScenery(bedroomDesk("overcast", "demo", "preview"));
