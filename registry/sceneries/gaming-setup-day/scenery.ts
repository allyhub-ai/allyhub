// The gaming setup, the whole room (a talking head, a desk tour), by day.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { gamingSetup } from "../../components/settings/gaming-setup/scenery.ts";

export default defineScenery(gamingSetup("day", "room", "preview"));
