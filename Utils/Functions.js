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