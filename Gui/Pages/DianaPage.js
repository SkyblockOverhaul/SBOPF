import GuiHandler from "../GuiHandler";
import { configState } from "../../Main/Data";
import { UIBlock, UIText, CenterConstraint, UIRoundedRectangle, SiblingConstraint } from "../../../Elementa";
import { getPlayerStats, formatNumber } from "../../utils/functions";

export default class DianaPage {
    constructor(parent) {
        this.parent = parent;
    }

    getReqsString(reqs) {
        let myReqs = getPlayerStats();
        let reqsString = "";
        if (!reqs) return "";
        if (reqs.lvl) {
            reqsString += "&bLvl: " + (myReqs.sbLvl >= reqs.lvl ? "§a" : "§c") + reqs.lvl + "§r, ";
        }
        if (reqs.kills) {
            reqsString += "&bKills: " + (myReqs.mythosKills >= reqs.kills ? "§a" : "§c") + formatNumber(reqs.kills) + "§r, ";
        }
        if (reqs.eman9) {
            reqsString += (myReqs.eman9 ? "§aEman9" : "§cEman9") + "§r, ";
        }
        if (reqs.looting5) {
            reqsString += (myReqs.looting5daxe ? "§aLooting5" : "§cLooting5") + "§r";
        }
        return reqsString;
    }

    render() {
        this.parent.addPartyListFunctions("Diana Party List", this.createParty.bind(this));
        this.parent.updateCurrentPartyList(true);
    }

    createParty() {
        this.parent.openCpWindow();
        this.parent.cpWindow.setWidth((20).percent());
        this.parent.cpWindow.setHeight((40).percent());
        this.parent.reqsBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((68).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.cpWindow);
        
        let lvlbox = new UIBlock()
            .setX((0).percent())
            .setY((5).pixels())
            .setWidth((100).percent())
            .setHeight((23).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let lvltext = new UIText("SbLvL")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(lvlbox);
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
        );
        lvlinput._create().setChildOf(lvlbox);
        lvlinput.onlyNumbers = true;
        lvlinput.maxChars = 3;
        lvlinput.textInputText.setTextScale(this.parent.getTextScale());
        if (configState.inputs["diana"]["lvl"] !== "") {
            lvlinput.textInputText.setText(configState.inputs["diana"]["lvl"]);
        }
        
        let killsbox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((23).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let killstext = new UIText("Kills ")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(killsbox);
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
        );
        killsinput._create().setChildOf(killsbox);
        killsinput.onlyNumbers = true;
        killsinput.maxChars = 6;
        killsinput.textInputText.setTextScale(this.parent.getTextScale());
        if (configState.inputs["diana"]["kills"] !== "") {
            killsinput.textInputText.setText(configState.inputs["diana"]["kills"]);
        }
        
        let noteBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((23).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let notetext = new UIText("Note ")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(noteBox);
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
        );
        noteinput._create().setChildOf(noteBox);
        noteinput.onlyText = true;
        noteinput.maxChars = 20;
        noteinput.textInputText.setTextScale(this.parent.getTextScale());
        if (configState.inputs["diana"]["note"] !== "") {
            noteinput.textInputText.setText(configState.inputs["diana"]["note"]);
        }
        
        let l5e9box = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((20).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let eman9box = new UIBlock()
            .setX((0).percent())
            .setY((0).percent())
            .setWidth((50).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(l5e9box);
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
        );
        eman9Checkbox._create().setChildOf(eman9box);
        eman9Checkbox.setBgBoxColor([50, 50, 50, 200]);
        eman9Checkbox.text.setTextScale(this.parent.getTextScale());
        
        let looting5box = new UIBlock()
            .setX(new SiblingConstraint())
            .setY((0).percent())
            .setWidth((50).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(l5e9box);
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
        );
        looting5Checkbox._create().setChildOf(looting5box);
        looting5Checkbox.text.setTextScale(this.parent.getTextScale());
        looting5Checkbox.setBgBoxColor([50, 50, 50, 200]);
        
        this.parent.createBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((20).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.cpWindow);
        
        let createButton = new GuiHandler.Button(
            "Create Party",
            new CenterConstraint(),
            new CenterConstraint(),
            (70).percent(),
            (60).percent(),
            [50, 50, 50, 200],
            [255, 255, 255, 255],
            null,
            this.parent.createBox,
            true
        )
        .addHoverEffect([50, 50, 50, 200], [100, 100, 100, 220])
        .setOnClick(() => {
            let reqs = {
            "lvl": configState.inputs["diana"]["lvl"],
            "kills": configState.inputs["diana"]["kills"]
            };
            let reqString = "";
            Object.entries(reqs).forEach(([key, value]) => {
            if (value !== "") reqString += key + value + ",";
            });
            if (configState.checkboxes["diana"]["eman9"]) reqString += "eman9,";
            if (configState.checkboxes["diana"]["looting5"]) reqString += "looting5,";
            let note = configState.inputs["diana"]["note"];
            let partyType = "Diana";
            this.parent.partyCreate(reqString, note, partyType);
            this.parent.closeCpWindow();
        });
        createButton.textObject.setTextScale(this.parent.getTextScale());
    }

    _addDianaFilter(x, y) {
        this.parent.filterWindow
            .setX((x).pixels())
            .setY((y).pixels())
            .setWidth((15).percent())
            .setHeight((20).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]));
        this.parent.filterWindow.setX((this.parent.filterWindow.getLeft() - this.parent.filterWindow.getWidth()).pixels());

        this.parent.filterBox = new UIRoundedRectangle(10)
            .setX((0).percent())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((100).percent())
            .setColor(GuiHandler.Color([50, 50, 50, 255]))
            .setChildOf(this.parent.filterWindow);
        this.parent.filterBox.grabWindowFocus();
        this.parent.filterBox.onMouseClick(() => {
            this.parent.filterBox.grabWindowFocus();
        });
        this.parent.filterBox.onFocusLost(() => {
            this.parent.closeFilterWindow();
        });
        
        let row1 = new UIBlock()
            .setX(new CenterConstraint())
            .setY((0).percent())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.filterBox);
        let row2 = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.filterBox);
        let row3 = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((33.33).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.filterBox);
        
        let eman9Filter = new GuiHandler.Checkbox(
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
        );
        eman9Filter._create().setChildOf(row1);
        eman9Filter.setBgBoxColor([25, 25, 25, 150]);
        eman9Filter.text.setTextScale(this.parent.getTextScale());
        eman9Filter.setOnClick(() => {
            let compositeFilter = this.parent.getFilter(this.parent.selectedPage);
            this.parent.filterPartyList(compositeFilter);
        });
        
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
        );
        looting5Filter._create().setChildOf(row2);
        looting5Filter.setBgBoxColor([25, 25, 25, 150]);
        looting5Filter.text.setTextScale(this.parent.getTextScale());
        looting5Filter.setOnClick(() => {
            let compositeFilter = this.parent.getFilter(this.parent.selectedPage);
            this.parent.filterPartyList(compositeFilter);
        });
        
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
        );
        canIjoinFilter._create().setChildOf(row3);
        canIjoinFilter.setBgBoxColor([25, 25, 25, 150]);
        canIjoinFilter.text.setTextScale(this.parent.getTextScale());
        canIjoinFilter.setOnClick(() => {
            let compositeFilter = this.parent.getFilter(this.parent.selectedPage);
            this.parent.filterPartyList(compositeFilter);
        });
    }
}