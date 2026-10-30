// The bedroom desk, its desk and wall alone (a demo filmed close), by day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { bedroomDesk } from "../../components/settings/bedroom-desk/scenery.ts";

export default defineScenery(bedroomDesk("day", "demo", "release"));
