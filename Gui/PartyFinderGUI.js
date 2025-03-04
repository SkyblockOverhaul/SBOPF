import GuiHandler from "./GuiHandler";
import settings from "../settings";
import HandleGui from "../../DocGuiLib/core/Gui";
import EventBus from "../Utils/EventBus";
import { configState } from "../Main/Data";
import { getAllParties, createParty, getInQueue, isInParty, removePartyFromQueue, sendJoinRequest } from "../Main/PartyFinder";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint, SVGComponent, ScrollComponent, FillConstraint } from "../../Elementa";
import { getPlayerStats, getActiveUsers } from "../utils/functions";

const File = Java.type("java.io.File");
const elementaPath = Java.type("gg.essential.elementa");
const vigilancePath = Java.type("gg.essential.vigilance");
let refreshSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/refresh.svg")
let filterSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/filter.svg")
let partyGroupSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/users-group.svg")
let createSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/user-plus.svg")
let unqueueSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/user-minus.svg")
let infoSvg = GuiHandler.svg("./config/ChatTriggers/modules/SBOPF/Gui/Images/info.svg")

export default class PartyFinderGUI {
    constructor() {
        this.gui = new HandleGui()
        this.CtGui = this.gui.ctGui
        this.window = this.gui.window
        this.registers = this.gui.registers
        this.gui.setCommand("pftest")

        this.settings = settings
        this.openGui = false
        this.elementToHighlight = []
        this.selectedPage = "Diana"
        this.pages = {}
        this.partyCache = {}
        this.lastRefreshTime = 0;
        this.cpWindowOpened = false
        this.filterWindowOpened = false

        this.dequeued = false

        EventBus.on("refreshPartyList", () => {
            this.updateCurrentPartyList(true);
        });

        this._create()
        this._registers()
        this._home()
    }

    getTextScale(base = 1) {
        if (base + this.settings.scaleText <= 0) return (0.1).pixels()
        return (base + this.settings.scaleText).pixels()
    }

    getIconScale(base = 18) {
        if (base + this.settings.scaleIcon <= 0) return (1).pixels()
        return (base + this.settings.scaleIcon).pixels()
    }

    getMemberColor(member) {
        if (member < 4) return GuiHandler.Color([0, 255, 0, 255])
        return GuiHandler.Color([255, 165, 0, 255])
    }

    getReqsString(type, reqs) {
        let myReqs = getPlayerStats();
        let reqsString = "";
        switch (type) {
            case "Diana":
                if (!reqs) return "";
                if (reqs.lvl) {
                    reqsString += "&bLvl: " + (myReqs.sbLvl >= reqs.lvl ? "§a" : "§c") + reqs.lvl + "§r, ";
                }
                if (reqs.kills) {
                    reqsString += "&bKills: " + (myReqs.mythosKills >= reqs.kills ? "§a" : "§c") + reqs.kills + "§r, ";
                }
                if (reqs.eman9) {
                    reqsString += (myReqs.eman9 ? "§aEman9" : "§cEman9") + "§r, ";
                }
                if (reqs.looting5) {
                    reqsString += (myReqs.looting5daxe ? "§aLooting5" : "§cLooting5") + "§r";
                }
                break;
            default:
                reqsString = "";
                break;
        }
        return reqsString;
    }

    getFilter(pageType) {
        let myStats = getPlayerStats();
        switch (pageType) {
            case "Diana": {
                let isEman9Active = configState.filters["diana"]["eman9Filter"];
                let isLooting5Active = configState.filters["diana"]["looting5Filter"];
                let isCanIjoinActive = configState.filters["diana"]["canIjoinFilter"];
                if (!isEman9Active && !isLooting5Active && !isCanIjoinActive) return null;
                return party => {
                    if (isEman9Active && !(party.reqs && party.reqs.eman9)) return false;
                    if (isLooting5Active && !(party.reqs && party.reqs.looting5)) return false;
                    if (isCanIjoinActive) {
                        if (party.reqs) {
                            if (party.reqs.lvl && myStats.sbLvl < party.reqs.lvl) return false;
                            if (party.reqs.kills && myStats.mythosKills < party.reqs.kills) return false;
                            if (party.reqs.eman9 && !myStats.eman9) return false;
                            if (party.reqs.looting5 && !myStats.looting5daxe) return false;
                        }
                    }
                    return true;
                };
            }
            case "Dungeons": {
                return null;
            }
            default:
                return null;
        }
    }

    joinParty(leader, reqs) {
        if (!getInQueue() && !isInParty()) {
            sendJoinRequest(leader, reqs)
        }
        else {
            let leaderCheck = leader === Player.getName()
            if (getInQueue() && !isInParty() && !leaderCheck) ChatLib.chat("&6[SBOPF] &eYou are already in queue.")
            if (isInParty() && !getInQueue() && !leaderCheck) ChatLib.chat("&6[SBOPF] &eYou are already in a party.")
            if (leaderCheck) ChatLib.chat("&6[SBOPF] &eYou can't join your own party.")
        }
    }
    
    openFilterWindow() {
        this.filterBackground.unhide(false)
        this.filterWindow.unhide(false)
        this.filterWindowOpened = true
    }

    closeFilterWindow() {
        this.filterBackground.hide()
        this.filterWindow.hide()
        this.base.grabWindowFocus()
        this.checkWindows()
        this.filterWindowOpened = false
    }

    openCpWindow() {
        this.base.hide()
        this.cpWindow.unhide(true)
        this.cpWindowOpened = true
    }

    closeCpWindow() {
        this.cpWindow.hide()
        this.checkWindows()
        this.base.unhide(true)
        this.cpWindowOpened = false
    }

    checkWindows() {
        if (this.reqsBox) this.cpWindow.removeChild(this.reqsBox);
        if (this.createBox) this.cpWindow.removeChild(this.createBox);
        if (this.filterBox) this.window.removeChild(this.filterBox);
    }

    unqueueParty() {
        if (getInQueue()) {
            removePartyFromQueue(true, (response) => {
                this.dequeued = response
                if (this.dequeued) this.updateCurrentPartyList(true)
                else ChatLib.chat("&6[SBOPF] &eFailed to unqueue party.")
            });
        }
    }   

    partyCreate(reqs, note, partyType) {
        createParty(reqs, note, partyType)
    }

    filterPartyList(filterPredicate = null) {
        const partyList = this.partyCache[this.selectedPage];
        if (!partyList) {
            return this.updateCurrentPartyList(true);
        }
        const resultList = filterPredicate ? partyList.filter(filterPredicate) : partyList;
        this.addPartyList(resultList, true);
    }


    updateSelectedPage() {
        if (this.selectedPage && this.pages[this.selectedPage]) {
            this.ContentBlock.clearChildren();
            this.pages[this.selectedPage]();
        }
    }

    updatePageHighlight() {
        this.elementToHighlight.forEach(element => {
            if (element.obj instanceof elementaPath.components.UIBlock) {
                if (element.page === this.selectedPage) {
                    element.obj.setColor(GuiHandler.Color([50, 50, 50, 255]))
                } else {
                    element.obj.setColor(GuiHandler.Color([0, 0, 0, 0]))
                }
            }
            else {
                if (element.page === this.selectedPage) {
                    element.obj.setColor(GuiHandler.Color([50, 50, 255, 200]))
                } else {
                    element.obj.setColor(GuiHandler.Color([255, 255, 255, 255]))
                }
            }
        })
    }

    updateCurrentPartyList(ignoreCooldown = false) {
        let now = new Date().getTime();
        if (!ignoreCooldown && this.lastRefreshTime && (now - this.lastRefreshTime) < 2000) {
            ChatLib.chat("&6[SBOPF] &ePlease wait before refreshing the party list again (2s).");
            return;
        }
        this.lastRefreshTime = now;
        this.partyListContainer.clearChildren();
        getAllParties((partyList) => {
            this.partyCache[this.selectedPage] = partyList;
            const compositeFilter = this.getFilter(this.selectedPage);
            if (compositeFilter) {
                this.filterPartyList(compositeFilter);
            } else {
                this.addPartyList(partyList);
            }
        }, this.selectedPage);
    }
    

    updateOnlineUsers(user) {
        if (!this.Onlineusers) return
        getActiveUsers(true, (activeUsers) => {
            this.Onlineusers.setText("Online: " + activeUsers)
        })
    }

    updatePartyCount(count) {
        if (!this.partyCount) return
        this.partyCount.setText(" " + count)
    }

    addFilterPage(listName, x, y) {
        if (this.filterWindowOpened) {
            this.filterWindowOpened = false
            return
        }   
        else this.openFilterWindow()

        switch (listName) {
            case "Diana Party List":
                this._addDianaFilter(x, y)
                break;
            default:
                return;
        }
    }

    addPage(pageTitle, pageContent, isSubPage = false, y = false, isClickable = false) {
        this.pages[pageTitle] = pageContent;
        y = y ? y : (isSubPage ? new SiblingConstraint(0, true) : new SiblingConstraint());
    
        let block = new UIBlock()
            .setX(new CenterConstraint())
            .setY(y)
            .setWidth((75).percent())
            .setHeight((5).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]));
    
        let text = new UIText("・ " + pageTitle)
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.getTextScale())
    
        block.onMouseClick(() => {
            if (this.selectedPage === pageTitle) return;
            if (!pageContent) return;
            if (isClickable) return pageContent();
            this.ContentBlock.clearChildren();
            this.selectedPage = pageTitle;
            this.updatePageHighlight();
            pageContent();
        });
    
        block.addChild(text)
            .onMouseEnter(() => {
                if (this.selectedPage === pageTitle) return;
                block.setColor(GuiHandler.Color([50, 50, 50, 150]));
            })
            .onMouseLeave(() => {
                if (this.selectedPage === pageTitle) return;
                block.setColor(GuiHandler.Color([0, 0, 0, 0]));
            });
    
        this.CategoryBlock.addChild(block)
            .addChild(new GuiHandler.UILine(
                new CenterConstraint(),
                isSubPage ? new SiblingConstraint(0, true) : new SiblingConstraint(),
                (75).percent(),
                (0.3).percent(),
                [0, 110, 250, 255]).get()
            );
    
        this.elementToHighlight.push({page: pageTitle, obj: text, type: "pageTitle"});
        this.elementToHighlight.push({page: pageTitle, obj: block, type: "pageBlock"});
    }

    addPartyList(partyList = null, ignoreCache = false) {
        if (!partyList) {
            if (!ignoreCache && this.partyCache[this.selectedPage]) {
                partyList = this.partyCache[this.selectedPage];
            } else {
                return getAllParties((fetchedPartyList) => {
                    this.partyCache[this.selectedPage] = fetchedPartyList;
                    this.addPartyList(fetchedPartyList);
                }, this.selectedPage);
            }
        }

        this.updatePartyCount(partyList.length);
        this.partyListContainer.clearChildren();
    
        switch (this.selectedPage) {
            case "Diana":
                this._addDianaPartyList(partyList);
                break;
            default:
                return;
        }
    }

    addPartyListFunctions(listName, createParty = () => {}, partyCount = 0) {
        let line = new GuiHandler.UILine(
            (0).percent(),
            (7).percent(),
            (100).percent(),
            (0.3).percent(),
            [0, 110, 250, 255]
        ).get()
        this.partyCount = new UIText(" " + partyCount)
            .setX(new SiblingConstraint())
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.getTextScale(1.3))

        this.filterSvgComp = new SVGComponent(filterSvg)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setWidth(this.getIconScale())
            .setHeight(this.getIconScale())
            .setColor(GuiHandler.Color([0, 110, 250, 255]))
        this.filter = new UIBlock()
            .setX(new SiblingConstraint(5))
            .setY(new CenterConstraint())
            .setWidth((4).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(this.filterSvgComp)
        this.filter.onMouseClick(() => {
                let x = this.filter.getLeft() + (this.filter.getWidth() / 2)
                let y = line.getBottom()
                this.addFilterPage(listName, x, y)
            })
            .onMouseEnter(() => {
                this.filterSvgComp.setColor(GuiHandler.Color([50, 50, 255, 200]))
            })
            .onMouseLeave(() => {
                this.filterSvgComp.setColor(GuiHandler.Color([0, 110, 250, 255]))
            })

        this.refreshSvgComp = new SVGComponent(refreshSvg)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setWidth(this.getIconScale())
            .setHeight(this.getIconScale())
            .setColor(GuiHandler.Color([0, 110, 250, 255]))
        this.refresh = new UIBlock()
            .setX(new SiblingConstraint(5))
            .setY(new CenterConstraint())
            .setWidth((4).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(this.refreshSvgComp)
            .onMouseClick(() => {
                this.updateCurrentPartyList()
            })
            .onMouseEnter(() => {
                this.refreshSvgComp.setColor(GuiHandler.Color([50, 50, 255, 200]))
            })
            .onMouseLeave(() => {
                this.refreshSvgComp.setColor(GuiHandler.Color([0, 110, 250, 255]))
            })

        this.unqueuePartySvgComp = new SVGComponent(unqueueSvg)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setWidth(this.getIconScale())
            .setHeight(this.getIconScale())
            .setColor(GuiHandler.Color([255, 0, 0, 255]))
        this.unqueuePartyBlock = new UIBlock()
            .setX(new SiblingConstraint(5))
            .setY(new CenterConstraint())
            .setWidth((4).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(this.unqueuePartySvgComp)
            .onMouseClick(() => {
                this.unqueueParty()
            })
            .onMouseEnter(() => {
                this.unqueuePartySvgComp.setColor(GuiHandler.Color([50, 50, 255, 200]))
            })
            .onMouseLeave(() => {
                this.unqueuePartySvgComp.setColor(GuiHandler.Color([255, 0, 0, 255]))
            })

        this.createPartySvgComp = new SVGComponent(createSvg)
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setWidth(this.getIconScale())
            .setHeight(this.getIconScale())
            .setColor(GuiHandler.Color([0, 255, 0, 255]))
        this.createParty = new UIBlock()
            .setX(new SiblingConstraint(5))
            .setY(new CenterConstraint())
            .setWidth((4).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(this.createPartySvgComp)
            .onMouseClick(() => {
                createParty()
            })
            .onMouseEnter(() => {
                this.createPartySvgComp.setColor(GuiHandler.Color([50, 50, 255, 200]))
            })
            .onMouseLeave(() => {
                this.createPartySvgComp.setColor(GuiHandler.Color([0, 255, 0, 255]))
            })
            
        this.partyListContainer = new ScrollComponent()
            .setX((0).percent())
            .setY((7.3).percent())
            .setWidth((100).percent())
            .setHeight((92.3).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.ContentBlock);
        this.ContentBlock
        .addChild(line)
        .addChild(new UIBlock()
            .setWidth((100).percent())
            .setHeight((7).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(new UIBlock()
                .setX(((1).percent()))
                .setY(new CenterConstraint())
                .setWidth((4).percent())
                .setHeight((70).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new SVGComponent(partyGroupSvg)
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setWidth(this.getIconScale())
                    .setHeight(this.getIconScale())
                    .setColor(GuiHandler.Color([0, 110, 250, 255]))
                )
            )
            .addChild(this.partyCount)
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setWidth((70).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText(listName)
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setTextScale(this.getTextScale(1.5))
                    .setColor(GuiHandler.Color([255, 255, 255, 255]))
                )
            )
            .addChild(this.filter)
            .addChild(this.refresh)
            .addChild(this.unqueuePartyBlock)
            .addChild(this.createParty)
        )
    }

    _registers() {
        this.registers.onOpen(() => {
            this.updateSelectedPage();
            this.updateOnlineUsers(1576)
            this.updatePageHighlight();
            //for the unlucky event that someone spams opening and closing the cp winodw
            this.closeCpWindow()
            this.closeFilterWindow()

            if (Client.getMinecraft().field_71474_y.field_74335_Z === 2) return
            this.GuiScale = Client.getMinecraft().field_71474_y.field_74335_Z
            Client.getMinecraft().field_71474_y.field_74335_Z = 2
        })
        this.registers.onClose(() => {
            this.partyCache = {}
            if (Client.getMinecraft().field_71474_y.field_74335_Z !== 2 || this.GuiScale == null) return
            if (this.GuiScale === 2) return
            Client.getMinecraft().field_71474_y.field_74335_Z = this.GuiScale
            this.GuiScale = null
        })

        register('guiClosed', (gui) => {
            if (gui instanceof vigilancePath.gui.SettingsGui) {
                if (!this.openGui) return
                this.window.clearChildren()
                this._create()
                this.openGui = false
                setTimeout(() => {
                    this.CtGui.open()
                }, 100)
            }
        });

        register("guiKey", (keypressed, keycode, gui, event) => {
            if (keycode === Keyboard.KEY_ESCAPE && (this.cpWindowOpened || this.filterWindowOpened)) {
                if (this.cpWindowOpened) this.closeCpWindow()
                if (this.filterWindowOpened) this.closeFilterWindow()
                cancel(event);
            }
        });
    }

    _settings() {
        this.settings.openGUI()
        this.openGui = true
    }

    _home() {
        this.ContentBlock.addChild(new UIBlock()
            .setWidth((100).percent())
            .setHeight((9).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(new UIWrappedText("Welcome to the SBO Party Finder!")
                .setX((2).percent())
                .setY(new CenterConstraint())
                .setWidth((100).percent())
                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                .setTextScale(this.getTextScale(1.5))
            )
        )
        .addChild(new UIWrappedText(
            "・ Find parties with custom requirements that Hypixel doesn't offer.\n\n" +
            "・ Create your own party or join others.\n\n" +
            "・ Set custom requirements and wait for players to join.\n\n" +
            "・ Made and maintained by the Skyblock Overhaul team.\n\n" +
            "・ We rely on a server and appreciate any support to keep it running.")
            .setX((2).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setTextScale(this.getTextScale())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
        )
        
    }

    _help() {
        this.ContentBlock.addChild(new UIBlock()
            .setWidth((100).percent())
            .setHeight((9).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(new UIWrappedText("Help Page!")
                .setX((2).percent())
                .setY(new CenterConstraint())
                .setWidth((100).percent())
                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                .setTextScale(this.getTextScale(1.5))
            )
        )
        .addChild(new UIWrappedText(
            "・ Not Getting any Join Requests?.\n\n" +
            "   ・ Enable private Messages!\n\n" +
            "   ・ /settings -> Social Settings.\n\n" +
            "・ Requirements dont update?\n\n" +
            "   ・ Wait 10mins and do /ct reload.\n\n" +
            "・ Text or Icons to small or to big?\n\n" +
            "   ・ open party finder settings\n\n" +
            "・ Not seeing ur party in the list?\n\n" +
            "   ・ Make sure you have the right filters set."
            )
            .setX((2).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setTextScale(this.getTextScale())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
        )
    }

    _addDianaFilter(x, y) {
        this.filterWindow.setX((x).pixels())
            .setY((y).pixels())
            .setWidth((15).percent())
            .setHeight((20).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
        this.filterWindow.setX((this.filterWindow.getLeft() - this.filterWindow.getWidth()).pixels())
        this.filterBox = new UIRoundedRectangle(10)
            .setX((0).percent())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([50, 50, 50, 255]))
            .setChildOf(this.filterWindow)
        this.filterBox.grabWindowFocus()
        this.filterBox.onMouseClick(() => {
            this.filterBox.grabWindowFocus()
        })
        this.filterBox.onFocusLost(() => {
            this.closeFilterWindow()
        })
        let row1 = new UIBlock()
            .setX(new CenterConstraint())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.filterBox)
        let row2 = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.filterBox)
        let row3 = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.filterBox)

        let eman9Filter= new GuiHandler.Checkbox(
            "diana",
            "eman9Filter",
            new CenterConstraint(),
            new CenterConstraint(),
            (80).percent(),
            (80).percent(),
            [0, 0, 0, 150],
            [200, 200, 200, 200],
            "Eman9",
            true,
            5,
            true
        )
        eman9Filter._create().setChildOf(row1)
        eman9Filter.setBgBoxColor([25, 25, 25, 150])
        eman9Filter.text.setTextScale(this.getTextScale())
        eman9Filter.setOnClick(() => {
            let compositeFilter = this.getFilter(this.selectedPage);
            this.filterPartyList(compositeFilter);
        })

        let looting5Filter = new GuiHandler.Checkbox(
            "diana",
            "looting5Filter",
            new CenterConstraint(),
            new CenterConstraint(),
            (80).percent(),
            (80).percent(),
            [0, 0, 0, 150],
            [200, 200, 200, 200],
            "Looting 5",
            true,
            5,
            true
        )
        looting5Filter._create().setChildOf(row2)
        looting5Filter.setBgBoxColor([25, 25, 25, 150])
        looting5Filter.text.setTextScale(this.getTextScale())
        looting5Filter.setOnClick(() => {
            let compositeFilter = this.getFilter(this.selectedPage);
            this.filterPartyList(compositeFilter);
        })

        let canIjoinFilter = new GuiHandler.Checkbox(
            "diana",
            "canIjoinFilter",
            new CenterConstraint(),
            new CenterConstraint(),
            (80).percent(),
            (80).percent(),
            [0, 0, 0, 150],
            [200, 200, 200, 200],
            "Can I Join?",
            true,
            5,
            true
        )
        canIjoinFilter._create().setChildOf(row3)
        canIjoinFilter.setBgBoxColor([25, 25, 25, 150])
        canIjoinFilter.text.setTextScale(this.getTextScale())
        canIjoinFilter.setOnClick(() => {
            let compositeFilter = this.getFilter(this.selectedPage);
            this.filterPartyList(compositeFilter);
        })
    }

    _addDianaPartyList(partyList) {
        this.partyShowType = new UIBlock()
            .setX((0).percent())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((7).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 150]))
            .setChildOf(this.partyListContainer)
            .addChild(new UIBlock()
                .setWidth((20).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("Leader")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([85, 255, 255, 255]))
                    .setTextScale(this.getTextScale())
                )
            )
            .addChild(new GuiHandler.UILine(
                new SiblingConstraint(),
                new CenterConstraint(),
                (0.3).percent(),
                (80).percent(),
                [0, 110, 250, 255],
                null,
                true
            ).get())
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setWidth((50).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("Reqs/Note")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([85, 255, 255, 255]))
                    .setTextScale(this.getTextScale())
                )
            )
            .addChild(new GuiHandler.UILine(
                new SiblingConstraint(),
                new CenterConstraint(),
                (0.3).percent(),
                (80).percent(),
                [0, 110, 250, 255],
                null,
                true
            ).get())
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setWidth((10).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("Member")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([85, 255, 255, 255]))
                    .setTextScale(this.getTextScale())
                )
            )
            .addChild(new GuiHandler.UILine(
                new SiblingConstraint(),
                new CenterConstraint(),
                (0.3).percent(),
                (80).percent(),
                [0, 110, 250, 255],
                null,
                true
            ).get())
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setWidth(new FillConstraint())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("Button")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([85, 255, 255, 255]))
                    .setTextScale(this.getTextScale())
                )
            )
            
        partyList.forEach(party => {
            let partyBlock = new UIBlock()
                .setY(new SiblingConstraint())
                .setWidth((100).percent())
                .setHeight((22).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 150]))
                .enableEffect(new OutlineEffect(GuiHandler.Color([0, 110, 250, 255]), 1))
                .setChildOf(this.partyListContainer)
                .addChild(new UIBlock()
                    .setWidth((20).percent())
                    .setHeight((100).percent())
                    .setColor(GuiHandler.Color([0, 0, 0, 0]))
                    .addChild(new UIText(party.leaderName)
                        .setX(new CenterConstraint())
                        .setY(new CenterConstraint())
                        .setColor(GuiHandler.Color([85, 255, 255, 255]))
                        .setTextScale(this.getTextScale(1))
                    )
                )
                .addChild(new GuiHandler.UILine(
                    new SiblingConstraint(),
                    new CenterConstraint(),
                    (0.3).percent(),
                    (80).percent(),
                    [0, 110, 250, 255],
                    null,
                    true
                ).get())

                let reqsString = this.getReqsString("Diana", party.reqs)
                
                let reqsNote = new UIBlock()
                    .setX(new SiblingConstraint())
                    .setY(new CenterConstraint())
                    .setWidth((50).percent())
                    .setHeight((100).percent())
                    .setColor(GuiHandler.Color([0, 0, 0, 0]))
                    .addChild(new UIBlock()
                        .setX(new CenterConstraint())
                        .setY((0).pixels())
                        .setWidth((100).percent())
                        .setHeight((50).percent())
                        .setColor(GuiHandler.Color([0, 0, 0, 0]))
                        .addChild(new UIBlock()
                            .setX(new CenterConstraint())
                            .setY(new SiblingConstraint())
                            .setWidth((90).percent())
                            .setHeight((100).percent())
                            .setColor(GuiHandler.Color([0, 0, 0, 0]))
                            .addChild(new UIWrappedText(reqsString)
                                .setX((0).pixels())
                                .setY(new CenterConstraint())
                                .setWidth((100).percent())
                                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                                .setTextScale(this.getTextScale())
                            )
                        )
                    )
                    .addChild(new UIBlock()
                        .setX(new CenterConstraint())
                        .setY(new SiblingConstraint())
                        .setWidth((100).percent())
                        .setHeight((50).percent())
                        .setColor(GuiHandler.Color([0, 0, 0, 0]))
                        .addChild(new UIBlock()
                            .setX(new CenterConstraint())
                            .setY(new CenterConstraint())
                            .setWidth((90).percent())
                            .setHeight((100).percent())
                            .setColor(GuiHandler.Color([0, 0, 0, 0]))
                            .addChild(new UIWrappedText("&bNote: &7" + party.note)
                                .setX((0).pixels())
                                .setY(new CenterConstraint())
                                .setWidth((100).percent())
                                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                                .setTextScale(this.getTextScale())
                            )
                        )

                    )
                partyBlock.addChild(reqsNote)
                .addChild(new GuiHandler.UILine(
                    new SiblingConstraint(),
                    new CenterConstraint(),
                    (0.3).percent(),
                    (80).percent(),
                    [0, 110, 250, 255],
                    null,
                    true
                ).get())
                .addChild(new UIBlock()
                    .setX(new SiblingConstraint())
                    .setY(new CenterConstraint())
                    .setWidth((10).percent())
                    .setHeight((100).percent())
                    .setColor(GuiHandler.Color([0, 0, 0, 0]))
                    .addChild(new UIText(party.partymembers + "/6")
                        .setX(new CenterConstraint())
                        .setY(new CenterConstraint())
                        .setColor(this.getMemberColor(party.partymembers))
                        .setTextScale(this.getTextScale(1))
                    )
                )
                .addChild(new GuiHandler.UILine(
                    new SiblingConstraint(),
                    new CenterConstraint(),
                    (0.3).percent(),
                    (80).percent(),
                    [0, 110, 250, 255],
                    null,
                    true
                ).get())
                let joinBlock = new UIBlock()
                    .setX(new SiblingConstraint())
                    .setY(new CenterConstraint())
                    .setWidth(new FillConstraint())
                    .setHeight((100).percent())
                    .setColor(GuiHandler.Color([50, 50, 50, 0]))
                let joinButton = new GuiHandler.Button(
                    "Join",
                    new CenterConstraint(),
                    new CenterConstraint(),
                    (80).percent(),
                    (50).percent(),
                    [50, 50, 50, 200],
                    [0, 255, 0, 255],
                    false, 
                    null, 
                    true
                )
                joinBlock.addChild(joinButton.get())
                partyBlock.addChild(joinBlock)
                joinButton.textObject.setTextScale(this.getTextScale())
                joinButton.setOnClick(() => {
                    this.joinParty(party.leaderName, party.reqs)
                })
                joinButton.addHoverEffect([50, 50, 50, 200], [70, 70, 70, 200])

        });
    }

    _diana() {
        function createParty() {
            this.openCpWindow()
            this.cpWindow.setWidth((20).percent())
            this.cpWindow.setHeight((40).percent())
            this.reqsBox = new UIBlock()
                .setX((0).percent())
                .setY(new SiblingConstraint())
                .setWidth((100).percent())
                .setHeight((68).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.cpWindow)
            let lvlbox = new UIBlock()
                .setX((0).percent())
                .setY((5).pixels())
                .setWidth((100).percent())
                .setHeight((23).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.reqsBox)
            let lvltext = new UIText("SbLvL")
                .setX((5).percent())
                .setY(new SiblingConstraint(5))
                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                .setTextScale(this.getTextScale())
                .setChildOf(lvlbox)
            let lvlinput = new GuiHandler.TextInput(
                "diana",
                "lvl",
                new CenterConstraint(),
                new SiblingConstraint(5),
                (90).percent(),
                (60).percent(),
                (90).percent(),
                [50, 50, 50, 200],
                [255, 255, 255, 255],
                true
            )
            lvlinput._create().setChildOf(lvlbox)
            lvlinput.onlyNumbers = true
            lvlinput.maxChars = 3
            lvlinput.textInputText.setTextScale(this.getTextScale())
            if (configState.inputs["diana"]["lvl"] !== "") lvlinput.textInputText.setText(configState.inputs["diana"]["lvl"]);

            let killsbox = new UIBlock()
                .setX((0).percent())
                .setY(new SiblingConstraint(5))
                .setWidth((100).percent())
                .setHeight((23).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.reqsBox)
            let killstext = new UIText("Kills ")
                .setX((5).percent())
                .setY(new SiblingConstraint(5))
                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                .setTextScale(this.getTextScale())
                .setChildOf(killsbox)
            
            let killsinput = new GuiHandler.TextInput(
                "diana",
                "kills",
                new CenterConstraint(),
                new SiblingConstraint(5),
                (90).percent(),
                (60).percent(),
                (90).percent(),
                [50, 50, 50, 200],
                [255, 255, 255, 255],
                true
            )
            killsinput._create().setChildOf(killsbox)
            killsinput.onlyNumbers = true
            killsinput.maxChars = 6
            killsinput.textInputText.setTextScale(this.getTextScale())
            if (configState.inputs["diana"]["kills"] !== "") killsinput.textInputText.setText(configState.inputs["diana"]["kills"]);

            let noteBox = new UIBlock()
                .setX((0).percent())
                .setY(new SiblingConstraint(5))
                .setWidth((100).percent())
                .setHeight((23).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.reqsBox)
            let notetext = new UIText("Note ")
                .setX((5).percent())
                .setY(new SiblingConstraint(5))
                .setColor(GuiHandler.Color([255, 255, 255, 255]))
                .setTextScale(this.getTextScale())
                .setChildOf(noteBox)
            let noteinput = new GuiHandler.TextInput(
                "diana",
                "note",
                new CenterConstraint(),
                new SiblingConstraint(5),
                (90).percent(),
                (60).percent(),
                (90).percent(),
                [50, 50, 50, 200],
                [255, 255, 255, 255],
                true
            )
            noteinput._create().setChildOf(noteBox)
            noteinput.onlyText = true
            noteinput.maxChars = 20
            noteinput.textInputText.setTextScale(this.getTextScale())
            if (configState.inputs["diana"]["note"] !== "") noteinput.textInputText.setText(configState.inputs["diana"]["note"]);
            let l5e9box = new UIBlock()
                .setX((0).percent())
                .setY(new SiblingConstraint(5))
                .setWidth((100).percent())
                .setHeight((20).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.reqsBox)
            let eman9box = new UIBlock()
                .setX((0).percent())
                .setY((0).percent())
                .setWidth((50).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(l5e9box)
            let eman9Checkbox = new GuiHandler.Checkbox(
                "diana",
                "eman9",
                new CenterConstraint(),
                new CenterConstraint(),
                (80).percent(),
                (80).percent(),
                [0, 0, 0, 200],
                [200, 200, 200, 200],
                "Eman9",
                true,
                5
            )
            eman9Checkbox._create().setChildOf(eman9box)
            eman9Checkbox.setBgBoxColor([50, 50, 50, 200])
            eman9Checkbox.text.setTextScale(this.getTextScale())
            let looting5box = new UIBlock()
                .setX(new SiblingConstraint())
                .setY((0).percent())
                .setWidth((50).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(l5e9box)
            let looting5Checkbox = new GuiHandler.Checkbox(
                "diana",
                "looting5",
                new CenterConstraint(),
                new CenterConstraint(),
                (80).percent(),
                (80).percent(),
                [0, 0, 0, 200],
                [200, 200, 200, 200],
                "Looting 5",
                true,
                5
            )
            looting5Checkbox._create().setChildOf(looting5box)
            looting5Checkbox.text.setTextScale(this.getTextScale())
            looting5Checkbox.setBgBoxColor([50, 50, 50, 200])
            
            this.createBox = new UIBlock()
                .setX((0).percent())
                .setY(new SiblingConstraint())
                .setWidth((100).percent())
                .setHeight((20).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .setChildOf(this.cpWindow)

            let createButton = new GuiHandler.Button(
                "Create Party",
                new CenterConstraint(),
                new CenterConstraint(),
                (70).percent(),
                (60).percent(),
                [50, 50, 50, 200],
                [255, 255, 255, 255],
                null,
                this.createBox,
                true
            )
            .addHoverEffect([50, 50, 50, 200], [100, 100, 100, 220])
            .setOnClick(() => {
                let reqs = {
                    "lvl": configState.inputs["diana"]["lvl"],
                    "kills": configState.inputs["diana"]["kills"]
                }
                let reqString = ""
                Object.entries(reqs).forEach(([key, value]) => {
                    if (value !== "") reqString += key + value + ","
                })
                if (configState.checkboxes["diana"]["eman9"]) reqString += "eman9,"
                if (configState.checkboxes["diana"]["looting5"]) reqString += "looting5,"
                let note = configState.inputs["diana"]["note"]
                let partyType = "Diana"
                this.partyCreate(reqString, note, partyType)
                this.closeCpWindow()
            })
            createButton.textObject.setTextScale(this.getTextScale())
        }

        this.addPartyListFunctions("Diana Party List", createParty.bind(this), 5)
        this.updateCurrentPartyList(true);
    }

    _dungeons() {
        function createParty() {
            ChatLib.chat("Create Party")
        }

        this.addPartyListFunctions("Dungeons Party List", createParty.bind(this), 5)
    }

    _kuudra() {
        function createParty() {
            ChatLib.chat("Create Party")
        }

        this.addPartyListFunctions("Kuudra Party List", createParty.bind(this), 5)
    }

    _fishing() {
        function createParty() {
            ChatLib.chat("Create Party")
        }

        this.addPartyListFunctions("Fishing Party List", createParty.bind(this), 5)
    }

    _create() {
        this.filterBackground = new UIBlock()
            .setX((0).percent())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 100]))
        this.window.addChild(this.filterBackground)
        this.filterBackground.hide()
        this.filterWindow = new UIRoundedRectangle(10)
        this.window.addChild(this.filterWindow)
        this.filterWindow.hide()

        this.cpWindow = new UIRoundedRectangle(10)
            .setWidth((30).percent())
            .setHeight((40).percent())
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([30, 30, 30, 240]))
            .addChild(new UIBlock()
                .setWidth((100).percent())
                .setHeight((12).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("Create Party")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setTextScale(this.getTextScale(1.5))
                    .setColor(GuiHandler.Color([255, 255, 255, 255]))
                )
            )
            .addChild(new GuiHandler.UILine(
                (0).percent(),
                new SiblingConstraint(),
                (100).percent(),
                (1).percent(),
                [0, 110, 250, 255]
            ).get())


        this.window.addChild(this.cpWindow)
        this.cpWindow.hide()

        this.base = new UIRoundedRectangle(10)
            .setWidth((60).percent())
            .setHeight((65).percent())
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([30, 30, 30, 240]))
            .setChildOf(this.window)
        //-----------------Title Block-----------------
        new GuiHandler.UILine(
            (0).percent(), 
            (5).percent(), 
            (100).percent(), 
            (0.3).percent(), 
            [0, 110, 250, 255], 
            this.base
        )
        this.OnlineuserBlock = new UIBlock()
            .setX((10).percent())
            .setY(new CenterConstraint())
            .setWidth((40).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
        this.Onlineusers = new UIText("Online: 0")
            .setX((0).percent())
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.getTextScale())
            .setChildOf(this.OnlineuserBlock)
        this.titleBlock = new UIBlock()
            .setWidth((100).percent())
            .setHeight((5).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.base)
            .addChild(new UIBlock()
                .setWidth((25).percent())
                .setHeight((100).percent())
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(this.OnlineuserBlock)
            )
            .addChild(new UIBlock()
                .setWidth((50).percent())
                .setHeight((100).percent())
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("SBO Party Finder")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setTextScale(this.getTextScale())
                    .setColor(GuiHandler.Color([255, 255, 255, 255]))
                )
            )
        let block1 = new UIBlock()
            .setX(new SiblingConstraint())
            .setWidth((11).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.titleBlock)
        let discord = new GuiHandler.Button(
                "Discord",
                new CenterConstraint(),
                new CenterConstraint(),
                (80).percent(),
                (60).percent(),
                [0, 0, 0, 0],
                [255, 255, 255, 255],
                null,
                block1
            )
            .addTextHoverEffect([255, 255, 255, 255], [50, 50, 255, 200])
            .setTextOnClick(() => {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/QvM6b9jsJD"));
            })
        discord.textObject.setTextScale(this.getTextScale())
        discord.Object.addChild(new GuiHandler.UILine(
            new CenterConstraint(), 
            (100).percent(), 
            (discord.textObject.getWidth() + 10).pixels(), 
            (10).percent(), 
            [0, 110, 250, 255]).get()
        )
        let block2 = new UIBlock()
            .setX(new SiblingConstraint())
            .setWidth((11).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.titleBlock)
        let github = new GuiHandler.Button(
                "GitHub",
                new CenterConstraint(),
                new CenterConstraint(),
                (80).percent(),
                (60).percent(),
                [0, 0, 0, 0],
                [255, 255, 255, 255],
                null,
                block2
            )
            .addTextHoverEffect([255, 255, 255, 255], [50, 50, 255, 200])
            .setTextOnClick(() => {
                java.awt.Desktop.getDesktop().browse(new java.net.URI("https://github.com/SkyblockOverhaul/SBOPF"));
            })
        github.textObject.setTextScale(this.getTextScale())
        github.Object.addChild(new GuiHandler.UILine(
            new CenterConstraint(), 
            (100).percent(), 
            (github.textObject.getWidth() + 10).pixels(), 
            (10).percent(), 
            [0, 110, 250, 255]).get()
        )
            
        //-----------------Category Block-----------------
        new GuiHandler.UILine(
            (15).percent(), 
            (5).percent(), 
            (0.2).percent(), 
            (95).percent(), 
            [0, 110, 250, 255], 
            this.base
        )
        this.CategoryBlock = new UIBlock()
            .setX((0).percent())
            .setY((5.7).percent())
            .setWidth((15).percent())
            .setHeight((94.3).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.base)

        //-----------------Content Block-----------------
        this.ContentBlock = new UIBlock()
            .setX((15.2).percent())
            .setY((5.3).percent())
            .setWidth((84.8).percent())
            .setHeight((94.7).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.base)
        //-----------------Pages-----------------
        this.addPage("Home", () => this._home(), true, (93).percent())
        this.addPage("Help", () => this._help(), true)
        this.addPage("Settings", () => this._settings(), true, false, true)
        this.addPage("Diana", () => this._diana(), false, (0).percent())
        // this.addPage("Dungeons", () => this._dungeons())
        // this.addPage("Kuudra", () => this._kuudra())
        // this.addPage("Fishing", () => this._fishing())
    }
}