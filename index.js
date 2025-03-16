/// <reference types="../CTAutocomplete" />
import PartyFinderGUI from "./Gui/PartyFinderGUI";
import { checkIfInSkyblock } from "./Utils/Functions";

let PartyFinder = new PartyFinderGUI()
register("command", () => {
    if (!checkIfInSkyblock()) return;
    PartyFinder.CtGui.open()
}).setName("sbopf")