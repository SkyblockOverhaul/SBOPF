import GuiHandler from "./GuiHandler";
import HandleGui from "../../DocGuiLib/core/Gui";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint, UIImage } from "../../Elementa";

//Sibling Constraint positions the element next to the previous element, but if you set the second parameter to true, it will position it on the opposite side of the previous element.
//---> new SiblingConstraint() will position the element on the right side of the previous element.
//---> new SiblingConstraint(0, true) will position the element on the left side of the previous element.
const File = Java.type("java.io.File");


export default class PartyFinderGUI {
    static clickableElements = []
    static selectedPage = undefined

    constructor() {
        this.gui = new HandleGui()
        this.CtGui = this.gui.ctGui
        this.window = this.gui.window
        this.registers = this.gui.registers
        this.gui.setCommand("pftest")

        this.pages = {}

        this._create()
        this._registers()
    }

    addPage(pageTitle, pageContent) {
        this.pages[pageTitle] = pageContent
        let block = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((60).percent())
            .setHeight((5).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]));
    
        let text = new UIText("・ " + pageTitle)
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([255, 255, 255, 255]));

        GuiHandler.addHoverEffect(text, [255, 255, 255, 255], [50, 50, 255, 200]);
        text.onMouseClick(() => {
            if (PartyFinderGUI.selectedPage === pageTitle) return;
            this.ContentBlock.clearChildren();
            PartyFinderGUI.selectedPage = pageTitle;
            if (pageContent) {
                pageContent();
            }
            ChatLib.chat("Clicked " + pageTitle);
        });
        block.addChild(text)
        this.CategoryBlock.addChild(block)
        .addChild((new GuiHandler.UILine(
            new CenterConstraint(), 
            new SiblingConstraint(), 
            (70).percent(), 
            (0.3).percent(), 
            [0, 110, 250, 255])).Object
        )
    }

    reloadSelectedPageOnOpen() {
        if (PartyFinderGUI.selectedPage && this.pages[PartyFinderGUI.selectedPage]) {
            this.ContentBlock.clearChildren();
            this.pages[PartyFinderGUI.selectedPage]();
            ChatLib.chat("Reloaded " + PartyFinderGUI.selectedPage);
        }
    }

    _registers() {
        this.registers.onOpen(() => {
            this.reloadSelectedPageOnOpen();
        })
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
        this.titleBlock = new UIBlock()
            .setWidth((100).percent())
            .setHeight((5).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.base)
            .addChild(new UIBlock()
                .setWidth((55).percent())
                .setHeight((100).percent())
                .setX(new CenterConstraint())
                .setY(new CenterConstraint())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("SBO Party Finder")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([255, 255, 255, 255]))
                )
            )
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setWidth((10).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(
                    (new GuiHandler.Button(
                        "Discord",
                        new CenterConstraint(),
                        new CenterConstraint(),
                        (80).percent(),
                        (60).percent(),
                        [0, 0, 0, 0],
                        [255, 255, 255, 255],
                    )
                    .addTextHoverEffect([255, 255, 255, 255], [50, 50, 255, 200])
                    .setTextOnClick(() => {
                        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://discord.gg/QvM6b9jsJD"));
                    })).Object
                    .addChild((new GuiHandler.UILine(
                        new CenterConstraint(), 
                        (100).percent(), 
                        (70).percent(), 
                        (7).percent(), 
                        [0, 110, 250, 255])).Object
                    )
                    .addChild(UIImage.ofFile(new File("config/ChatTriggers/modules/SBOPF/Gui/Images/discord.png"))
                        .setX(new SiblingConstraint(0, true))
                        .setY(new CenterConstraint())
                        .setWidth((25).percent())
                        .setHeight((100).percent())
                    )
                )
            )
            .addChild(new UIBlock()
                .setX(new SiblingConstraint())
                .setWidth((10).percent())
                .setHeight((100).percent())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(
                    (new GuiHandler.Button(
                        "GitHub",
                        new CenterConstraint(),
                        new CenterConstraint(),
                        (80).percent(),
                        (60).percent(),
                        [0, 0, 0, 0],
                        [255, 255, 255, 255],
                    )
                    .addTextHoverEffect([255, 255, 255, 255], [50, 50, 255, 200])
                    .setTextOnClick(() => {
                        java.awt.Desktop.getDesktop().browse(new java.net.URI("https://github.com/SkyblockOverhaul/SBOPF"));
                    })).Object
                    .addChild((new GuiHandler.UILine(
                        new CenterConstraint(), 
                        (100).percent(), 
                        (60).percent(), 
                        (7).percent(), 
                        [0, 110, 250, 255])).Object
                    )
                    .addChild(UIImage.ofFile(new File("config/ChatTriggers/modules/SBOPF/Gui/Images/git.png"))
                    .setX(new SiblingConstraint(0, true))
                    .setY(new CenterConstraint())
                    .setWidth((25).percent())
                    .setHeight((100).percent())
                )
                )
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
        this.addPage("Diana", () => this._diana())
        this.addPage("Dungeons")
        this.addPage("Kuudra")
        this.addPage("Fishing")
    }
}
