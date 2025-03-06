import { request } from "../../requestV2";
import { data } from "../Main/Data";
import { delay } from "./threads";

let playerStats = undefined;
let loadingPlayerStats = false;
export function getPlayerStats(useCallback = false, callback = null, forceRefresh = false) {
    if (loadingPlayerStats) return;
    if (playerStats != undefined) {
        return playerStats;
    }
    else {
        loadingPlayerStats = true;
        if (data.playerStatsUpdated && Date.now() - data.playerStatsUpdated < 600000 && !forceRefresh) { // 10 minutes
            playerStats = data.playerStats;
            loadingPlayerStats = false;
            if (useCallback && callback) {
                callback(playerStats);
            }
            return;
        }
        request({
            url: "https://api.skyblockoverhaul.com/partyInfoByUuids?uuids=" + Player.getUUID().replaceAll("-", "") + "&readcache=false",
            json: true
        }).then((response) => {
            playerStats = response.PartyInfo[0];
            data.playerStats = playerStats;
            data.playerStatsUpdated = Date.now();
            data.save();	
            loadingPlayerStats = false;
            if (useCallback && callback) {
                callback(playerStats);
            } 
        }).catch((error) => {
            console.error("An error occurred while loding Diana Stats: " + error);
        });
    }
}
getPlayerStats();

let activeUsers = undefined
export function getActiveUsers(useCallback = false, callback = null) {
    request({
        url: "https://api.skyblockoverhaul.com/activeUsers",
        json: true
    }).then((response) => {
        activeUsers = response.activeUsers;

        if (activeUsers === undefined) {
            print("active users undefined");
            activeUsers = 0;
        }

        if (useCallback && callback) {
            callback(activeUsers);
        } else {
            ChatLib.chat("&6[SBO] &aActive user: &e" + activeUsers);
        }
    }).catch((error) => {
        console.error("An error occurred: " + error);
    });
}

export function getplayername(player) {
    let num
    let name
    num = player.indexOf(']')
    if (num == -1) {                // This part is only  ***When I wrote this, god and I knew how it worked, now only he knows.***
        num = player.indexOf('&7')  // for nons because
        if (num == -1) {            // it doesnt work
            num = -2                // without that
        }                           // #BanNons
    }
    name = player.substring(num+2).removeFormatting()
    name = name.replaceAll(/[^a-zA-Z0-9_]/g, '').replaceAll(' ', '').trim()
    return name
}

const Runnable = Java.type("java.lang.Runnable");
const Executors = Java.type("java.util.concurrent.Executors");
const TimeUnit = Java.type("java.util.concurrent.TimeUnit");
const scheduler = Executors.newSingleThreadScheduledExecutor();
export function setTimeout(callback, delay, ...args) {
    args = args || [];

    const timer = scheduler.schedule(
        new JavaAdapter(Runnable, {
            run: function() {
                callback(...args);
            }
        }),
        delay,
        TimeUnit.MILLISECONDS
    );
    return timer;
}

export function cancelTimeout(timer) {
    timer.cancel(true);
}

let registers = [];
let openVA = false;
/**
 * Adds a trigger with its associated dependency to the list of registered triggers.
 *
 * @param {Trigger} trigger - The trigger to be added.
 * @param {function} dependency - The function representing the dependency of the trigger.
 */
export function registerWhen(trigger, dependency) {
    registers.push([trigger.unregister(), dependency, false]);
}

export function setRegisters() {
    registers.forEach(trigger => {
        if ((!trigger[1]() && trigger[2]) || !Scoreboard.getTitle().removeFormatting().includes("SKYBLOCK")) {
            trigger[0].unregister();
            trigger[2] = false;
        } else if (trigger[1]() && !trigger[2]) {
            trigger[0].register();
            trigger[2] = true;
        }
    });
}
delay(() => setRegisters(), 1000);

export function opened() {
    openVA = true;
}

register("guiClosed", (event) => {
    if (event.toString().includes("vigilance")) {
        setRegisters()
    }
});

export function checkIfInSkyblock() {
    let inSkyblockBool = Scoreboard.getTitle()?.removeFormatting().includes("SKYBLOCK");
    return inSkyblockBool;
}



export function getNumberColor(number, range) {
    if (number === range) {
        return "&c" + number;
    }
    else if (number === range - 1) {
        return "&6" + number;
    }
    else {
        return "&9" + number;
    }
}

export function matchLvlToColor(lvl) {
    if (lvl >= 480) {
        return "&4" + lvl;
    } else if (lvl >= 440) {
        return "&c" + lvl;
    } else if (lvl >= 400) {
        return "&6" + lvl;
    } else if (lvl >= 360) {
        return "&5" + lvl;
    } else if (lvl >= 320) {
        return "&d" + lvl;
    } else if (lvl >= 280) {
        return "&9" + lvl;
    } else if (lvl >= 240) {
        return "&3" + lvl;
    } else if (lvl >= 200) {
        return "&b" + lvl;
    } else {
        return "&7" + lvl;
    }
}

export function getGriffinItemColor(item, noColors = false) {
    if (item != 0) {
        if (!item) return "";
        let name = item.replace("PET_ITEM_", "");
        name = toTitleCase(name.replaceAll("_", " "));
        if (noColors) return name;
        switch (name) {
            case "Four Eyed Fish":
                return "&5" + name;
            case "Dwarf Turtle Shelmet":
                return "&a" + name;
            case "Crochet Tiger Plushie":
                return "&5" + name;
            case "Antique Remedies":
                return "&5" + name;
            case "Lucky Clover":
                return "&a" + name;
            case "Minos Relic":
                return "&5" + name;
            default:
                return "&7" + name;
        }
    }
    return "";
}

export function getRarity(item){
    switch (item.toLowerCase().trim()) {
        case "common":
            return "&f" + item;
        case "uncommon":
            return "&a" + item;
        case "rare":
            return "&9" + item;
        case "epic":
            return "&5" + item;
        case "legendary":
            return "&6" + item;
        case "mythic":
            return "&d" + item;
        default:
            return "&7";
    }
}

export function matchDianaKillsToColor(kills) {
    if (kills >= 200000) {
        return "&6" + formatNumberCommas(kills);
    }
    else if (kills >= 150000) {
        return "&e" + formatNumberCommas(kills);
    }
    else if (kills >= 100000) {
        return "&c" + formatNumberCommas(kills);
    }
    else if (kills >= 75000) {
        return "&d" + formatNumberCommas(kills);
    }
    else if (kills >= 50000) {
        return "&9" + formatNumberCommas(kills);
    }
    else if (kills >= 25000) {
        return "&a" + formatNumberCommas(kills);
    }
    else if (kills >= 10000) {
        return "&2" + formatNumberCommas(kills);
    }
    else {
        return "&7" + formatNumberCommas(kills);
    }
}

export function toTitleCase(str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
    );
}

export function formatNumberCommas(number) {
    if(number == undefined) return 0;
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatNumber(number) {
    if(number == undefined) return 0;
    if (number >= 1000000000) {
        return (number / 1000000000).toFixed(2) + "b";
    }
    else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + "m";  
    }
    else if (number >= 1000) {
        return (number / 1000).toFixed(1) + "k";
    }
    return parseFloat(number).toFixed(0);
}