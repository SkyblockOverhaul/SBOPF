import GuiHandler from "./GuiHandler";
import settings from "../settings";
import HandleGui from "../../DocGuiLib/core/Gui";
import { getAllParties } from "../Main/PartyFinder";
import { configState } from "../Main/Data";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint, UIImage, SVGComponent, ScrollComponent } from "../../Elementa";

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
            ChatLib.chat("Reloaded " + this.selectedPage);
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
            ChatLib.chat("Clicked " + pageTitle);
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
            .addChild((new GuiHandler.UILine(
                new CenterConstraint(),
                isSubPage ? new SiblingConstraint(0, true) : new SiblingConstraint(),
                (75).percent(),
                (0.3).percent(),
                [0, 110, 250, 255])).Object
            );
    
        this.elementToHighlight.push({page: pageTitle, obj: text, type: "pageTitle"});
        this.elementToHighlight.push({page: pageTitle, obj: block, type: "pageBlock"});
    }

    updateOnlineUsers(user) {
        if (!this.Onlineusers) return
        this.Onlineusers.setText("Online: " + user)
    }

    updatePartyCount(count) {
        if (!this.partyCount) return
        this.partyCount.setText(" " + count)
    }

    addPartyListFunctions(listName, createParty = () => {}, unqueueParty = () => {}, refresh = () => {}, partyCount = 0) {
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
                refresh()
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

        // this.unqueueParty = new GuiHandler.Button(
        //     "-",
        //     new SiblingConstraint(),
        //     new CenterConstraint(),
        //     (3).percent(),
        //     (70).percent(),
        //     [0, 0, 0, 0],
        //     [255, 0, 0, 255]
        // )
        // this.unqueueParty.textObject.setTextScale(this.getTextScale(2.2))
        // this.unqueueParty.Object.onMouseClick(() => {
        //     unqueueParty()
        // })
        // this.unqueueParty.addTextHoverEffect([255, 0, 0, 255], [50, 50, 255, 200], this.unqueueParty.Object)

        // this.createParty = new GuiHandler.Button(
        //     "+",
        //     new SiblingConstraint(),
        //     new CenterConstraint(),
        //     (3).percent(),
        //     (70).percent(),
        //     [0, 0, 0, 0],
        //     [0, 255, 0, 255]
        // )
        // this.createParty.textObject.setTextScale(this.getTextScale(2.2))
        // this.createParty.Object.onMouseClick(() => {
        //     createParty()
        // })
        // this.createParty.addTextHoverEffect([0, 255, 0, 255], [50, 50, 255, 200], this.createParty.Object)
        
        this.ContentBlock
        .addChild((new GuiHandler.UILine(
            (0).percent(),
            (7).percent(),
            (100).percent(),
            (0.3).percent(),
            [0, 110, 250, 255]
            )).Object
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
        let scroll = new ScrollComponent()
        .setX((0).percent())
        .setY((7.3).percent())
        .setWidth((100).percent())
        .setHeight((92.3).percent())
        .setColor(GuiHandler.Color([0, 0, 0, 0]))
        .setChildOf(this.ContentBlock);

        partyList.forEach(party => {
            new UIBlock()
                .setY(new SiblingConstraint())
                .setWidth((100).percent())
                .setHeight((15).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 150]))
                .enableEffect(new OutlineEffect(GuiHandler.Color([0, 110, 250, 255]), 1))
                .setChildOf(scroll)
        });
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
            "   ・ Wait 10mins and do /ct reload.")
            .setX((2).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setTextScale(this.getTextScale())
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
        )
    }

    _diana() {
        function createParty() {
            ChatLib.chat("Create Party")
        }
        function unqueueParty() {
            ChatLib.chat("Unqueue Party")
        }
        function refresh() {
            ChatLib.chat("Refresh Party List")
        }
        this.addPartyListFunctions("Diana Party List", createParty, unqueueParty, refresh, 5)
        // this.addPartyList(this.testlist)
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
        function refresh() {
            ChatLib.chat("Refresh Party List")
        }
        this.addPartyListFunctions("Dungeons Party List", createParty, unqueueParty, refresh, 5)
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
        this.addPartyListFunctions("Kuudra Party List", createParty, unqueueParty, refresh, 5)
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
        this.addPartyListFunctions("Fishing Party List", createParty, unqueueParty, refresh, 5)
    }

    _create() {
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
        discord.Object.addChild((new GuiHandler.UILine(
            new CenterConstraint(), 
            (100).percent(), 
            (discord.textObject.getWidth() + 10).pixels(), 
            (10).percent(), 
            [0, 110, 250, 255])).Object
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
        github.Object.addChild((new GuiHandler.UILine(
            new CenterConstraint(), 
            (100).percent(), 
            (github.textObject.getWidth() + 10).pixels(), 
            (10).percent(), 
            [0, 110, 250, 255])).Object
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