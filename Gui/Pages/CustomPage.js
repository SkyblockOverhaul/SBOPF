import GuiHandler from "../GuiHandler";
import { configState, data } from "../../main/Data";
import { UIBlock, UIText, CenterConstraint, UIRoundedRectangle, SiblingConstraint } from "../../../Elementa";
import { getPlayerStats, matchLvlToColor, getNumberColor, formatNumberCommas } from "../../Utils/Functions";
export default class CustomPage {
    constructor(parent) {
        this.parent = parent;
    }

    getPartyInfo(info) {
        let formattedInfo = [
            ["&9Name: &b", info.name],
            ["&9Skyblock Level: ", matchLvlToColor(info.sbLvl)],
            ["&9Uuid: &7", info.uuid],
            ["&9Eman9: ", getNumberColor(info.emanLvl, 9)],
            ["&9Clover: ", info.clover ? "&a✔" : "&c✘"],
            ["&9Magical Power: &b", info.magicalPower],
            ["&9Enrichments: &b", info.enrichments],
            ["&9Missing Enrichments: &b", info.missingEnrichments],
            ["&9Warnings: &7", info.warnings.join(", ")]
        ]
        let formattedInfoString = ""
        formattedInfo.forEach((info) => {
            formattedInfoString += info[0] + info[1] + "\n\n"
        })
        return formattedInfoString
    }

    getReqsString(reqs) {
        let myReqs = getPlayerStats();
        let reqsString = "";
        if (!reqs) return "";
        if (reqs.lvl) {
            reqsString += "&bLvl: " + (myReqs.sbLvl >= reqs.lvl ? "§a" : "§c") + reqs.lvl + "§r, ";
        }
        if (reqs.mp) {
            reqsString += "&bMp: " + (myReqs.magicalPower >= reqs.mp ? "§a" : "§c") + formatNumberCommas(reqs.mp) + "§r, ";
        }
        if (reqs.eman9) {
            reqsString += (myReqs.eman9 ? "§aEman9" : "§cEman9") + "§r, ";
        }
        return reqsString;
    }

    render() {
        this.parent.addPartyListFunctions("Custom Party List", this.createParty.bind(this));
        this.parent.updateCurrentPartyList(true);
    }

    createParty() {
        this.parent.openCpWindow();
        this.parent.cpWindow.setWidth((20).percent());
        this.parent.cpWindow.setHeight((54).percent());
        this.parent.reqsBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((70).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.cpWindow);
        let lvlbox = new UIBlock()
            .setX((0).percent())
            .setY((5).pixels())
            .setWidth((100).percent())
            .setHeight((18).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let lvltext = new UIText("SbLvL")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(lvlbox);
        let lvlinput = new GuiHandler.TextInput(
            "custom",
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
        lvlinput.textInputText.setTextScale(this.parent.getTextScale())
        if (configState.inputs["custom"]["lvl"] !== "") {
            lvlinput.textInputText.setText(configState.inputs["custom"]["lvl"]);
        }
        let mpbox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((18).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let mptext = new UIText("Mp")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(mpbox);
        let mpinput = new GuiHandler.TextInput(
            "custom",
            "mp",
            new CenterConstraint(),
            new SiblingConstraint(5),
            (90).percent(),
            (60).percent(),
            (90).percent(),
            [50, 50, 50, 200],
            [255, 255, 255, 255],
            true
        );
        mpinput._create().setChildOf(mpbox);
        mpinput.onlyNumbers = true;
        mpinput.maxChars = 4;
        mpinput.textInputText.setTextScale(this.parent.getTextScale())
        if (configState.inputs["custom"]["mp"] !== "") {
            mpinput.textInputText.setText(configState.inputs["custom"]["mp"]);
        }
        let partySizeBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((18).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let partySizeText = new UIText("Party Size")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(partySizeBox);
        let partySizeInput = new GuiHandler.TextInput(
            "custom",
            "partySize",
            new CenterConstraint(),
            new SiblingConstraint(5),
            (90).percent(),
            (60).percent(),
            (90).percent(),
            [50, 50, 50, 200],
            [255, 255, 255, 255],
            true
        );
        partySizeInput._create().setChildOf(partySizeBox);
        partySizeInput.onlyNumbers = true;
        partySizeInput.maxChars = 2;
        partySizeInput.textInputText.setTextScale(this.parent.getTextScale())
        if (configState.inputs["custom"]["partySize"] !== "") {
            partySizeInput.textInputText.setText(configState.inputs["custom"]["partySize"]);
        }
        let notebox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((18).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let notetext = new UIText("Note")
            .setX((5).percent())
            .setY(new SiblingConstraint(5))
            .setColor(GuiHandler.Color([255, 255, 255, 255]))
            .setTextScale(this.parent.getTextScale())
            .setChildOf(notebox);
        let noteinput = new GuiHandler.TextInput(
            "custom",
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
        noteinput._create().setChildOf(notebox);
        noteinput.maxChars = 30;
        noteinput.textInputText.setTextScale(this.parent.getTextScale())
        if (configState.inputs["custom"]["note"] !== "") {
            noteinput.textInputText.setText(configState.inputs["custom"]["note"]);
        }
        let eman9Box = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint(5))
            .setWidth((100).percent())
            .setHeight((18).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.reqsBox);
        let eman9Checkbox = new GuiHandler.Checkbox(
            "custom",
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
        eman9Checkbox._create().setChildOf(eman9Box);
        eman9Checkbox.setBgBoxColor([50, 50, 50, 200]);
        eman9Checkbox.text.setTextScale(this.parent.getTextScale());

        this.parent.createBox = new UIBlock()
            .setX((0).percent())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((18).percent())
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
                "lvl": configState.inputs["custom"]["lvl"],
                "mp": configState.inputs["custom"]["mp"],
            };
            let reqString = "";
            Object.entries(reqs).forEach(([key, value]) => {
                if (value !== "") reqString += key + value + ",";
            });
            if (configState.checkboxes["custom"]["eman9"]) reqString += "eman9,";
            let note = configState.inputs["custom"]["note"];
            let partyType = "Custom";
            let partysize = configState.inputs["custom"]["partySize"];
            let sboKey = data.sboKey;
            if (!sboKey || !sboKey.startsWith("sbo")) ChatLib.chat("&cPlease set your SBO key with /sbosetkey  <key>, if you don't have one, get it in our discord.");
            this.parent.partyCreate(sboKey, reqString, note, partyType, partysize);
            this.parent.closeCpWindow();
        });
        createButton.textObject.setTextScale(this.parent.getTextScale());
    }

    _addCustomFilter(x, y) {
        this.parent.filterWindow
            .setX((x).pixels())
            .setY((y).pixels())
            .setWidth((15).percent())
            .setHeight((15).percent())
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
            .setHeight((50).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.filterBox);
        let row2 = new UIBlock()
            .setX(new CenterConstraint())
            .setY(new SiblingConstraint())
            .setWidth((100).percent())
            .setHeight((50).percent())
            .setColor(GuiHandler.Color([0, 0, 0, 0]))
            .setChildOf(this.parent.filterBox);
        let eman9Filter = new GuiHandler.Checkbox(
            "custom",
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
        let canIjoinFilter = new GuiHandler.Checkbox(
            "custom",
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
        canIjoinFilter._create().setChildOf(row2);
        canIjoinFilter.setBgBoxColor([25, 25, 25, 150]);
        canIjoinFilter.text.setTextScale(this.parent.getTextScale());
        canIjoinFilter.setOnClick(() => {
            let compositeFilter = this.parent.getFilter(this.parent.selectedPage);
            this.parent.filterPartyList(compositeFilter);
        });
    }
}