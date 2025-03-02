import GuiHandler from "./GuiHandler";
import settings from "../settings";
import HandleGui from "../../DocGuiLib/core/Gui";
import EventBus from "../Utils/EventBus";
import { configState } from "../Main/Data";
import { getAllParties, createParty, getInQueue, removePartyFromQueue } from "../Main/PartyFinder";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint, SVGComponent, ScrollComponent } from "../../Elementa";

//Sibling Constraint positions the element next to the previous element, but if you set the second parameter to true, it will position it on the opposite side of the previous element.
//---> new SiblingConstraint() will position the element next to the previous element.
//---> new SiblingConstraint(0, true) will position the element before the previous element.
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

        this.dequeued = false

        EventBus.on("refreshPartyList", () => {
            this.refreshCurrentPartyList(true);
        });

        this._create()
        this._registers()
        this._home()
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

    getTextScale(base = 1) {
        if (base + this.settings.scaleText <= 0) return (0.1).pixels()
        return (base + this.settings.scaleText).pixels()
    }

    getIconScale(base = 18) {
        if (base + this.settings.scaleIcon <= 0) return (1).pixels()
        return (base + this.settings.scaleIcon).pixels()
    }

    reloadSelectedPage() {
        if (this.selectedPage && this.pages[this.selectedPage]) {
            this.ContentBlock.clearChildren();
            this.pages[this.selectedPage]();
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

    partyCreate(reqs, note, partyType) {
        createParty(reqs, note, partyType)
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
    }

    updateOnlineUsers(user) {
        if (!this.Onlineusers) return
        this.Onlineusers.setText("Online: " + user)
    }

    updatePartyCount(count) {
        if (!this.partyCount) return
        this.partyCount.setText(" " + count)
    }

    addPartyListFunctions(listName, createParty = () => {}, unqueueParty = () => {}, partyCount = 0) {
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
            .onMouseClick(() => {
                ChatLib.chat("Filter Party List")
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
                this.refreshCurrentPartyList()
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
        this.unqueueParty = new UIBlock()
            .setX(new SiblingConstraint(5))
            .setY(new CenterConstraint())
            .setWidth((4).percent())
            .setHeight((80).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .addChild(this.unqueuePartySvgComp)
            .onMouseClick(() => {
                unqueueParty()
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
        .addChild(new GuiHandler.UILine(
            (0).percent(),
            (7).percent(),
            (100).percent(),
            (0.3).percent(),
            [0, 110, 250, 255]
            ).get()
        )
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
            .addChild(this.unqueueParty)
            .addChild(this.createParty)
        )
    }

    addPartyList(partyList) {
        this.updatePartyCount(partyList.length)
        this.partyListContainer.clearChildren()
        switch (this.selectedPage) {
            case "Diana":
                this._addDianaPartyList(partyList)
                break;
            default:
                return
        }
    }
    
    refreshCurrentPartyList(ignoreCooldown = false) {
        let now = new Date().getTime()
        if (!ignoreCooldown && this.lastRefreshTime && (now - this.lastRefreshTime) < 2000) {
            ChatLib.chat("&6[SBOPF] &ePlease wait before refreshing the party list again (2s).")
            return
        }
        this.lastRefreshTime = now

        this.partyListContainer.clearChildren()
        getAllParties((partyList) => {
            this.partyCache[this.selectedPage] = partyList
            this.addPartyList(partyList)
        }, this.selectedPage)
    }

    _registers() {
        this.registers.onOpen(() => {
            this.reloadSelectedPage();
            this.updateOnlineUsers(1576)
            this.updatePageHighlight();

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
            if (keycode === Keyboard.KEY_ESCAPE && this.cpWindowOpened) {
                this.closeCpWindow()
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
            "   ・ open party finder settings"
            )
            .setX((2).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setTextScale(this.getTextScale())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
        )
    }

    _addDianaPartyList(partyList) {
        partyList.forEach(party => {
            let partyBlock = new UIBlock()
                .setY(new SiblingConstraint())
                .setWidth((100).percent())
                .setHeight((15).percent())
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
                        .setColor(GuiHandler.Color([255, 255, 255, 255]))
                        .setTextScale(this.getTextScale(1.5))
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
                // .addChild(new UIBlock()
                //     .setWidth((15).percent())
                //     .setHeight((50).percent())
                //     .setColor(GuiHandler.Color([0, 0, 0, 150]))
                //     .addChild(new SVGComponent(crownSvg)
                //         .setX((10).pixels())
                //         .setY(new CenterConstraint())
                //         .setWidth(this.getIconScale())
                //         .setHeight(this.getIconScale())
                //         .setColor(GuiHandler.Color([255, 215, 0, 255]))
                //     )
                //     .addChild(new UIText(party.leaderName)
                //         .setX(new SiblingConstraint(5))
                //         .setY(new CenterConstraint())
                //         .setColor(GuiHandler.Color([255, 255, 255, 255]))
                //         .setTextScale(this.getTextScale(1.5))
                //     )
                // )
                // .addChild(new UIText("Members: " + party.partymembers + "/6")
                //     .setX((2).percent())
                //     .setY(new SiblingConstraint())
                //     .setColor(GuiHandler.Color([255, 255, 255, 255]))
                //     .setTextScale(this.getTextScale())
                // )
                // .addChild(new UIText("Note: " + party.note)
                //     .setX((2).percent())
                //     .setY(new SiblingConstraint())
                //     .setColor(GuiHandler.Color([255, 255, 255, 255]))
                //     .setTextScale(this.getTextScale())
                // )
                // Object.entries(party.reqs).forEach(([key, value]) => {
                //     partyBlock.addChild(new UIText(key + ": " + value)
                //         .setX((2).percent())
                //         .setY(new SiblingConstraint())
                //         .setColor(GuiHandler.Color([255, 255, 255, 255]))
                //         .setTextScale(this.getTextScale())
                //     )
                // })

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
                .setHeight((30).percent())
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
                .setHeight((30).percent())
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
                .setHeight((30).percent())
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
            noteinput.maxChars = 30
            noteinput.textInputText.setTextScale(this.getTextScale())
            if (configState.inputs["diana"]["note"] !== "") noteinput.textInputText.setText(configState.inputs["diana"]["note"]);
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
                if (getInQueue()) {
                    ChatLib.chat("&6[SBOPF] &eYou are already in queue.")
                    this.closeCpWindow()
                    return
                }
                let reqs = {
                    "lvl": configState.inputs["diana"]["lvl"],
                    "kills": configState.inputs["diana"]["kills"]
                }
                let reqString = ""
                Object.entries(reqs).forEach(([key, value]) => {
                    if (value !== "") reqString += key + value + ","
                })
                let note = configState.inputs["diana"]["note"]
                let partyType = "Diana"
                this.partyCreate(reqString, note, partyType)
                this.closeCpWindow()
            })
            createButton.textObject.setTextScale(this.getTextScale())
        }
        function unqueueParty() {
            if (getInQueue()) {
                removePartyFromQueue(true, (response) => {
                    this.dequeued = response
                    if (this.dequeued) this.refreshCurrentPartyList(true)
                    else ChatLib.chat("&6[SBOPF] &eFailed to unqueue party.")
                });
            }
        }
        this.addPartyListFunctions("Diana Party List", createParty.bind(this), unqueueParty.bind(this), 5)
        if (this.partyCache["Diana"]) {
            this.addPartyList(this.partyCache["Diana"])
        } else {
            getAllParties((partyList) => {
                this.partyCache["Diana"] = partyList
                this.addPartyList(partyList)
            }, "Diana")
        }
        // this.eman9Checkbox = new GuiHandler.Checkbox(
        //     "diana",
        //     "eman9",
        //     (5).percent(),
        //     (5).percent(),
        //     (5).percent(),
        //     (5).percent(),
        //     [50, 50, 50, 200],
        //     [100, 100, 100, 200],
        //     true,
        //     5
        // )
    }

    _dungeons() {
        function createParty() {
            ChatLib.chat("Create Party")
        }
        function unqueueParty() {
            ChatLib.chat("Unqueue Party")
        }
        this.addPartyListFunctions("Dungeons Party List", createParty.bind(this), unqueueParty.bind(this), 5)
    }

    _kuudra() {
        function createParty() {
            ChatLib.chat("Create Party")
        }
        function unqueueParty() {
            ChatLib.chat("Unqueue Party")
        }
        function refresh() {
            ChatLib.chat("Refresh Party List")
        }
        this.addPartyListFunctions("Kuudra Party List", createParty.bind(this), unqueueParty.bind(this), 5)
    }

    _fishing() {
        function createParty() {
            ChatLib.chat("Create Party")
        }
        function unqueueParty() {
            ChatLib.chat("Unqueue Party")
        }
        function refresh() {
            ChatLib.chat("Refresh Party List")
        }
        this.addPartyListFunctions("Fishing Party List", createParty.bind(this), unqueueParty.bind(this), 5)
    }

    _create() {
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
        // hier eine intro seite einfügen in contentblock!!

        //-----------------Pages-----------------
        this.addPage("Home", () => this._home(), true, (93).percent())
        this.addPage("Help", () => this._help(), true)
        this.addPage("Settings", () => this._settings(), true, false, true)
        this.addPage("Diana", () => this._diana(), false, (0).percent())
        this.addPage("Dungeons", () => this._dungeons())
        this.addPage("Kuudra", () => this._kuudra())
        this.addPage("Fishing", () => this._fishing())
    }
}