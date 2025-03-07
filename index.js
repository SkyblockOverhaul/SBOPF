/// <reference types="../CTAutocomplete" />
import PartyFinderGUI from "./Gui/PartyFinderGUI";
import { checkIfInSkyblock } from "./utils/functions";
import settings from "./settings";

let PartyFinder = new PartyFinderGUI()
register("command", () => {
    if (!checkIfInSkyblock()) return;
    PartyFinder.CtGui.open()
}).setName("pftest").setAliases("pf")