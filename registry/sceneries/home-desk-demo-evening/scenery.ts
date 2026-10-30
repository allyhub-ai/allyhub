// The home desk, its desk and wall alone (a demo filmed close), in the evening.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { homeDesk } from "../../components/settings/home-desk/scenery.ts";

export default defineScenery(homeDesk("evening", "demo"));
