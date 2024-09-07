import { CompressedScanner, Scanner } from "Scanner";

import { ItemView, WorkspaceLeaf, Menu, Notice, MenuItem, TFile, Plugin } from "obsidian"
import * as fs from "fs";

export const VIEW_TYPE_TAGSCANNER = "tagScanner-view"
export const TAGVALUE_FORMAT: RegExp = /^(?:\s*!?\s*[üöäÜÖÄa-zA-z0-9_\-\/]+\s*)(?:&\s*!?\s*[üöäÜÖÄa-zA-z0-9_\-\/]+\s*)*$/

export class TagScannerView extends ItemView {
    
   plugin: Plugin;
   rootScanners: Scanner[] = [];

    constructor(leaf: WorkspaceLeaf, plugin: Plugin) {
        console.groupCollapsed(`new TagScannerView(leaf: ${leaf.getDisplayText()})`);
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.log(``);
        console.groupEnd()
        super(leaf)
        this.plugin = plugin;
        console.groupEnd();
    }

    getViewType(): string {
        return VIEW_TYPE_TAGSCANNER;
    }

    getDisplayText(): string {
        return "Tag Scanner Tab"
    }

    protected async onOpen(): Promise<void> {
        //Console Metadata
        {
            console.groupCollapsed(`onOpen()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Gets called when, the (TagScanner)View Instance is opend.`);
            console.log(`Called from: ${this.getDisplayText()}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Adding the ContextMenu for RootScanners, Notes and Settings.`, 
                `\nLoading the ScannerStructure.`
            )
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Preparing HTML and Css Stuff, that means emptying the content and creating CSS Link.`, 
                `\nAdding EventListener for "contextmenu" and using the obsidian Menu class to create the Context Menu`
            )
            console.groupEnd();
            console.groupEnd();
        }

        const content = this.contentEl
        const linkToCSS = content.createEl("link");
        linkToCSS.rel = "stylesheet";
        linkToCSS.href = "styles.css";

        content.empty();

        // Add an event listener to the container element for the contextmenu event
        content.addEventListener('contextmenu', (event: MouseEvent) => {
            
            const menu = new Menu();
            //Create Root-Scanner
            menu.addItem((item: MenuItem) => {
                item.setTitle("Create Root-Scanner")
                item.setIcon("tag")
                item.onClick(() => {
                    //Console Metadata
                    {
                        console.groupCollapsed(`Registered Event: "Create Root-Scanner"`);
                        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                        console.log(`Registered on: "${this.getDisplayText()}"`);
                        console.trace();
                        console.groupEnd();
                        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                        console.groupCollapsed(`Goal`)
                        console.log(`Creatin a new scanner, with no parent and no children.`);
                        console.groupEnd();
                        console.groupCollapsed(`Process`);
                        console.log(`Creating an empty header, so no functionality. `,
                            `\n  createEmptyHeader()`,
                            `\nGetting the user input.`,
                            `\n  createInputField()`,
                            `\nOnce given call constructor for scanner, with no parent and input as tagName.`,
                            `\nPushing the newly created scanner to the rootscanner array.`,
                            `\nSaving`
                        );
                        console.groupEnd();
                        console.groupEnd();
                    }

                    const container = createEmptyHeader(content);
                    const inputField = createInputField(container, undefined, TAGVALUE_FORMAT, () => {


                        const tagValue = inputField.value;
                        console.log(`User Input: tagValue = ${tagValue}`);
                        container.remove();

                        this.rootScanners.push(new Scanner(this.plugin, content, this.rootScanners.length, tagValue, []));

                        console.groupCollapsed(`Updated root scanners`);
                        this.rootScanners.forEach(({ tagValue: tagName, relPosition}) => console.info({ tagName, relPosition}));
                        console.groupEnd();

                        this.saveScannerStructure();
                    
                        console.groupEnd();

                    })
                        console.log(`Waiting for UserInput (tagName)...`);
                    //this.rootScanners.push(new Scanner(this.plugin, content, this.rootScanners.length));
                })
            })
            
      
            menu.showAtMouseEvent(event);
        })
        console.groupCollapsed(`Added EventListener: "contextmenu"`)
        console.log(`Added EventListener: "Create Root-Scanner"`);
        console.groupEnd();

        this.loadScannerStructure();
        console.groupEnd();
    }

    protected async onClose(): Promise<void> {
        //Console
        {
            console.groupCollapsed(`onClose()`);
            console.groupCollapsed(`Trace`);
            console.log(`Gets called when, the (TagScanner)View Instance is closed.`);
            console.log(`Called from: ${this.getDisplayText()}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`Description`);
            console.groupCollapsed(`Goal`)
            console.log(`Just Saving the Structure`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Calling the saveSannerStructure Function`);
            console.groupEnd();
            console.groupEnd();
        }

        this.saveScannerStructure();

    }

    public saveScannerStructure(): void {
        //Console
        {
            console.groupCollapsed(`saveScannerStructure()`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Mostly Called from a Scanner, when Scanner Structure was changed.`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`);
            console.log(`Saving every Scanner, into "savedScanners.json"`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Using the CompressedScanner Data Type, to save only the Name and children as a nested structure.`, 
                `Then writing it to savedScanner.json using JSON.stringify(...)`);
            console.groupEnd();
            console.groupEnd();
        }

        let json: CompressedScanner[] = [];
        this.rootScanners.forEach((rootScanner) => {
            json.push(rootScanner.toCompressedScanner());
        })
        //Console
        {
            console.groupCollapsed(`Path`);
            console.log(`${(this.app.vault.adapter as any).basePath}\\savedScanners.json`)
            console.groupEnd();
            console.groupCollapsed(`json`)
            console.info(json);
            console.groupEnd();
        }


        fs.writeFileSync(`${(this.app.vault.adapter as any).basePath}\\savedScanners.json`, JSON.stringify(json));
        console.groupEnd();
    }

    private loadScannerStructure(): void {
        {
            console.groupCollapsed(`loadScannerStructure()`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Building the Scanner Structure from "savedScanners.json"`);
            console.groupEnd()
            console.groupCollapsed(`Process`)
            console.log(`Reading "savedScanners.json" and saving it into a CompressScanner Array.`,
                `\nIterating through every compressed Scanner, and creating a new Scanner using the saved Data.`,
                `\nThe children argument, now gets filled with the saved Children,`,
                `\nwich tells the constructor to load these with the same method as here.`
            )
            console.groupEnd()
            console.groupEnd()
        }

        let compressedScanners: CompressedScanner[] = JSON.parse(fs.readFileSync(`${(this.app.vault.adapter as any).basePath}\\savedScanners.json`).toString());

        compressedScanners.forEach((compressedScanner: CompressedScanner, relPosition: number) => {
            this.rootScanners[relPosition] = new Scanner(this.plugin, this.contentEl, relPosition, compressedScanner.tagName, compressedScanner.children, compressedScanner.scannerName);
        })

        console.groupEnd();
    }

    private stringLogicToBool(string: string, boolValues: {[key: string]: boolean}): boolean {
		//Console Metadata
		{
			console.groupCollapsed(`stringLogicToBool(string: ${string}, `,
				`\nboolValues: ${boolValues}`
			);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
			console.trace();
			console.groupEnd();
			console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
			console.groupCollapsed(`Goal`)
			console.log(`When the boolean Values of the Variables that are held in the string are given,`,
				`\nevaluate the outcome of the Logic-String.`
			);
			console.groupEnd();
			console.groupCollapsed(`Process`);
			console.log(`Remove Whitespaces, call inner recursive function: logicEvaluater`);
			console.groupEnd();
			console.groupEnd();
		}

		let cleanString: string = string.replaceAll(" ", "");
		console.log(`clean string = "${cleanString}"`);

		let retBool:boolean = logicEvaluater(cleanString, boolValues);
        console.log(`%creturn boolean = ${retBool}`, `font-style: italic; color: green`);

		console.groupEnd();

		return retBool;

		function logicEvaluater(string: string, boolValues: {[key: string]: boolean}): boolean {
			//Console Metadata
			{
				console.groupCollapsed(`logicEvaluater(string: ${string}, `,
					`\nboolValues: ${boolValues}`
				);
				console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
				console.trace();
				console.groupEnd();
				console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
				console.groupCollapsed(`Goal`)
				console.log(`Evaluate one Logic Operator`);
				console.groupEnd();
				console.groupCollapsed(`Process`);
				console.log(`Determine, wich Operator is to be evaluated, based on the rules of sentential Syntax.`,
					`When Operator is determined, remove from string and return:`,
					`\n  & -> logicEvaluater(left string) && logicEvaluater(right String) `,
					`\n  ! -> !logicEvaluater(shortend string)`,
					`When there is no Operator left, that means it is done, and the use boolValues to return the actual bool value`
				);
				console.groupEnd();
				console.groupEnd();
			}

			if(!string.contains("!") && !string.contains("&")) {
				console.log(`%cString does not contain any logical operator, return bool`, `color: red`)
                const evalBool = boolValues[string];
                console.log(`%cevaluated boolean = ${evalBool}`, `font-style: italic`);

                console.groupEnd();
				return evalBool;
			}
			else {
				if(string.at(0) == "!") {
					console.log(`%cDetected: "!"`, `color: red`)
					let shortendString: string = string.slice(1);
					if(string.at(1) == "(") {
						shortendString = shortendString.slice(1, shortendString.length -1);
					}
					console.log(`shortend string = ${shortendString}`)

                    const evalBool = !logicEvaluater(shortendString, boolValues)
                    console.log(`%cevaluated boolean = ${evalBool}`, `font-style: italic`);

                    console.groupEnd();
					return evalBool;
				}
                else if(string.at(0) == "&" && string.at(1) == "(" && string.at(string.length - 1) == ")" && string.contains(",")) {
                    console.log(`%cDetected: "&"`, `color: red`);
                    let shortendString = string.slice(2, string.length - 1);
                    console.log(`shortendString = ${shortendString}`)

                    let [leftString, rightString] = shortendString.split(",");
                    console.log(`leftString = "${leftString}"`)
                    console.log(`rightString = "${rightString}"`)

                    const evalBool = logicEvaluater(leftString, boolValues) && logicEvaluater(rightString, boolValues);
                    console.log(`%cevaluated boolean = ${evalBool}`, `font-style: italic`);

                    console.groupEnd();
                    return evalBool
                }
                
			}

            console.warn(`%cError`, `color: red`)
            console.groupEnd();
			return true;
		}
	}
    
}



export function createInputField(container: HTMLElement, defaultValue: string = "Unbenannt", restriction: RegExp | undefined, onEnter: (ev: KeyboardEvent) => void): HTMLInputElement {
    //Console Metadata
    {
        console.groupCollapsed(`createInputField(container: ${container.classList},\ndefaultValue: ${defaultValue})`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Creating an input field, that calls "onEnter()" when "Enter" was pressed`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Creating an HTML "input" el, with cls: "inputField" and value: "${defaultValue}"`,
            `Focusing and selecting it, so the user can start typing.`,
            `Adding the Eventlisteners`, 

        );
        console.groupEnd();
        console.groupEnd();
    }

    const inputField = container.createEl("input", {cls: "inputField", value: defaultValue});

    addHoverHighlightTo(inputField);
    addRenamingHighlightTo(container);
    
    inputField.focus();
    inputField.select();
    console.log(`Focused Field and selected Text: "${defaultValue}"`);

    container.addEventListener("contextmenu", (ev) => ev.stopPropagation());
    inputField.addEventListener("keypress", (ev) => {
        if(ev.key == "Enter") {
            if(!restriction) {
                onEnter(ev)
            }
            else {         
                if(restriction.test(inputField.value)) {
                    onEnter(ev);
                    removeRenamingHighlightFrom(container)
                }
                else {
                    new Notice(`"${inputField.value}" is invalid tag value!`)
                }
            }

        }

    });
    console.groupCollapsed(`Added EventListener: "contextmenu"`);
    console.log(`Event Propagation stopped.`);
    console.groupEnd();
    console.groupCollapsed(`Added EventListener: "keypress"`);
    console.log(`When Enter hit, call onEnter() and remove RenamingHighlight`);
    console.groupEnd();

    console.groupEnd();
    return inputField;
}

export function createEmptyHeader(container: HTMLElement): HTMLDivElement {
    //Console Metadata
    {
        console.groupCollapsed(`createEmptyHeader(container: ${container.classList})`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Creating an empty header, as base for an input Field.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Creating a "scannerHeader", a "scannerExpanderForScanners" and an arrow.`);
        console.groupEnd();
        console.groupEnd();
    }

    const headerEl = container.createDiv({cls: "scannerHeader"});
    const expanderForScannerEl = headerEl.createDiv({cls: "scannerExpanderForScanner"});
    expanderForScannerEl.createDiv({cls: "arrow"});

    console.log(`Attatched Header without Note Expander or Functionality to "${container.classList}"`);
    console.groupEnd();
    return headerEl;

}


//Needs to be more precise, can produce error
export function testSubtag(tag: string, supposedSubtag: string): boolean {
    //Console Metadata
    {
        console.groupCollapsed(`testSubtag(tag: "${tag}", supposedSubtag: "${supposedSubtag}")`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Testing if "${supposedSubtag}" is a subtag of "${tag}"`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(``);
        console.groupEnd();
        console.groupEnd();
    }

    let returnBoolean: boolean

    if(supposedSubtag.contains(tag)) returnBoolean = true;
    else returnBoolean = false;
    
    console.groupEnd();
    return returnBoolean;
}

const eventListenerMap = new Map();

export function addHoverHighlightTo(el: HTMLElement) {
    //Console: Metadata
    {
        console.groupCollapsed(`addHoverHighlightTo(${el.classList})`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Indicating with color, when user is hovering over the passed Element.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(``);
        console.groupEnd();
        console.groupEnd();
    }
    

    const highlight = () => el.style.backgroundColor = "#e4e4e4";
    const unhighlight = () => el.style.backgroundColor = "#f6f6f6";
    el.addEventListener("mouseover", highlight);
    el.addEventListener("mouseleave", unhighlight);
    console.log(`Added Eventlistener: "mouseover" on ${el.classList}`);
    console.log(`Added EventListener: "mouseleave" on ${el.classList}`);

    eventListenerMap.set(el, {highlight, unhighlight});
    console.groupEnd();
}

export function removeHighlightFrom(el: HTMLElement) {

    console.log("hallo")
    const listeners = eventListenerMap.get(el);
    console.log(listeners);
    el.removeEventListener("mouseover", listeners.highlight);
    el.removeEventListener("mouseleave", listeners.unhighlight);

    eventListenerMap.delete(el);
}

export function addRenamingHighlightTo(el: HTMLElement) {
    el.style.borderColor = "#7b5bfa";
}

export function removeRenamingHighlightFrom(el: HTMLElement) {
    el.style.borderColor = "#f6f6f6";
}


