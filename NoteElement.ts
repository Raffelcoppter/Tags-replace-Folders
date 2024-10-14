import { Scanner } from "Scanner";
import { SyncTemplateMetadataExtension, syncTemplateStructureOnRenameFile } from "SyncTemplateManager";
import { addHoverHighlightTo, createInputField, removeRenamingHighlightFrom, VIEW_TYPE_TAGSCANNER } from "TagScannerView";
import TagsPlus from "main";
import { ItemView, MarkdownView, Menu, Notice, Plugin, TFile, WorkspaceLeaf } from "obsidian";

export class NoteElement {

    container: HTMLElement;
    el: HTMLSpanElement;

    plugin: Plugin;
    file: TFile;

    constructor (plugin: TagsPlus, file: TFile, parent: Scanner | HTMLElement) {
        //Console Metadata
        {
            console.groupCollapsed(`new NoteElement(file: "${file.basename}", \nparent: ...)\n>> TagsPlus: TagScanner-UI`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`parent`)
            console.log(parent)
            console.groupEnd()
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Creating a way to acces a the note: ${file.basename},`,
                `based on the Tag Search of a Scanner`
            )
            console.groupEnd();
        }
        
        //Logic Init
        {
            this.plugin = plugin;
            this.file = file;
        }
        
        //HTML Init
        {
            if(parent instanceof HTMLElement) this.container = parent.createDiv({cls: "noteContainer"});       
            else this.container = parent.childrenNotesEl.createDiv({cls: "noteContainer"});
            this.el = this.container.createSpan({cls: "note"})
            this.el.setText(this.file.basename);
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
                console.groupCollapsed(`Registered Event: "click" on ${this.file.name}`);

                let newLeaf: any;   
                const leaves = this.plugin.app.workspace.getLeavesOfType("markdown");
                console.log(`There are ${leaves.length} Markdown Leaves Open`);
                if(leaves.length > 0) console.log(`Going through each of them and seeing if targeted File is already open.`)
                let alreadyOpen = false;
                leaves.forEach((leaf) => {
                    if(leaf.view instanceof MarkdownView) {
                        if(leaf.view.file && leaf.view.file.path == this.file.path) {
                            console.log(`${this.file.name} is already open!`);
                            console.log(`Set the active Leaf to the Leaf with "${this.file.name}" opend.`)
                            alreadyOpen = true;
                            newLeaf = leaf;
                        }
                    }
                })

                if(!alreadyOpen){
                    console.log(`${file.name} is not open yet, create new tab.`)
                    newLeaf = this.plugin.app.workspace.getLeaf("tab");
                    await newLeaf.openFile(this.file);
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
                    item.setTitle("Rename Note")
                    item.setIcon("pen-line");
                    item.onClick(() => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Rename Note"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Creating an inputField for renamingProcess`);
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Hiding the NoteElement,`,
                                `\nGetting every Metadata for regulation of the name.`,
                                `\nCreating an inputField and wait for user input.`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }
                        this.el.hide();

                        let fileMetadata = plugin.fileMetadataList.get(this.file.path)
                        let syncTemplateMetadata: SyncTemplateMetadataExtension | undefined;
                        if(!fileMetadata) {
                            //Warning Log
                            {
                                console.groupCollapsed(`%cWarning: Couldnt find metadata of "${this.file.basename}"`, `color: red`);
                                console.group(`Fix`)
                                console.log(`Look inside Metadatalist`)
                                console.groupCollapsed(`fileMetadatalist`)
                                console.log(plugin.fileMetadataList)
                                console.groupEnd();
                                console.groupEnd();
                                console.group(`Consequence`)
                                console.log(`No regex restriction possible.`)
                                console.groupEnd();
                                console.groupEnd()
                               
                            }
                        }
                        else syncTemplateMetadata = plugin.syncTemplateMetadataList.get(fileMetadata.syncTemplate.path)
                            
                        const inputField = createInputField(this.container, this.file.basename, syncTemplateMetadata?.nameToRegExConfigMap.get(`notizNameRegExConfig`), false ,async () => {
                            //Console Metadata
                            {
                                console.groupCollapsed(`%cRegistered Event: "Rename Note":`, `color: orange`,`tagValueInputHandler(tagValueInput: "${inputField.value})\n>> TagsPlus: TagScanner-UI`)
                                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                console.trace();
                                console.groupEnd();
                                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                console.groupCollapsed(`Goal`)
                                console.log(`Using the inputValue to rename the Note`); 
                                console.groupEnd();
                                console.groupCollapsed(`Process`);
                                console.log(`Getting the parentPath, and combining it to call for a rename.`
                                );
                                console.groupEnd();
                                console.groupEnd();
                            }
                            const newNoteName = inputField.value;
                            const oldNoteName = file.basename;
                            
                            let parentPath: string = file.path.slice(0, file.path.length - file.name.length)
                            console.log(`parentPath = "${parentPath}"`)
                            
                            this.plugin.app.vault.rename(this.file, `${parentPath}${newNoteName}.md`)
                            .then(() => renamePromiseThenHandler.bind(this)())
                            .catch((reason) => renamePromiseCatchHandler(reason))

                            console.log(`%cWaiting for: rename promise...`, `color: orange`)
                            console.groupEnd();

                            function renamePromiseThenHandler() {
                                //Console Metadata
                                {
                                    console.groupCollapsed(`%cRegistered Event: "Rename Note":`, `color: orange`, `renamePromiseThenHandler()\n>> TagsPlus: TagScanner-UI`)
                                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                    console.trace();
                                    console.groupEnd();
                                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                    console.groupCollapsed(`Goal`)
                                    console.log(`Updating UI`); 
                                    console.groupEnd();
                                    console.groupCollapsed(`Process`);
                                    console.log(``);
                                    console.groupEnd();
                                    console.groupEnd();
                                }

                                inputField.remove();
                                removeRenamingHighlightFrom(this.container)
                                this.el.setText(newNoteName)
                                this.el.show();

                                console.groupEnd();
                            }

                            function renamePromiseCatchHandler(reason: any) {
                                //Console Metadata
                                {
                                    console.groupCollapsed(`%cRegistered Event: "Rename Note":`, `color: orange`, `renamePromiseCatchHandler(reason: ...)\n>> TagsPlus: TagScanner-UI`)
                                    console.groupCollapsed(`...`)
                                    console.groupCollapsed(`reason`)
                                    console.log(reason)
                                    console.groupEnd();
                                    console.groupEnd()
                                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                    console.trace();
                                    console.groupEnd();
                                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                    console.groupCollapsed(`Goal`)
                                    console.log(`Updating UI`); 
                                    console.groupEnd();
                                    console.groupCollapsed(`Process`);
                                    console.log(`Use old Name as text, and give Notice.`);
                                    console.groupEnd();
                                    console.groupEnd();
                                }
                                inputField.remove();
                                removeRenamingHighlightFrom(this.container)
                                this.el.setText(oldNoteName)
                                this.el.show();

                                new Notice(`Rename failed.`)

                                console.groupEnd();
                            }
                        })

                        console.log(`%cWaiting for: inputField.value...`, `color: orange`);
                        console.groupEnd();
                    })
                })
                //Deleting Note
                menu.addItem((item) => {
                    item.setTitle("Delete");
                    item.setIcon("trash-2");
                    item.onClick(() => {

                        this.container.remove();
                        this.plugin.app.vault.delete(this.file);

                    })
                })

                menu.showAtMouseEvent(ev);
            })
            console.groupCollapsed(`Added Eventlistener: "contextmenu"`);
            console.log(`Added Eventlistener: "Rename"`);
            console.log(`Added EventListener: "Delete"`);
            console.groupEnd();
            
            console.groupEnd();
        }
        

        
        console.groupEnd();

    }

    


}