// The home desk at night: the screen the key light, a violet wash behind the monitor and warm
// lamps, as most of the home-desk demo videos are lit.
import { defineScenery } from "@allyhub-next/scenery-host/layer";
import { homeDesk } from "../../components/settings/home-desk/scenery.ts";

export default defineScenery(homeDesk("night"));
