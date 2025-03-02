import { CenterConstraint, UIBlock, UIText, UIWrappedText, UIRoundedRectangle, SVGParser, UITextInput } from "../../Elementa";
import { configState } from "../Main/Data";


export default class GuiHandler {
    static JavaColor = java.awt.Color

    static Color(color = [255, 255, 255, 255]) {
        const [r, g, b, a] = color
        return new this.JavaColor(r / 255, g / 255, b / 255, a / 255)
    }

    static percentToPixel(percent, value) {
        return (percent / 100) * value
    }

    static svg(path) {
        let SAXReader = Java.type("gg.essential.elementa.impl.dom4j.io.SAXReader")
        let Document = Java.type("gg.essential.elementa.impl.dom4j.Document").class
        let FileInputStream = Java.type("java.io.FileInputStream")
        let parseDocument = SVGParser.getClass().getDeclaredMethod("parseDocument", Document)
        parseDocument.setAccessible(true)

        let reader = new SAXReader()
        let stream = new FileInputStream(path)
        let document = reader.read(stream)
        return parseDocument.invoke(SVGParser, document)
    }

    static addHoverEffect(comp, baseColor, hoverColor = [50, 50, 50, 200]) {
        comp.onMouseEnter((comp, event) => {
            comp.setColor(GuiHandler.Color(hoverColor));
        }).onMouseLeave((comp, event) => {
            comp.setColor(GuiHandler.Color(baseColor));
        });
    }

    _triggerEvent(handler, ...args) {
        if (!handler) return null
        handler[1](...args)
        if (handler[0]) return 1
    }

    static Button = class {
        constructor(text, x, y, width, height, color, textColor = false, outline = false, comp = false, rounded = false, wrapped = false) {
            this.text = text;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.textColor = textColor;
            this.outline = outline;
            this.comp = comp;
            this.callback = undefined;
    
            this.Object = rounded ? new UIRoundedRectangle(10) : new UIBlock();
            this.textObject = wrapped ? new UIWrappedText(text) : new UIText(text);
            
            this._create();
        }

        get() {
            return this.Object;
        }

        addHoverEffect(baseColor, hoverColor = [50, 50, 50, 200]) {
            GuiHandler.addHoverEffect(this.Object, baseColor, hoverColor);
            return this;
        }

        addTextHoverEffect(baseColor, hoverColor = [50, 50, 50, 200], comp = this.textObject) {
            comp.onMouseEnter(() => {
                this.textObject.setColor(GuiHandler.Color(hoverColor));
            }).onMouseLeave(() => {
                this.textObject.setColor(GuiHandler.Color(baseColor));
            });
            return this;
        }
        
        setOnClick(callback) {
            this.Object.onMouseClick(() => {
                if (callback) {
                    callback();
                }
            });
            return this;
        }

        setTextOnClick(callback) {
            this.textObject.onMouseClick(() => {
                if (callback) {
                    callback();
                }
            });
            return this;
        }
        
        _create() {
            this.Object
                .setX(this.x)
                .setY(this.y)
                .setWidth(this.width)
                .setHeight(this.height)
                .setColor(GuiHandler.Color(this.color))
            if (this.outline) {
                this.Object.enableEffect(this.outline)
            }
            if (this.comp) {
                this.Object.setChildOf(this.comp)
            }

            this.textObject
                .setX(new CenterConstraint())
                .setY(new CenterConstraint())
                .setChildOf(this.Object)
            if (this.textColor) {
                this.textObject.setColor(GuiHandler.Color(this.textColor))
            }
        }
    }    

    static UILine = class {
        constructor(x, y, width, height, color, comp = false, rounded = false, roundness = 5) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.comp = comp;
            this.roundness = roundness;
            
            this.Object = rounded ? new UIRoundedRectangle(this.roundness) : new UIBlock();

            this._create();
        }

        get() {
            return this.Object;
        }

        _create() {
            this.Object
                .setX(this.x)
                .setY(this.y)
                .setWidth(this.width)
                .setHeight(this.height)
                .setColor(GuiHandler.Color(this.color))
            if (this.comp) {
                this.Object.setChildOf(this.comp)
            }
        }
    }    

    static Checkbox = class {
        constructor(list, key, x, y, width, height, color, checkedColor, rounded = false, roundness = 10) {
            this.list = list;
            this.key = key;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.color = color;
            this.checkedColor = checkedColor;
            this.rounded = rounded;
            this.checked = configState.checkboxes[list][key] || false;
            this.Checkbox = rounded ? new UIRoundedRectangle(roundness) : new UIBlock();
            this.outlineBlock = rounded ? new UIRoundedRectangle(roundness) : new UIBlock();
        }

        _create() {
            this.Checkbox.setX(this.x)
                .setY(this.y)
                .setWidth(this.width)
                .setHeight(this.height)
                .setColor(GuiHandler.Color(this.checked ? this.checkedColor : this.color));

            this.Checkbox.onMouseClick(() => {
                this.checked = !this.checked;
                
                if (this.checked) {
                    this.Checkbox.setColor(GuiHandler.Color(this.checkedColor));
                } else {
                    this.Checkbox.setColor(GuiHandler.Color(this.color));
                }
                configState.update("checkboxes", this.list, this.key, this.checked);
            });
            return this.Checkbox;
        }
    }

    static TextInput = class {
        constructor(list, key, x, y, width, height, inputWidth, color, textColor, rounded = false, roundness = 5) {
            this.list = list;
            this.key = key;
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            this.inputWidth = inputWidth;
            this.color = color;
            this.textColor = textColor;
            this.rounded = rounded;
            this.roundness = roundness;

            this.onlyNumbers = false;
            this.onlyText = false;
            this.lastValidText = configState.inputs[list][key] || "";
            this.maxChars = 0;

            this.text = null;
            this.textSet = false;
            this.textInput = rounded ? new UIRoundedRectangle(roundness) : new UIBlock();
            this.textInputText = new UITextInput("", true);
        }



        _create() {
            this.textInput.setX(this.x)
                .setY(this.y)
                .setWidth(this.width)
                .setHeight(this.height)
                .setColor(GuiHandler.Color(this.color));

            this.textInputText.setX(new CenterConstraint())
                .setY(new CenterConstraint())
                .setX(new CenterConstraint())
                .setWidth(this.inputWidth)
                .setHeight((10).pixels())
                .setColor(GuiHandler.Color(this.textColor))
                .setChildOf(this.textInput);

            this.textInputText.onFocusLost(() => {
                if (this.text) return
            });

            keybindEvents.push((keyChar, keyCode) => {
                if (!this.textInput.hasFocus()) return
                this.textInputText.keyType(keyChar, keyCode)
            })

            this.textInput.onMouseClick(() => {
                if (!this.textSet) {
                    if(configState.inputs[this.list][this.key] === "") this.text = this.textInputText.getText();
                    else this.text = configState.inputs[this.list][this.key];
                    this.textInputText.setText(this.text);
                    this.textSet = true;
                }
                this.textInputText.grabWindowFocus()
                this.textInputText.focus()
            });
            
            this.textInputText.onMouseClick((component, __) => {      
                if(!this.textSet) {
                    if(configState.inputs[this.list][this.key] === "") this.text = this.textInputText.getText();
                    else this.text = configState.inputs[this.list][this.key];
                    component.setText(this.text);
                    this.textSet = true;
                }
                component.grabWindowFocus()
                component.focus()
            })

            this.textInputText.onKeyType((input, char, key) => {
                if (this.maxChars > 0 && input.getText().length > this.maxChars && key !== Keyboard.KEY_BACK && key !== Keyboard.KEY_DELETE) {
                    input.setText(this.lastValidText);
                    return;
                }
                if (key === Keyboard.KEY_BACK || key === Keyboard.KEY_DELETE) {
                    this.text = input.getText();
                    this.lastValidText = this.text;
                    configState.update("inputs", this.list, this.key, this.text);
                    return;
                }
                if (this.onlyNumbers && isNaN(char)) {
                    input.setText(this.lastValidText);
                    return
                }
                if (this.onlyText && !isNaN(char)) {
                    input.setText(this.lastValidText);
                    return
                }
                this.text = input.getText();
                this.lastValidText = this.text;
                configState.update("inputs", this.list, this.key, this.text);
            });
            return this.textInput;
        }
    }
}

let ticks = 0
let keybindEvents = []

register("tick", () => {
    if (!World.isLoaded() || !Keyboard.isKeyDown(Keyboard.KEY_BACK)) return ticks = 0

    ticks++
    if (ticks <= 10) return

    keybindEvents.forEach(it => it("", Keyboard.KEY_BACK))
})