import { request } from "../../requestV2";
import { data } from "../Main/Data";

let playerStats = undefined;
let loadingPlayerStats = false;
export function getPlayerStats(useCallback = false, callback = null) {
    if (loadingPlayerStats) return;
    if (playerStats != undefined) {
        return playerStats;
    }
    else {
        loadingPlayerStats = true;
        if (data.playerStatsUpdated && Date.now() - data.playerStatsUpdated < 600000) { // 10 minutes
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