// The bedroom desk, the whole room (a talking head, a desk tour), by day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { bedroomDesk } from "../../components/settings/bedroom-desk/scenery.ts";

export default defineScenery(bedroomDesk("day", "room", "preview"));
