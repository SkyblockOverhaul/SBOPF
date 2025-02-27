import GuiHandler from "./GuiHandler";
import HandleGui from "../../DocGuiLib/core/Gui";
import { UIBlock, UIText, UIWrappedText, OutlineEffect, CenterConstraint, UIRoundedRectangle, SiblingConstraint  } from "../../Elementa";

export default class PartyFinderGUI {
    static clickableElements = []

    constructor() {
        this.gui = new HandleGui()
        this.CtGui = this.gui.ctGui
        this.window = this.gui.window
        this.registers = this.gui.registers
        this.gui.setCommand("pftest")

        this._create()
        this._registers()
    }

    _registers() {
        this.registers.onOpen(() => {
            print("Opened")
        })
    }

    _create() {
        this.base = new UIRoundedRectangle(10)
            .setWidth((80).percent())
            .setHeight((80).percent())
            .setX(new CenterConstraint())
            .setY(new CenterConstraint())
            .setColor(GuiHandler.Color([30, 30, 30, 240]))
            .setChildOf(this.window)

        this.titleBlock = new UIBlock()
            .setWidth((100).percent())
            .setHeight((5).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.base)
            .addChild(new UIBlock()
                .setWidth((50).percent())
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
                .setWidth((10).percent())
                .setHeight((100).percent())
                .setX(new SiblingConstraint())
                .setY(new CenterConstraint())
                .setColor(GuiHandler.Color([0, 0, 0, 0]))
                .addChild(new UIText("X")
                    .setX(new CenterConstraint())
                    .setY(new CenterConstraint())
                    .setColor(GuiHandler.Color([255, 255, 255, 255]))
                )
            )
        new GuiHandler.UILine(
            (0).percent(), 
            (5).percent(), 
            (100).percent(), 
            (0.3).percent(), 
            [255, 255, 255, 255], 
            this.base
        )
        

    }
}