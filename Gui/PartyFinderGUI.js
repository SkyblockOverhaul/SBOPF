import GuiHandler from "./GuiHandler";
import HandleGui from "../../DocGuiLib/core/Gui";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint, UIImage, SVGComponent } from "../../Elementa";

//Sibling Constraint positions the element next to the previous element, but if you set the second parameter to true, it will position it on the opposite side of the previous element.
//---> new SiblingConstraint() will position the element next to the previous element.
//---> new SiblingConstraint(0, true) will position the element before the previous element.
const File = Java.type("java.io.File");
const elementaPath = Java.type("gg.essential.elementa");

export default class PartyFinderGUI {
    constructor() {
        this.gui = new HandleGui()
        this.CtGui = this.gui.ctGui
        this.window = this.gui.window
        this.registers = this.gui.registers
        this.gui.setCommand("pftest")

        this.elementToHighlight = []
        this.selectedPage = "Home"
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

    addPage(pageTitle, pageContent, isSubPage = false, y = false) {
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
    
        block.onMouseClick(() => {
            if (this.selectedPage === pageTitle) return;
            this.ContentBlock.clearChildren();
            this.selectedPage = pageTitle;
            this.updatePageHighlight();
            if (pageContent) {
                pageContent();
            }
            ChatLib.chat("Clicked " + pageTitle);
        });
    
        block.addChild(text)
            .onMouseEnter(() => {
                block.setColor(GuiHandler.Color([50, 50, 50, 100]));
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

    reloadSelectedPageOnOpen() {
        if (this.selectedPage && this.pages[this.selectedPage]) {
            this.ContentBlock.clearChildren();
            this.pages[this.selectedPage]();
            ChatLib.chat("Reloaded " + this.selectedPage);
        }
    }

    updateOnlineUsers(user) {
        this.Onlineusers.setText("Online: " + user)
    }

    _registers() {
        this.registers.onOpen(() => {
            this.reloadSelectedPageOnOpen();
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
                .setTextScale((1.5).pixels())
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
                .setTextScale((1.5).pixels())
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
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
        )
    }

    _diana() {
        this.ContentBlock.addChild((new GuiHandler.UILine(
            (0).percent(), 
            (5).percent(), 
            (100).percent(), 
            (0.3).percent(), 
            [0, 110, 250, 255])).Object
        )
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
        this.addPage("Diana", () => this._diana(), false, (0).percent())
        this.addPage("Dungeons")
        this.addPage("Kuudra")
        this.addPage("Fishing")
    }
}