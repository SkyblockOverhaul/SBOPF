import PogObject from "../../PogData";
import FU from "../../FileUtilities/main";

let configFolderPath = "./config/sbopf"
if (!FU.exists(configFolderPath)) {
    FU.newDirectory(configFolderPath);
}

export let configState = new PogObject("../../../config/sbopf", {
    checkboxes: {},
    inputs: {},
    filters: {}
}, "configState.json")

function applyDefaults() {
    let defaults = {
        checkboxes: {
            custom: {
                "eman9": false
            },
            diana: {
                "eman9": false,
                "looting5": false,
            }
        },
        inputs: {
            custom: {
                "lvl": 0,
                "mp": 0,
                "partySize": 0,
                "note": "..."
            },
            diana: {
                "kills": 0,
                "lvl": 0,
                "note": "...",
            }
        },
        filters: {
            custom: {
                "eman9Filter": false,
                "noteFilter": "."
            },
            diana: {
                "eman9Filter": false,
                "looting5Filter": false,
                "canIjoinFilter": false,
            }
        }
    };

    for (let category in defaults) {
        for (let list in defaults[category]) {
            for (let key in defaults[category][list]) {
                if (!configState[category][list]) configState[category][list] = {};
                if (configState[category][list][key] === undefined) {
                    configState[category][list][key] = defaults[category][list][key];
                }
            }
        }
    }
}

applyDefaults();

configState.update = function (category, list, key, value) {
    if (!this[category]) this[category] = {};
    if (!this[category][list]) this[category][list] = {};

    if (this[category][list][key] !== value) {
        this[category][list][key] = value;
        this.save();
    }
};

configState.save();

export let data = new PogObject("../../../config/sbopf", {
    playerStats: undefined,
    playerStatsUpdated: 0,
}, "data.json");

data.save();
