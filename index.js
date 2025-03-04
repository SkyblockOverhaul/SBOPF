/// <reference types="../CTAutocomplete" />
import PartyFinderGUI from "./Gui/PartyFinderGUI";
import { checkIfInSkyblock } from "./utils/functions";
import "./Main/Data";

let PartyFinder = new PartyFinderGUI()
register("command", () => {
    if (!checkIfInSkyblock()) return;
    PartyFinder.CtGui.open()
}).setName("pftest").setAliases("pf")