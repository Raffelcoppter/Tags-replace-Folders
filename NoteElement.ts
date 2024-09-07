import { Scanner } from "Scanner";
import { TagFolderElement } from "TagElement";
import { addHoverHighlightTo, createInputField, removeRenamingHighlightFrom, VIEW_TYPE_TAGSCANNER } from "TagScannerView";
import { group } from "console";
import { ItemView, MarkdownView, Menu, Plugin, TFile, WorkspaceLeaf } from "obsidian";
import { workerData } from "worker_threads";

export class NoteElement {

    container: HTMLElement;
    el: HTMLSpanElement;

    plugin: Plugin;
    note: TFile;

    constructor (note: TFile, parent: Scanner | HTMLElement, plugin: Plugin) {
        //Console Metadata
        {
            let parentString: string = "";
            if(parent instanceof Scanner) parentString = parent.tagValue;
            else parentString = "No Parent"
            console.groupCollapsed(`new NoteElement(note: "${note.basename}", \nparent: "${parentString}")`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            if(parent instanceof Scanner) console.log(`Called from: ${parent.scannerName}`);
            else console.log(`Created From: Tag Scanner Tab`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Creating a way to acces a the note: ${note.basename},`,
                `based on the Tag Search of a Scanner`
            )
            console.groupEnd();
        }
        
        //Logic Init
        {
            this.plugin = plugin;
            this.note = note;
        }
        
        //HTML Init
        {
            if(parent instanceof HTMLElement) this.container = parent.createDiv({cls: "noteContainer"});       
            else this.container = parent.childrenNotesEl.createDiv({cls: "noteContainer"});
            this.el = this.container.createSpan({cls: "note"})
            this.el.setText(this.note.basename);
        }
        
        //Activating
        {
            //Console Metadata
            {
                console.groupCollapsed(`Activating`);
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.log(`Adding all the EventListeners.`);
                console.groupEnd();
            }

            addHoverHighlightTo(this.el);
            this.el.addEventListener("click", async () => {
                console.groupCollapsed(`Registered Event: "click" on ${this.note.name}`);

                let newLeaf: any;   
                const leaves = this.plugin.app.workspace.getLeavesOfType("markdown");
                console.log(`There are ${leaves.length} Markdown Leaves Open`);
                if(leaves.length > 0) console.log(`Going through each of them and seeing if targeted File is already open.`)
                let alreadyOpen = false;
                leaves.forEach((leaf) => {
                    if(leaf.view instanceof MarkdownView) {
                        if(leaf.view.file && leaf.view.file.path == this.note.path) {
                            console.log(`${this.note.name} is already open!`);
                            console.log(`Set the active Leaf to the Leaf with "${this.note.name}" opend.`)
                            alreadyOpen = true;
                            newLeaf = leaf;
                        }
                    }
                })

                if(!alreadyOpen){
                    console.log(`${note.name} is not open yet, create new tab.`)
                    newLeaf = this.plugin.app.workspace.getLeaf("tab");
                    await newLeaf.openFile(this.note);
                } 
        
                this.plugin.app.workspace.setActiveLeaf(newLeaf);

                console.groupEnd();
            });
            console.log(`Added EventListener: "click"`);

            this.el.addEventListener("contextmenu", (ev) => {

                ev.stopPropagation();
                const menu = new Menu();

                //Renaming Note
                menu.addItem((item) => {
                    item.setTitle("Rename")
                    item.setIcon("pen-line");
                    item.onClick(() => {

                        this.el.hide();
                        const inputField = createInputField(this.container, this.note.basename, undefined, async () => {
                            const noteName = inputField.value;

                            await this.plugin.app.vault.rename(this.note, `${noteName}.md`);

                            inputField.remove();
                            removeRenamingHighlightFrom(this.container);
                            this.el.setText(noteName);
                            this.el.show();

                        })
                    })
                })
                //Deleting Note
                menu.addItem((item) => {
                    item.setTitle("Delete");
                    item.setIcon("trash-2");
                    item.onClick(() => {

                        this.container.remove();
                        this.plugin.app.vault.delete(this.note);

                    })
                })

                menu.showAtMouseEvent(ev);
            })
            console.log(`Added Eventlistener: "contextmenu"`);
            console.log(`Added Eventlistener: "Rename"`);
            console.log(`Added EventListener: "Delete"`);

            
            console.groupEnd();
        }
        

        
        console.groupEnd();

    }

    


}