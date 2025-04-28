import { request } from "../../requestV2";
import { getplayername, getPlayerStats, registerWhen, setTimeout } from "../Utils/Functions";
import { HypixelModAPI } from "../../HypixelModAPI";
import EventBus from "../Utils/EventBus";
import settings from "../settings";

let api = "https://api.skyblockoverhaul.com";
let creatingParty = false;
let updateBool = false;
let createPartyTimeStamp = 0;
let inQueue = false;
let partySize = 0;
let partyNote = "";
let partyType = "";
let partyReqs = "";
let partyKey = "";
let partyReqsObj = {};
let requeue = false;
let inParty = false;
let party = [];
export function createParty(sbokey, reqs, note, type, size) {
    if (!creatingParty) {
        partyKey = sbokey;
        partyReqs = reqs;
        partyNote = note;
        partyType = type;
        partySize = size;
        creatingParty = true;
        HypixelModAPI.requestPartyInfo();
        createPartyTimeStamp = Date.now();
    } else {
        ChatLib.chat("&6[SBO] &eYou are already in queue.");
    }
}

export function getAllParties(callback, type) {
    request({
        url: "https://api.skyblockoverhaul.com/getAllParties?partytype=" + type,
        json: true
    }).then((response)=> {
        if (response.Success) {
            callback(response.Parties);
        } else {
            ChatLib.chat("&6[SBO] &4Error: " + response.Error);
        }
    }).catch((error)=> {
        if (error.detail) {
            ChatLib.chat("&6[SBO] &4Error: " + error.detail);
        } else {
            console.error(JSON.stringify(error));
            ChatLib.chat("&6[SBO] &4Unexpected error occurred while getting all parties");
        }
    }
    );
}

export function isInParty() {
    return inParty;
}

export function getInQueue() {
    return inQueue;
}

function checkIfPlayerMeetsReqs(player, reqs) {
    if (reqs.lvl && player.sbLvl < reqs.lvl) {
        return false;
    }
    if (reqs.eman9 && !player.eman9) {
        return false;
    }
    if (reqs.kills && player.mythosKills < reqs.kills) {
        return false;
    }
    if (reqs.looting5 && !player.looting5daxe) {
        return false;
    }
    return true;
}

let playersSendRequest = [];
export function sendJoinRequest(partyLeader, partyReqs) {
    let playerInfo = getPlayerStats();
    if (checkIfPlayerMeetsReqs(playerInfo, partyReqs)) {
        let generatedUUID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        ChatLib.chat("&6[SBO] &eSending join request to " + partyLeader);
        ChatLib.command("msg " + partyLeader + " [SBO] join party request - id:" + generatedUUID + " - " + generatedUUID.length)
        playersSendRequest.push(partyLeader.toLowerCase().trim());
    } else {
        ChatLib.chat("&6[SBO] &eYou don't meet the requirements to join this party");
    }
}

registerWhen(register("chat", (player) => {
    player = getplayername(player).toLowerCase().trim();
    if (playersSendRequest.includes(player)) {
        ChatLib.chat("&6[SBO] &eJoining party: " + player);
        playersSendRequest = [];
        ChatLib.command("p accept " + player);
    }
}).setCriteria("${player} &r&ehas invited you to join their party!").setContains(), "pfEnabled");

let ghostParty = false;
export function removePartyFromQueue(useCallback = false, callback = null) {
    if (inQueue) {
        inQueue = false;
        request({
            url: api + "/unqueueParty?leaderId=" + Player.getUUID().replaceAll("-", ""),
            json: true
        }).then((response)=> {
            if (useCallback && callback) {
                callback(true);
            }
            ChatLib.chat("&6[SBO] &eParty removed from queue.");
        }).catch((error)=> {
            if (error.detail) {
                ChatLib.chat("&6[SBO] &4Error3: " + error.detail);
            } else {
                console.error(JSON.stringify(error));
                ChatLib.chat("&6[SBO] &4Unexpected error occurred while removing party from queue");
            }
        });
    } else if (creatingParty) {
        ghostParty = true;
    }   
}

let requestSend = false;
function updateParty() {
    requestSend = true;
    setTimeout(() => {
        if (requestSend) { // because skytils sends request to mod api after every party member join/leave
            HypixelModAPI.requestPartyInfo();
        }
    }, 500);
}

let lastUpdated = 0;
registerWhen(register("step", () => {
    if (inQueue) {
        if (Date.now() - lastUpdated > 240000) {
            lastUpdated = Date.now();
            request({
                url: api + "/queueUpdate?leaderId=" + Player.getUUID().replaceAll("-", ""),
                json: true
            }).then((response)=> {
                if (!response.Success) {
                    ChatLib.chat("&6[SBO] &4" + response.Error);
                    inQueue = false;
                    inParty = false;
                }
            }).catch((error)=> {
                inQueue = false;
                inParty = false;
                if (error.detail) {
                    ChatLib.chat("&6[SBO] &4Error4: " + error.detail);
                } else {
                    console.error(JSON.stringify(error));
                    ChatLib.chat("&6[SBO] &4Unexpected error occurred while updating queue");
                }
            });
        }
    }
}).setFps(1), "pfEnabled");

let partyCount = 0;
function trackMemberCount(number) {
    partyCount = partyCount + number;
    if (inQueue) {
        if (partyCount >= partySize) {      
            setTimeout(() => {
                ChatLib.chat("&6[SBO] &eYour party is full and removed from the queue.");
                removePartyFromQueue();
            }, 150);
        }
    }
    else {
        if (partyCount < partySize && partyReqs != "" && !requeue) {
            requeue = true;
            if (settings.autoRequeue) {
                setTimeout(() => {
                    ChatLib.chat("&6[SBO] &eRequeuing party with last used requirements...");
                    createParty(partyKey, partyReqs, partyNote, partyType, partySize);
                }, 150);
            } else {
                setTimeout(() => {
                    new TextComponent("&6[SBO] &eClick to requeue party with your last used requirements").setClick("run_command", "/sboqueue").setHover("show_text", "/sboqueue").chat();
                }, 150);
            }
        }
    }
}

const partyDisbanded = [
    /^.+ &r&ehas disbanded the party!&r$/,
    /^&cThe party was disbanded because (.+)$/,
    /^&eYou left the party.&r$/,
    /^&cYou are not currently in a party.&r$/,
    /^&eYou have been kicked from the party by .+$/
] 
const leaderMessages = [
    /^&eYou have joined &r(.+)'s* &r&eparty!&r$/,
    /^&eThe party was transferred to &r(.+) &r&eby &r.+&r$/,
    /^(.+) &r&e has promoted &r(.+) &r&eto Party Leader&r$/
]
const memberJoined = [
    /^(.+) &r&ejoined the party.&r$/,
    /^&eYou have joined &r(.+)'[s]? &r&eparty!&r$/
]
const memberLeft = [
    /^(.+) &r&ehas been removed from the party.&r$/,
    /^(.+) &r&ehas left the party.&r$/,
    /^(.+) &r&ewas removed from your party because they disconnected.&r$/,
    /^&eKicked (.+) because they were offline.&r$/
] 
register("chat", (event) => {
    let formatted = ChatLib.getChatMessage(event, true)
    leaderMessages.forEach(regex => {
        let match = formatted.match(regex)
        if (match) {
            removePartyFromQueue()
        }
    })
    partyDisbanded.forEach(regex => {
        let match = formatted.match(regex)
        if (match) {
            removePartyFromQueue()
            partyCount = 0;
            inParty = false;
            updateParty()
        }
    })
    memberJoined.forEach(regex => {
        let match = formatted.match(regex)
        if (match) {
            updateBool = true;
            updateParty()
            trackMemberCount(1);
            inParty = true;
        }
    })
    memberLeft.forEach(regex => {
        let match = formatted.match(regex)
        if (match) {
            updateBool = true;
            updateParty()
            trackMemberCount(-1);
            inParty = true;
        }
    })
})

register("command", () => {
    ChatLib.chat("&6[SBO] &eRequeuing party with last used requirements...");
    createParty(partyKey, partyReqs);
}).setName("sboqueue");

register("command", () => {
    removePartyFromQueue();
}).setName("sbodequeue");

function invitePlayerIfMeetsReqs(player) {
    request({
        url: api + "/partyInfo?party=" + player,
        json: true
    }).then((response)=> {
        if (response.Success) {
            let playerInfo = response.PartyInfo[0];
            if (checkIfPlayerMeetsReqs(playerInfo, partyReqsObj)) {
                ChatLib.chat("&6[SBO] &eSending invite to " + player);
                ChatLib.command("p invite " + player);
            } 
        } else {
            console.error("&6[SBO] &4Error: " + response.Error);
        }
    }).catch((error)=> {
        if (error.detail) {
            console.error("&6[SBO] &4Error: " + error.detail);
        } else {
            console.error("&6[SBO] &4Unexpected error occurred while checking player: " + player); 
            console.error(JSON.stringify(error));
        }
    });
}

registerWhen(register("chat", (toFrom, player, id, event) => {
    if (inQueue && toFrom.includes("From")) {
        if (partyCount < partySize) {
            player = getplayername(player);
            if (settings.autoInvite) {
                invitePlayerIfMeetsReqs(player);
            } else {
                ChatLib.chat(ChatLib.getChatBreak("&b-"))
                new Message(
                    new TextComponent(`&6[SBO] &b${player} &ewants to join your party.\n`),
                    new TextComponent(`&7[&aAccept&7]`).setClick("run_command", "/p invite " + player).setHover("show_text", "&a/p invite " + player),
                    new TextComponent(` &7[&eCheck Player&7]`).setClick("run_command", "/sbocheck " + player).setHover("show_text", "&eCheck " + player)
                ).chat();
                ChatLib.chat(ChatLib.getChatBreak("&b-"))
            }
        }
    }
    cancel(event);
}).setCriteria("&d${toFrom} ${player}&r&7: &r&7[SBO] join party request - ${id}") , "pfEnabled");

registerWhen(register("chat", (profile, event) => {
    setTimeout(() => {
        getPlayerStats(false, null, true);
    }, 10000);
}).setCriteria("&r&7Switching to profile ${profile}&r"), "pfEnabled");

register("gameUnload", () => {
    if (inQueue) {
        removePartyFromQueue();
    }
})

register("serverDisconnect", () => {
    if (inQueue) {
        removePartyFromQueue();
    }
})

function checkPartyNote() {
    partyNote = partyNote.replaceAll(/[^a-zA-Z0-9\s,.!-_?]/g, ''); // allowed characters a-z, A-Z, 0-9, space, comma, dot, exclamation mark, hyphen, underscore, question mark
    if (partyNote.length > 30) {
        partyNote = partyNote.substring(0, 30);
    }
    partyNote = partyNote.replaceAll(" ", "%20");
}

HypixelModAPI.on("partyInfo", (partyInfo) => {
    requestSend = false;
    party = [];
    Object.keys(partyInfo).forEach(key => {
        inParty = true;
        if (partyInfo[key] == "LEADER") {
            party.unshift(key);
        } else {
            party.push(key);
        }
    })
    if (party.length == 0) party.push(Player.getUUID());
    partyCount = party.length;
    if (creatingParty) {
        if (party[0] != Player.getUUID() && party.length > 1) {
            ChatLib.chat("&6[SBO] &eYou are not the party leader. Only party leader can queue with the party.");
            creatingParty = false;
            return;
        }
        if (party.length >= partySize) {
            ChatLib.chat("&6[SBO] &eParty members limit reached. You can only queue with up to " + partySize + " members.");
            creatingParty = false;
            return;
        }
        checkPartyNote();
        request({
            url: api + "/createParty?uuids=" + party.join(",").replaceAll("-", "") + "&reqs=" + partyReqs + "&note=" + partyNote + "&partytype=" + partyType + "&partysize=" + partySize + "&key=" + partyKey,
            json: true
        }).then((response)=> {
            if (response.Success) {
                let timeTaken = Date.now() - createPartyTimeStamp;
                partyReqsObj = response.PartyReqs;
                EventBus.emit("refreshPartyList");
                inQueue = true; 
                creatingParty = false;
                if (ghostParty) {
                    removePartyFromQueue();
                    ghostParty = false;
                }
                ChatLib.chat("&6[SBO] &eParty created and queued successfully " + timeTaken + "ms");
                if (requeue) {
                    requeue = false;
                    new TextComponent("&6[SBO] &eClick to dequeue party").setClick("run_command", "/sbodequeue").setHover("show_text", "/sbodequeue").chat();
                }
                if (inParty) ChatLib.command("pc [SBO] Party now in queue.");

            } else {
                ChatLib.chat("&6[SBO] &4Error: " + response.Error);
                inQueue = false;
                creatingParty = false;
            }
        }).catch((error)=> {
            inQueue = false;
            creatingParty = false;
            if (error.detail) {
                ChatLib.chat("&6[SBO] &4Error1: " + error.detail);
            } else {
                console.error(JSON.stringify(error));
                ChatLib.chat("&6[SBO] &4Unexpected error occurred while creating party");
            }
        });
    }
    if (updateBool && inQueue) {
        updateBool = false;
        let updatePartyTimeStamp = Date.now();
        if (party.length >= partySize || party.length < 2) return;
        // ChatLib.chat("&6[SBO] &eUpdating party members in queue...");
        request({
            url: api + "/queuePartyUpdate?uuids=" + party.join(",").replaceAll("-", "") + "&reqs=" + partyReqs + "&note=" + partyNote + "&partytype=" + partyType + "&partysize=" + partySize + "&key=" + partyKey,
            json: true
        }).then((response)=> {
            if (response.Success) {
                let timeTaken = Date.now() - updatePartyTimeStamp;
                partyReqsObj = response.PartyReqs;
                ChatLib.chat("&6[SBO] &eParty in queue updated successfully " + timeTaken + "ms");
            } else {
                ChatLib.chat("&6[SBO] &4Error: " + response.Error);
            }
        }).catch((error)=> {
            inQueue = false;
            if (error.detail) {
                ChatLib.chat("&6[SBO] &4Error4: " + error.detail);
            } else {
                console.error(JSON.stringify(error));
                ChatLib.chat("&6[SBO] &4Unexpected error occurred while updating queue");
            }
        });
    }
})

HypixelModAPI.on("error", (error) => {
    creatingParty = false;
    requestSend = false;
})

function countActivePlayers() {
    request({
        url: "https://api.skyblockoverhaul.com/countActiveUsers",
        json: true
    }).catch((error) => {
        console.error("An error occurred while counting active players: " + error.toString());
    });
}

let updateing = false;
let lastUpdate = 0;
register("step", () => {
    // update every 5 minutes
    if (updateing) return;
    if (Date.now() - lastUpdate > 300000 || lastUpdate == 0) {
        updateing = true;
        lastUpdate = Date.now();
        countActivePlayers();
        setTimeout(() => {
            updateing = false;
        }, 300000);
    }
}).setFps(1);