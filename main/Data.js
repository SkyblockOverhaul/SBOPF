import PogObject from "../../PogData";
import FU from "../../FileUtilities/main";

let configFolderPath = "./config/sbopf"
if (!FU.exists(configFolderPath)) {
    FU.newDirectory(configFolderPath);
}

export let configState = new PogObject("../../../config/sbopf", {
    checkboxes: {
        diana: {
            "eman9": false,
            "looting5": false,
            "mvpplus": false,
        }
    },
    inputs: {
        diana: {
            "kills": 0,
            "lvl": 0,
            "note": "...",
        }
    },
    filters: {
        diana: {
            "eman9Filter": false,
            "looting5Filter": false,
            "canIjoinFilter": false,
        }
    },
}, "configState.json")
configState.save();

export let data = new PogObject("../../../config/sbopf", {
    playerStats: undefined,
    playerStatsUpdated: 0
}, "data.json");

data.save();

configState.update = function(category, list, key, value) {
    if (this[category] && this[category][list] && this[category][list][key] !== undefined) {
        if (this[category][list][key] === value) return;
        this[category][list][key] = value;
        this.save();
    }
}
