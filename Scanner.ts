import { NoteElement } from "NoteElement";
import { addHoverHighlightTo, addRenamingHighlightTo, createEmptyHeader, createInputField, removeHighlightFrom, removeRenamingHighlightFrom, TagScannerView, TAGVALUE_FORMAT, testSubtag, VIEW_TYPE_TAGSCANNER } from "TagScannerView";
import { Menu, Notice, Plugin, TFile, TFolder } from "obsidian";

import * as fs from "fs";
import TagsPlus from "main";
import { getSyncTemplate, FileMetadataExtension, SyncTemplateMetadataExtension, combineMaps, applyRelationships, applyNewContentBlocks, contentVariableRegEx, notizNameDefaultRegExp, getProcessedNoteContentFromRawInputs, syncTemplateStructureOnModify } from "SyncTemplateManager";
import { folderNameToHashedFolderName, folderStructureOnModifyFile, getTagsThroughContent, getTagsThroughMetadata, modifyFolderStructure, tagsToFolderName } from "TagFolderManager";
import { createHash } from "crypto";


export class Scanner {

    //Tree Structure
    plugin: TagsPlus;
    parent: Scanner | HTMLElement;
    children: Scanner[] = [];
    childrenNotes: NoteElement[] = [];
    relPosition: number;

    //Name Data
    tagValue: string;   
    scannerName: string; 
    searchTags: string[] = [];  
    negatedSearchTags: string[] = [];

    private ownTags: string[] = [];
    private ownNegatedTags: string[] = [];


    //States
    childrenScannerExpanded: boolean = false;
    childrenNotesExpanded: boolean = false;

    //HTML
    el: HTMLElement;
    headerEl: HTMLDivElement;
    expanderForScannerEl: HTMLDivElement;
    arrow: HTMLDivElement;
    expanderForNotesEl: HTMLSpanElement;
    childrenEl: HTMLDivElement;
    childrenScannerEl: HTMLDivElement;
    childrenNotesEl: HTMLDivElement;



    
    constructor(plugin: TagsPlus, parent: Scanner | HTMLElement, relPosition: number, tagValue: string, children: CompressedScanner[], scannerName?: string) {
        //Console Metadata
        {
            let parentString: string = "";
            if(parent instanceof Scanner) parentString = parent.tagValue;
            else parentString = "No Parent"

            console.groupCollapsed(`new Scanner(parent: ${parentString}, relPosition: ${relPosition},\ntagName: ${tagValue}, children: ..., scannerName?: "${scannerName}")`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`children`)
            console.log(children)
            console.groupEnd()
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            if(parent instanceof Scanner) console.log(`Called From ${parent.scannerName}`);
            else console.log(`Called From: Root(Tag Scanner Tab)`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Creating a functional Scanner.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Registering it into the Tree Structure,`,
                `\nInitializing the HTML Elements inside the Parents dedicated ScannerChildrenContainer`,
                `\nIf any children exist, loading them.`,
                `\nActivating the Scanner.`
            );
            console.groupEnd();
            console.groupEnd();
        }
        
        //Loading Name
        {
            console.groupCollapsed(`Loading Name`)
            this.plugin = plugin;
            this.parent = parent;
            this.relPosition = relPosition;

            if(scannerName) {
                this.scannerName = scannerName;
                this.setName(tagValue, false);
            }
            else this.setName(tagValue, true)

            this.setSearchTags();
            console.groupEnd();
        }
        
        //Loading HTML
        {

            if(parent instanceof HTMLElement) {
                this.el = parent.createDiv();
            }
            else {
                this.el = parent.childrenScannerEl.createDiv();
            }


           //Outer Structure
            this.headerEl = this.el.createDiv({cls: "scannerHeader"});
            this.childrenEl = this.el.createDiv({cls: "scannerChildren"});
            this.childrenNotesEl = this.childrenEl.createDiv({cls: "scannerChildrenNotes"})
            this.childrenScannerEl = this.childrenEl.createDiv({cls: "scannerChildrenScanner"});
            this.childrenScannerEl.hide();
            
            //Header Structure
            this.expanderForScannerEl = this.headerEl.createDiv({cls: "scannerExpanderForScanner"});
            this. arrow = this.expanderForScannerEl.createDiv({cls: "arrow"})
            this.expanderForNotesEl = this.headerEl.createSpan({text: this.scannerName, cls: "scannerExpanderForNotes"}); 
        }
        
        //Loading Children
        {
            //Console Metadata
            {
                console.groupCollapsed(`Loading Children`);
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Registering every to be loaded Child into children Array, and rendering it under childrenScannerEl`);
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Checking if Children need to be loaded, if so go through each compressed Scanner and create Scanner based on it.`);
                console.groupEnd();
                console.groupEnd();
            }
            
            if(children.length > 0) {

                console.log(`Registered ${children.length} children`);
                children.forEach((child, index) => {
                    this.children.push(new Scanner(this.plugin, this, index, child.tagName, child.children, child.scannerName));
                })

            }
            else console.log(`No children to be loaded.`);
            console.groupEnd();
        }
        
        

        //Activating the Scanner
        {
            //Console Metadata
            {
                console.groupCollapsed(`Activating`);
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.log(`Adding all Eventlisteners`);
                console.groupEnd();
            }
            addHoverHighlightTo(this.expanderForScannerEl);
            addHoverHighlightTo(this.expanderForNotesEl);

            this.expanderForScannerEl.addEventListener("click", () => {
                //Console Metadata
                {
                    console.groupCollapsed(`Registered Event: "click"\n>> TagsPlus: TagScanner-UI`);
                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                    console.log(`Registered on: scanner-expander of "${this.scannerName}"`)
                    console.trace();
                    console.groupEnd();
                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                    console.groupCollapsed(`Goal`)
                    console.log(`Toggling the children scanners`);
                    console.groupEnd();
                    console.groupCollapsed(`Process`);
                    console.log(`Check whether to expand or hide,`,
                        `\nCalling either:`,
                        `\n  hideChildrenScanner()`,
                        `\n  expandChildrenScanner()`,
                    );
                    console.groupEnd();
                    console.groupEnd();
                }

                if (this.childrenScannerExpanded) {
                    console.log(`Children Scanners are expanded, hiding them:`)
                    this.hideChildrenScanner();
                }
                else {
                    console.log(`Children Scanners are hidden, expanding them:`)
                    this.expandChildrenScanner();
                } 
        
                console.groupEnd();
            })
            this.expanderForNotesEl.addEventListener("click", () => {
                 //Console Metadata
                {
                    console.groupCollapsed(`Registered Event: "click"\n>> TagsPlus: TagScanner-UI`);
                    console.groupCollapsed(`...`)
                    console.groupCollapsed(`this.searchTags`)
                    console.log(this.searchTags)
                    console.groupEnd()
                    console.groupEnd();
                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                    console.log(`Registered on: note-expander of "${this.scannerName}"`)
                    console.trace();
                    console.groupEnd();
                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                    console.groupCollapsed(`Goal`)
                    console.log(`Toggling the notes with the tags`);
                    console.groupEnd();
                    console.groupCollapsed(`Process`);
                    console.log(`Check whether to close or search,`,
                        `\nCalling either:`,
                        `\n  closeChildrenNotes()`,
                        `\n  searchChildrenNotes()`,
                    );
                    console.groupEnd();
                    console.groupEnd();
                }
                
                if(!this.childrenNotesExpanded) {
                    console.log(`Children Notes are closed, searching for Notes`);

                    this.expanderForNotesEl.style.borderStyle = "solid"
                    let renderNotes: TFile[] = this.searchChildrenNotes();    
                    renderNotes.forEach(renderNote => new NoteElement(this.plugin, renderNote, this));

                    this.childrenNotesExpanded = true;
                    console.groupEnd();
                    //No console groupEnd yet
                }
                else {
                    console.log(`Children Notes are expanded`);
                    this.closeChildrenNotes();
                    this.childrenNotesExpanded = false;
                    console.groupEnd();
                }
            })
            console.log(`Added EventListener: "click" on Expander For Scanner`);
            console.log(`Added EventListener: "click" on Expander For Notes`);

            //Adding the ContextMenu To the Header
            this.headerEl.addEventListener("contextmenu", (ev) => {  

                const menu = new Menu();
                ev.stopPropagation();

                //Create Scanner
                menu.addItem((item) => {
                    item.setTitle("Create Scanner");
                    item.setIcon("tag");
                    item.onClick((ev) => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Create Scanner"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.log(`Registered on: "${this.scannerName}"`)
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Creating a new scanner as a child of ${this.scannerName}`);
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Opening the children, if not already opened.`,
                                `\nGetting the user input with an Input Field`,
                                `\ncall the tagValueInputHandler.`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }
                         
                        
                        if(!this.childrenScannerExpanded) this.expandChildrenScanner();

                        const container = createEmptyHeader(this.childrenScannerEl);
                        const inputField = createInputField(container, undefined, TAGVALUE_FORMAT, true, () => {
                            //Console Metadata
                            {
                                console.groupCollapsed(`%cRegistered Event: "Create Scanner":`, `color: orange`,`tagValueInputHandler(tagValueInput: "${inputField.value})\n>> TagsPlus: TagScanner-UI`)
                                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                console.trace();
                                console.groupEnd();
                                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                console.groupCollapsed(`Goal`)
                                console.log(`Using the inputValue to create a new Scanner`); 
                                console.groupEnd();
                                console.groupCollapsed(`Process`);
                                console.log(`Removing the container of the InputField, so the Scanner has room.`,
                                    `\nCalling the constructor and registering the new Scanner as a child.`,
                                    `\nThen call saveScannerStructure`
                                );
                                console.groupEnd();
                                console.groupEnd();
                            }
                            
                            container.remove();

                            this.children.push(new Scanner(this.plugin, this, this.children.length, inputField.value, []));
                            this.accessTagScannerView(view => view.saveScannerStructure())

                            console.groupEnd();
                        })

                        console.log(`%cWaiting for: inputField.value...`, `color: orange`);
                        console.groupEnd();
                    })
                })
                
                //Create Note with Tags
                menu.addItem((item) => {
                    item.setTitle("Create Note");
                    item.setIcon("file");
                    item.onClick(async () => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Create Note"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`...`)
                            console.groupCollapsed(`this.searchTags`)
                            this.searchTags.forEach((value, index) => console.log(`${index}: "${value}"`))
                            console.groupEnd();
                            console.groupEnd()
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.log(`Registered on: "${this.scannerName}"`)
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Creating a new Note with tags and the associated Template:`, 
                            );
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Searching for Notes, if not already open.`,
                                `\nGetting the user input with an Input Field`,
                                `\nonce given, search for a Template that has a subset of:`,
                                `\n["${this.searchTags.join(`", "`)}"]`,
                                `\nCreate a Note based of that Template`,
                                `\nCreate Note Element with the markdown file as note-link.`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }

                        if(!this.childrenNotesExpanded){
                            this.childrenNotesExpanded = true;
                            this.searchChildrenNotes(); 
                        } 

                        //Preparation
                        let syncTemplate: TFile | null;
                        let syncTemplateMetadata: SyncTemplateMetadataExtension | undefined 
                        {
                            console.groupCollapsed(`Preparation`)
                            syncTemplate = getSyncTemplate(this.plugin, this.searchTags);
                            if(!syncTemplate) {
                                //Warning Log
                                {
                                    console.groupCollapsed(`%cWarning: syncTemplate not found, for details look inside the log of getSyncTemplate`, `color: red`);
                                    console.group(`Fix`)
                                    console.log()
                                    console.groupEnd();
                                    console.group(`Consequence`)
                                    console.log()
                                    console.groupEnd();
                                    console.groupEnd()
                                    console.groupEnd();
                                    console.warn(`Error in: "Registered Event: "Create Note"\n>> TagsPlus: TagScanner-UI"`)
                                }
                                return
                            }
    
                            syncTemplateMetadata = plugin.syncTemplateMetadataList.get(syncTemplate.path)
                            if(!syncTemplateMetadata) {
                                //Warning Log
                                {
                                    console.groupCollapsed(`%cWarning: couldnt retrieve Metadata from List for "${syncTemplate.basename}"`, `color: red`);
                                    console.group(`Fix`)
                                    console.log()
                                    console.groupEnd();
                                    console.group(`Consequence`)
                                    console.log()
                                    console.groupEnd();
                                    console.groupEnd()
                                    console.groupEnd();
                                    console.warn(`Error in: "Registered Event: "Create Note"\n>> TagsPlus: TagScanner-UI"`)
                                }
                                return
                            }

                            console.log(`%cNo errors`, `color: green`)
                            console.groupEnd()
                        }


                        //Matching boundTagsFromSyncTemplate to searchTags
                        let freieKategorien: string[] = []; 
                        let gebundeneKategorien: Map<string, string> = new Map()
                        let boundSearchTags: string[] = [];
                        {
                            console.groupCollapsed(`Matching boundTagsFromSyncTemplate to searchTags`)

                            //Getting gebundeKategorien
                            {
                                console.groupCollapsed(`Getting gebundene Kategorien`)

                                let blackList: string[] = [];
                                syncTemplateMetadata.nameToTagBoundConfigMap.forEach((value, key) => {  //Value beeing the start of the tag
                                    console.groupCollapsed(`${key} => ${value}`)
                                    
                                    let fittingTag: string | null = null;
                                    console.groupCollapsed(`Cycling through this.searchTag`)
                                    this.searchTags.forEach(searchTag => {
                                        console.groupCollapsed(`freieKategorie = "${searchTag}"`)
                                        if(blackList.contains(searchTag)) {
                                            console.log(`%c"${searchTag}" is already bound to another tag.`, `color: orange`)
                                        }
                                        else {
                                            if(`#${searchTag}`.contains(value)) {
                                                console.log(`%c${searchTag} is bound to "${key}"`, `color: green`)
                                                gebundeneKategorien.set(key, `#${searchTag}`)
                                                boundSearchTags.push(`${searchTag}`)
                                                fittingTag = searchTag;
                                                blackList.push(searchTag)
    
                                                console.groupEnd();
                                                return;
                                            }
                                            else {
                                                console.log(`%ctag did not match the value of the map`, `color: red`)
                                            }
                                        }

                                        console.groupEnd();
                                    })
                                    console.groupEnd()
    
                                    if(fittingTag) {
                                        console.log(`%cA Tag was found for the bound Kategorie`, `color: green`)
                                        console.log(`${key} => "${fittingTag}"`)
                                    }
                                    else {
                                        console.log(`%cNo Tag found for boundTag`, `color: red`)
                                    }
    
                                    console.groupEnd();
                                })
                                console.groupEnd();
                            }
                            

                            //Getting freieKategorien
                            {
                                console.groupCollapsed(`Getting freieKategorien`)
                                this.searchTags.forEach(searchTag => {
                                    if(boundSearchTags.contains(searchTag)) {
                                        console.log(`%c"${searchTag}" is bound`, `color: red`)
                                    }
                                    else {
                                        console.log(`%c"${searchTag}" is free`, `color: green`)
                                        freieKategorien.push(searchTag);
                                    }
                                })
                                console.groupEnd()
                            }

                            console.groupEnd();
                        }


                        console.groupCollapsed(`freieKategorien`)
                        freieKategorien.forEach((value, index) => console.log(`${index}: "${value}`))
                        console.groupEnd()
                        console.groupCollapsed(`gebundeneKategorien`)
                        console.log(gebundeneKategorien)
                        console.groupEnd()

                        /*Sorting scanner searchTags
                        let syncTemplateTags: string[] = syncTemplate.basename.replaceAll(`§`, `/`).split(`_`);
                        let freieKategorien: string[] = [];
                        let gebundeneKategorien: Map<string, string> = new Map();
                        {
                            console.groupCollapsed(`Sorting scanner searchTags`)

                            let relevantTemplateTags = syncTemplateTags;
                            console.groupCollapsed(`relevantTemplateTags`)
                            relevantTemplateTags.forEach((value, index) => console.log(`${index}: "${value}"`));
                            console.groupEnd();

                            console.groupCollapsed(`Sorting Process`)
                            this.searchTags.forEach(searchTag => {
                                console.groupCollapsed(`searchTag = "${searchTag}"`);
                                let istFreieKategorie = true;
                                relevantTemplateTags.forEach(templateTag => {
                                    if(searchTag.contains(templateTag)) {
                                        console.log(`%c"${searchTag}" is an extension of "${templateTag}"`, `color: blue`)
                                        gebundeneKategorien.set(templateTag, searchTag);
                                        relevantTemplateTags.remove(templateTag)
                                        istFreieKategorie = false;
                                        return;
                                    }
                                    else {
                                        console.log(`${searchTag}" is not an extension of "${templateTag}"`)
                                    }
                                })

                                if(istFreieKategorie) {
                                    console.log(`Not an extension of any template tag => freie Kategorie`)
                                    freieKategorien.push(searchTag);
                                }
                                else {
                                    console.log(`Is an extension, should already be set as a value in gebundeKategorien Map`)
                                    console.groupCollapsed(`current gebundenKategorien`)
                                    gebundeneKategorien.forEach((value, key) => console.log(`"${key}" => "${value}"`))
                                    console.groupEnd();
                                }
                                console.groupEnd()
                            })
                            console.groupEnd();

                            console.groupCollapsed(`gebundeneKategorien`)
                            gebundeneKategorien.forEach((value, key) => console.log(`"${key}" => "${value}"`))
                            console.groupEnd();

                            console.groupCollapsed(`freieKategorien`)
                            freieKategorien.forEach((value, index) => console.log(`${index}: "${value}"`));
                            console.groupEnd();

                            console.groupEnd();
                        }
                        */
                        //Getting freieKategorienString


                        let freieKategorienString: string = "";
                        {
                            console.groupCollapsed(`Getting freieKategorienString`)
                            if(freieKategorien.length > 0) freieKategorienString = `    - #${freieKategorien.join(`\n    - #`)}`
                            console.groupEnd()
                        }
                        console.groupCollapsed(`freieKategorienString`)
                        console.log(freieKategorienString)
                        console.groupEnd();

                        
                        
                        /*
                        let syncTemplateNoteContent: string = syncTemplateMetadata.noteContentForCreation;
                        console.groupCollapsed(`syncTemplateNoteContent`)
                        console.log(syncTemplateNoteContent)
                        console.groupEnd();

                        //Updating each contentVariable in the noteContent
                        let processedNoteContent = syncTemplateNoteContent;
                        {
                            console.groupCollapsed(`Updating each contentVariable in the noteContent`)

                            
                            syncTemplateMetadata.contentVariables.forEach(contentVariable => {
                                console.groupCollapsed(`contentVariable = "${contentVariable}"`)

                                if(contentVariable == "notizName") {
                                    console.log(`notizName gets handled once input is given`)
                                }
                                else if(contentVariable == "freieKategorien") {
                                    processedNoteContent = processedNoteContent.replaceAll(`((freieKategorien))`, freieKategorienString)
                                }
                                else {
                                    let replacerTagString = gebundeneKategorien.get(contentVariable)
                                    let replacerDefaultString = syncTemplateMetadata.nameToDefaultConfigMap.get(contentVariable)
                                    if(replacerTagString) {
                                        console.log(`a tag was bound to this content variable`)
                                        console.log(`tag = "${replacerTagString}"`)
                                        processedNoteContent = processedNoteContent.replaceAll(`<{${contentVariable}}>`, `#${replacerTagString}`)
                                    }
                                    else if(replacerDefaultString) {
                                        console.log(`a default value was set to this content variable`)
                                        console.log(`default = "${replacerDefaultString}"`)
                                        processedNoteContent = processedNoteContent.replaceAll(`<{${contentVariable}}>`, `${replacerDefaultString}`)
                                    }
                                    else {
                                        console.log(`no special handling, just set empty`)
                                        processedNoteContent = processedNoteContent.replaceAll(`<{${contentVariable}}>`, "")
                                    }
                                }

                                console.groupEnd();
                            })

                            console.groupEnd();
                        }

                        console.groupCollapsed(`processedNoteContent`)
                        console.log(processedNoteContent)
                        console.groupEnd();
                        */

                        const container = this.childrenNotesEl.createDiv({cls: "noteContainer"});
                        const innerContainer = container.createSpan({cls: "note"});
                        const inputField = createInputField(container, syncTemplateMetadata.notizNameDefault , syncTemplateMetadata.nameToRegExConfigMap.get("notizNameRegExConfig") ?? notizNameDefaultRegExp, syncTemplateMetadata.selectNotizNameDefault, async () => {
                            const title = inputField.value;  
                            container.remove();

                            
                            let fromValToContentMap: Map<string, string> = new Map()
                            fromValToContentMap.set(`notizName`, title)
                            fromValToContentMap.set(`freieKategorien`, freieKategorienString)
                            fromValToContentMap = combineMaps(fromValToContentMap, gebundeneKategorien);
                            console.groupCollapsed(`fromValToContentMap`)
                            console.log(fromValToContentMap)
                            console.groupEnd();
                            
                            let processedNoteContent = getProcessedNoteContentFromRawInputs(plugin, fromValToContentMap, syncTemplateMetadata)
                            console.groupCollapsed(`%processedNoteContent`, `color: blue`)    
                            console.log(processedNoteContent)
                            console.groupEnd();

                            //Getting filePath
                            let filePath: string;
                            {
                                console.groupCollapsed(`Getting filePath`)

                                let fileTags = getTagsThroughContent(processedNoteContent)
                                let tagFolderName = tagsToFolderName(fileTags)
                                let hashedTagFolderName = folderNameToHashedFolderName(plugin, tagFolderName)

                                filePath = `${hashedTagFolderName}/${title}`
                                console.groupEnd()
                            }
                            console.log(`%cfilePath = "${filePath}"`, `color: blue`)

                            plugin.ignoreNextCreate = true;
                            const file = await this.plugin.app.vault.create(`${title}.md`, processedNoteContent);
                            folderStructureOnModifyFile(plugin, file, `${filePath}.md`)
                            plugin.fileMetadataList.set(`${filePath}.md`, new FileMetadataExtension(plugin, processedNoteContent, syncTemplate, title));

                            new NoteElement(this.plugin, file, this);


                            console.groupEnd();
                            console.groupEnd();

                        })
                        console.log(`%cWaiting for User Input...`, `color: orange`)
                    
                        
                    })
                })

                menu.addItem((item) => {
                    item.setTitle(`Test`)
                    item.setIcon("test")
                    item.onClick(() => {
                        console.groupCollapsed(`%cTEST EVENT`, `color: purple`)
                        
                        const container = this.childrenNotesEl.createDiv({cls: "noteContainer"});
                        const innerContainer = container.createSpan({cls: "note"});
                        const inputField = createInputField(container, undefined, undefined, true, async () => {
                            const title = inputField.value;  
                            container.remove();

                            let hash = createHash("MD5").update(title).digest("hex")
                            new Notice(hash)
                            console.groupEnd();
                            console.groupEnd();

                        })
                    })
                })

                menu.addSeparator();

                //Renaming Scanner
                menu.addItem((item) => {
                    item.setTitle("Rename Scanner");
                    item.setIcon("pen-line");
                    item.onClick(() => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Rename Scanner"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.log(`Registered on: Scanner "${this.scannerName}"`)
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Rename scanner "${this.scannerName}", without changing anything else`);
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Hiding note expander.`,
                                `\nGetting the user input with an Input Field`,
                                `\nonce given, scanner Name to input`,
                                `\nShow expander for notes again.`,
                                `\nSaving.`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }

                        addRenamingHighlightTo(this.headerEl);
                        this.expanderForNotesEl.hide();
                        const inputField = createInputField(this.headerEl, this.scannerName, undefined, true,() => {
                            
                            this.scannerName = inputField.value
                            
                            inputField.remove();
                            removeRenamingHighlightFrom(this.headerEl);
                            this.expanderForNotesEl.setText(this.scannerName);
                            this.expanderForNotesEl.show();

                            this.accessTagScannerView(view => view.saveScannerStructure())
                        
                            console.groupEnd();
                        })

                    })
                })

                menu.addItem((item) => {
                    item.setTitle("Change search value");
                    item.setIcon("search")
                    item.onClick(() => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Change search value"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.log(`Registered on: Scanner "${this.scannerName}"`)
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Changing what the scanner searches for and updating everything accordingly`);
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Hiding note expander.`,
                                `\nGetting the user input with an Input Field`,
                                `\nonce given, update tagValue and searchTags`,
                                `\nShow expander for notes again.`,
                                `\nSaving.`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }

                        this.expanderForNotesEl.hide();
                        const inputField = createInputField(this.headerEl, this.tagValue, TAGVALUE_FORMAT, true, () => {
                            

                            this.setName(inputField.value, true);
                            this.updateSearchTags();
                            
                            inputField.remove(); 
                            this.expanderForNotesEl.setText(this.scannerName);
                            this.expanderForNotesEl.show();

                            

                            this.accessTagScannerView(view => view.saveScannerStructure())
                        
                            console.groupEnd();
                        })
                        console.log(`Waiting for: User Input(new tag value)...`)
                       
                    })
                })

                //Deleting Scanner
                menu.addItem((item) => {
                    item.setTitle("Delete");
                    item.setIcon("trash-2")
                    item.onClick(() => {
                        //Console Metadata
                        {
                            console.groupCollapsed(`Registered Event: "Delete"\n>> TagsPlus: TagScanner-UI`);
                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                            console.log(`Registered on: Scanner "${this.scannerName}"`)
                            console.trace();
                            console.groupEnd();
                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                            console.groupCollapsed(`Goal`)
                            console.log(`Delete scanner "${this.scannerName}" itself and from parent.`);
                            console.groupEnd();
                            console.groupCollapsed(`Process`);
                            console.log(`Removing HTML Element.`,
                                `\nRemoving "${this.scannerName}" from parent.`,
                                `\nUpdating every relPosition of sibling scanners.`,
                                `\nShow expander for notes again.`,
                                `\nSaving`
                            );
                            console.groupEnd();
                            console.groupEnd();
                        }

                        this.el.remove();
                    
                        if(this.parent instanceof Scanner) {
                            this.parent.children.remove(this)
                            console.groupCollapsed(`new children-array of parent after removal`)
                            this.parent.children.forEach(({ tagValue: tagName, relPosition}) => console.info({ tagName, relPosition }))
                            console.groupEnd();

                            this.parent.children.forEach((child, index) => child.relPosition = index);
                            console.groupCollapsed(`Check for relative Positions`)
                            this.parent.children.forEach(({ tagValue: tagName, relPosition}) => console.info({ tagName, relPosition }))
                            console.groupEnd();
                        }
                        else {
                            this.accessTagScannerView(view => {
                                view.rootScanners.remove(this);
                                console.groupCollapsed(`new rootscanner-array after removal`)
                                view.rootScanners.forEach(({ tagValue: tagName, relPosition}) => console.info({ tagName, relPosition }))
                                console.groupEnd();

                                view.rootScanners.forEach((rootScanner, index) => rootScanner.relPosition = index);
                                console.groupCollapsed(`Check for relative Positions`)
                                view.rootScanners.forEach(({ tagValue: tagName, relPosition}) => console.info({ tagName, relPosition }))
                                console.groupEnd();
                            })                           
                        }



                        this.accessTagScannerView(view => view.saveScannerStructure())
                        console.groupEnd();
                    })
                })
                //Moving Up
                {
                    //Checking if Moving up is an option
                    if(this.relPosition > 0 && this.parent.children.length > 1) {
                        //Moving Scanner Up
                        menu.addItem((item) => {
                            item.setTitle("Move up");
                            item.setIcon("move-up");
                            item.onClick(() => {
                                //Console Metadata
                                {
                                    console.groupCollapsed(`Registered Event: "Move up"`);
                                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                    console.log(`Registered on: Scanner "${this.scannerName}"`)
                                    console.trace();
                                    console.groupEnd();
                                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                    console.groupCollapsed(`Goal`)
                                    console.log(`Swapping ${this.scannerName} with the scanner above it.`);
                                    console.groupEnd();
                                    console.groupCollapsed(`Process`);
                                    console.log(`Calling move("up").`);
                                    console.groupEnd();
                                    console.groupEnd();
                                }
    
                                this.move("up")
    
                                console.groupEnd();
                            })
                        })
                    }
                }
                
                //Moving Down
                {
                    let lastRelPos: number = 0;
                    if(this.parent instanceof Scanner) lastRelPos = this.parent.children.length - 1;
                    else {
                        this.plugin.app.workspace.getLeavesOfType(VIEW_TYPE_TAGSCANNER).forEach((leaf) => {
                            if(leaf.view instanceof TagScannerView) lastRelPos = leaf.view.rootScanners.length - 1;
                        })
                    }
                    if(this.relPosition < lastRelPos) {
                        menu.addItem((item) => {
                            item.setTitle("Move down");
                            item.setIcon("move-down");
                            item.onClick(() => {
                                //Console Metadata
                                {
                                    console.groupCollapsed(`Registered Event: "Move down"`);
                                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                    console.log(`Registered on: Scanner "${this.scannerName}"`)
                                    console.trace();
                                    console.groupEnd();
                                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                    console.groupCollapsed(`Goal`)
                                    console.log(`Swapping ${this.scannerName} with the scanner below it.`);
                                    console.groupEnd();
                                    console.groupCollapsed(`Process`);
                                    console.log(`Calling move("down").`);
                                    console.groupEnd();
                                    console.groupEnd();
                                }
    
                                this.move("down")
    
                                console.groupEnd();
                            })
                        })
                    }
                }

                menu.addSeparator();
                //Rename Tag
                {
                    if(this.ownTags.length == 1 && this.negatedSearchTags.length == 0) {
                        menu.addItem((item) => {
                            item.setTitle("Rename Tag")
                            item.setIcon("pen-line")
                            item.onClick(() => {
                                //Console Metadata
                                {
                                    console.groupCollapsed(`Registered Event: "Rename Tag"\n>> TagsPlus: TagScanner-UI`);
                                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                    console.log(`Registered on: Scanner "${this.scannerName}"`)
                                    console.trace();
                                    console.groupEnd();
                                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                    console.groupCollapsed(`Goal`)
                                    console.log(`Change the Tag of every File from the old Tag to the new Tag.`);
                                    console.groupEnd();
                                    console.groupCollapsed(`Process`);
                                    console.log(`Hiding note expander.`,
                                        `\nGetting the user input with an Input Field`,
                                    );
                                    console.groupEnd();
                                    console.groupEnd();
                                }

                                console.groupCollapsed(`Getting relevantFiles`)
                                let relevantFiles: TFile[] = plugin.app.vault.getMarkdownFiles().filter((file) => {
                                    console.groupCollapsed(`file.basename = "${file.basename}"`)
                                    const fileTags = getTagsThroughMetadata(plugin, file)
                                    console.groupCollapsed(`fileTags`)
                                    fileTags.forEach((value, index) => console.log(`${index}: "${value}"`))
                                    console.groupEnd();

                                    let fileContainsSubtagOfScannerTag = false;
                                    console.groupCollapsed(`getting fileContainsSubtagOfScannerTag`)
                                    fileTags.forEach(fileTag => {
                                        console.groupCollapsed(`fileTag = "${fileTag}`)
                                        if(fileTag.contains(this.ownTags[0])) {
                                            console.log(`%cfound subtag of "${this.ownTags[0]}`, `color: green`)
                                            fileContainsSubtagOfScannerTag = true;
                                            console.groupEnd();
                                            return;
                                        }
                                        else {
                                            console.log(`Not a subtag of "${this.ownTags[0]}"`)
                                        }

                                        console.groupEnd();
                                    })
                                    console.groupEnd()
                                    console.log(`%fileContainsSubtagOfScannerTag = ${fileContainsSubtagOfScannerTag}`, `color: blue`)

                                    console.groupEnd()
                                    return fileContainsSubtagOfScannerTag;
                                })
                                console.groupEnd();
                                console.groupCollapsed(`relevantFiles`)
                                relevantFiles.forEach((value, index) => console.log(`${index}: "${value.basename}"`))
                                console.groupEnd();

                                if(relevantFiles.length == 0) {
                                    new Notice(`No files contain the Tag: "${this.ownTags[0]}!`)
                                    console.groupEnd()
                                    return
                                }

                                this.expanderForNotesEl.hide();
                                const inputField = createInputField(this.headerEl, this.tagValue, TAGVALUE_FORMAT, true, () => {
                                    //Console Metadata
                                    {
                                        console.groupCollapsed(`%cRegistered Event: "Rename Tag":`, `color: orange`,`newTagNameInputHandler(newTagName: "${inputField.value})\n>> TagsPlus: TagScanner-UI`)
                                        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                        console.trace();
                                        console.groupEnd();
                                        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                        console.groupCollapsed(`Goal`)
                                        console.log(`Using the inputValue to rename every relevant Note`); 
                                        console.groupEnd();
                                        console.groupCollapsed(`Process`);
                                        console.log(`Removing the container of the InputField, so the Scanner has room.`,+
                                            `\nUpdate Name values and searchTags of Scanner.`,
                                            `\nShow noteExpander with the updated text and read contents of notes.`
                                        );
                                        console.groupEnd();
                                        console.groupEnd();
                                    }
                            
                                    const newTagName: string = inputField.value;
                                    const oldTagName: string = this.ownTags[0];
                                    
                                    this.setName(newTagName, true);
                                    this.updateSearchTags();
                                    
                                    inputField.remove(); 
                                    this.expanderForNotesEl.setText(this.scannerName);
                                    this.expanderForNotesEl.show();
                                    this.accessTagScannerView(view => view.saveScannerStructure())

                                    let contentPromises: Promise<string>[] = [];
                                    relevantFiles.forEach(relevantFile => contentPromises.push(plugin.app.vault.read(relevantFile)))
                                    Promise.allSettled(contentPromises).then(settledContentPromises => contentPromisesHandler.bind(this)(settledContentPromises))
    
                                    console.log(`%cWaiting for: contentPromises...`, `color: orange`)

                                    console.groupEnd();

                                    function contentPromisesHandler(settledContentPromises: PromiseSettledResult<string>[]) {
                                        //Console Metadata
                                        {
                                            console.groupCollapsed(`%cRegistered Event: "Rename Tag"`, `color: orange`, `contentPromisesHandler(settledContentPromises:...)\n>> TagsPlus: TagScanner-UI`)
                                            console.groupCollapsed(`...`)
                                            console.groupCollapsed(`settledContentPromises`)
                                            console.log(settledContentPromises)
                                            console.groupEnd()
                                            console.groupEnd();
                                            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                            console.trace();
                                            console.groupEnd();
                                            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                            console.groupCollapsed(`Goal`)
                                            console.log(`Using the contents and the newTagName to replace the oldTags with the new and ask for modify.`); 
                                            console.groupEnd();
                                            console.groupCollapsed(`Process`);
                                            console.log(``);
                                            console.groupEnd();
                                            console.groupEnd();
                                        }
                                        
                                        let fileToSettledContentPromiseMap: Map<TFile, PromiseSettledResult<string>> = new Map()
                                        settledContentPromises.forEach((settledContentPromise, index) => fileToSettledContentPromiseMap.set(relevantFiles[index], settledContentPromise))
                                        console.groupCollapsed(`fileToSettledContentPromiseMap`)
                                        console.log(fileToSettledContentPromiseMap)
                                        console.groupEnd()

                                        //Getting fileToContentMap
                                        let fileToContentMap: Map<TFile, string> = new Map()    
                                        fileToSettledContentPromiseMap.forEach((value, key) => {
                                            if(value.status == "fulfilled") fileToContentMap.set(key, value.value)
                                        })
                                        console.groupCollapsed(`fileToContentMap`)
                                        console.log(fileToContentMap)
                                        console.groupEnd()
                                        
                                        //Getting fileToUpdatedContentMap
                                        let fileToUpdatedContentMap: Map<TFile, string> = new Map()
                                        console.groupCollapsed(`Getting fileToUpdatedContentMap`)
                                        fileToContentMap.forEach((value, key) => {
                                            console.groupCollapsed(`key: "${key.basename}" => value:...`)
                                            console.groupCollapsed(`...`)
                                            console.log(value)
                                            console.groupEnd();
                                            
                                            let triggerForFrontmatter: RegExp = new RegExp(`  - ${oldTagName}`,"g")
                                            let triggerForInline: RegExp = new RegExp(`#${oldTagName}`, "g")
                                            console.log(`triggerForFrontmatter = ${triggerForFrontmatter}`)
                                            console.log(`triggerForInline = ${triggerForInline}`)
                                            let updatedContent = value.replaceAll(triggerForFrontmatter, `  - ${newTagName}`)
                                            console.groupCollapsed(`updatedContent after triggerForFrontmatter`)
                                            console.log(updatedContent)
                                            console.groupEnd();
                                            updatedContent = updatedContent.replaceAll(triggerForInline, `#${newTagName}`)

                                            console.groupCollapsed(`%cupdatedContent`, `color:blue`)
                                            console.log(updatedContent)
                                            console.groupEnd();

                                            fileToUpdatedContentMap.set(key, updatedContent)

                                            console.groupEnd()
                                        })
                                        console.groupEnd();
                                        console.groupCollapsed(`fileToUpdatedContentMap`)
                                        console.log(fileToUpdatedContentMap)
                                        console.groupEnd()


                                        plugin.ignoreAllModifies = true;
                                        let modifyPromises: Promise<void>[] = [];
                                        let pendingRenames: Map<TFile, string> = new Map();
                                        console.groupCollapsed(`Updating `)
                                        fileToUpdatedContentMap.forEach((value, key) => {
                                            let pendingUpdates = syncTemplateStructureOnModify(plugin, key, value)
                                            /*
                                            
                                            */
                                            if(pendingUpdates[0]) modifyPromises.push(pendingUpdates[0])
                                            else {
                                                modifyPromises.push(plugin.app.vault.modify(key, value))
                                            }

                                            if(pendingUpdates[1]) {
                                                pendingRenames.set(pendingUpdates[1][0], pendingUpdates[1][1])
                                            }
                                        })
                                        console.groupEnd();

                                        Promise.allSettled(modifyPromises).then(settledModifyPromises => modifyPromisesHandler(settledModifyPromises))
                                        console.log(`%cWaiting for: modifyPromises...`, `color: orange`)

                                        modifyFolderStructure(plugin, pendingRenames)

                                        console.groupEnd();

                                        function modifyPromisesHandler(settledModifyPromises: PromiseSettledResult<void>[]) {
                                            //Console Metadata
                                            {
                                                console.groupCollapsed(`%cRegistered Event: "Rename Tag"`, `color: orange`, `modifyPromisesHandler(settledModifyPromises:...)\n>> TagsPlus: TagScanner-UI`)
                                                console.groupCollapsed(`...`)
                                                console.groupCollapsed(`settledModifyPromises`)
                                                console.log(settledModifyPromises)
                                                console.groupEnd()
                                                console.groupEnd();
                                                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                                                console.log(`Promise from: `)
                                                console.trace();
                                                console.groupEnd();
                                                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                                                console.groupCollapsed(`Goal`)
                                                console.log(``); 
                                                console.groupEnd();
                                                console.groupCollapsed(`Process`);
                                                console.log(``);
                                                console.groupEnd();
                                                console.groupEnd();
                                            }

                                            plugin.ignoreAllModifies = false;

                                            console.groupEnd();
                                        }

                                    }
                                })
                                console.log(`%cWaiting for: User Input(newTagName)...`, `color: orange`)

                                console.groupEnd();
                            })
                        })
                    }
                }

                menu.showAtMouseEvent(ev);

            })

            console.groupCollapsed(`Added EventLister: "contextmenu" on Scanner`);
            console.log(`Added EventListener: "Create Scanner"`);
            console.log(`Added EventListener: "Create Note"`);
            console.log(`Added Seperator`);
            console.log(`Added EventListener: "Rename"`);
            console.log(`Added EventListener: "Delete"`);
            console.log(`Added EventListener: "Move Up"`)
            console.log(`Added EventListener: "Move Down"`);
            console.groupEnd();

            console.groupEnd();

        }
        
        console.groupEnd(); //Ending the enter Constructor group
    }




    private expandChildrenScanner(): void {
        //Console Metadata
        {
            console.groupCollapsed(`expandChildrenScanner()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Exapanding the children Scanners and visually indicating, that its expanded.`);
            console.groupEnd();
        }
        
        this.arrow.addClass("Rotated")
        this.childrenEl.style.borderLeftStyle = "solid";
        console.log(`Rotated Arrow and made line under arrow`);

        this.childrenScannerEl.show();
        this.childrenScannerExpanded = true;
        console.log(`Made Children Scanner Container visible`);

        console.groupEnd();
    }

    private hideChildrenScanner(): void {
          //Console Metadata
          {
            console.groupCollapsed(`hideChildrenScanner()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Hiding the children Scanners and changing Styling back.`);
            console.groupEnd();
        }

        this.arrow.removeClass("Rotated");
        this.childrenEl.style.borderLeftStyle = "hidden";
        console.log(`Rotated Arrow back, and hidden Line.`);

        this.childrenScannerEl.hide();
        this.childrenScannerExpanded = false;
        console.log("Hiddene children Container");

        console.groupEnd();
    }

    private searchChildrenNotes(): TFile[] {
        //Console Metadata
        {
            console.groupCollapsed(`searchChildrenNotes()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Finding all Notes that has the tags and does not have the excluded tags Scanner up to this ${this.scannerName}`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Use the (negated)SearchTag attribute of the scanner, to thin out the files step by step,`,
                `\nthat do not have the requirements.`
            );
            console.groupEnd();
            console.groupEnd();
            console.time(`searchChildrenNotes()`)
        }

        let relevantFiles: TFile[] = this.plugin.app.vault.getMarkdownFiles().filter((file) => !file.path.contains(`Plugin Ordner`));
        let fileTagMap: Map<string, string[]> = new Map();
        console.groupCollapsed(`Creating fileTagMap`)
        relevantFiles.forEach(relevantFile => fileTagMap.set(relevantFile.path, getTagsThroughMetadata(this.plugin, relevantFile)));
        console.groupEnd();

        console.groupCollapsed(`Getting relevantFiles`)
        
        //Testing Notes For: searchTags
        {
            console.groupCollapsed(`Testing Notes For: searchTags`);
            this.searchTags.forEach(searchTag => {
                console.groupCollapsed(`Testing Notes For: searchTag = "${searchTag}"`)
    
                let irrelevantFiles: TFile[] = []   //Notes that dont have the searchTag
    
                relevantFiles.forEach(relevantFile => {
                    console.log(`relevantFile.basename = "${relevantFile.basename}"`)
                    let fileTags = fileTagMap.get(relevantFile.path) as string[]
                    console.groupCollapsed(`tags of "${relevantFile.basename}"`)
                    fileTags.forEach((tag, index) => console.log(`${index}: "${tag}"`));
                    console.groupEnd();
                    let fileHasTag: boolean = false;
                    console.groupCollapsed(`Testing each tag, contains: "${searchTag}"?`)
                    fileTags.forEach(tag => {
                        if(tag.contains(searchTag)) {
                            fileHasTag = true;
                            console.log(`"${tag}".contains("${searchTag}") = true`)
                        }
                        else console.log(`"${tag}".contains("${searchTag}") = false`)
                    })
                    console.groupEnd();
                    if(!fileHasTag) {
                        console.log(`%c"${relevantFile.basename}" does not have: "${searchTag}"`, `color: red`);
                        irrelevantFiles.push(relevantFile);
                    }
                    else {
                        console.log(`%c"${relevantFile.basename}" has: "${searchTag}"`, `color: green`);
                    }
                    console.log(``);
                })
    
                console.groupCollapsed(`irrelevantFiles`)
                irrelevantFiles.forEach((irrelevantFile, index) => console.log(`${index}: "${irrelevantFile.basename}"`));
                console.groupEnd();
    
                irrelevantFiles.forEach(irrelevantFile => relevantFiles.remove(irrelevantFile))
                console.groupCollapsed(`current relevantFiles`)
                relevantFiles.forEach((relevantFile, index) => console.log(`${index}: "${relevantFile.basename}"`));
                console.groupEnd()
    
                console.groupEnd()// Ends "Testing Notes For: searchTag = "${searchTag}"
            })
            console.groupEnd();
        }
        
        //Testing Notes For: negatedSearchTags
        {
            console.groupCollapsed(`Testing Notes For: negatedSearchTags`);
            this.negatedSearchTags.forEach(negatedSearchTag => {
                console.groupCollapsed(`Testing Notes For: negatedSearchTag = "${negatedSearchTag}"`)
    
                let irrelevantFiles: TFile[] = []   //Notes that have the searchTag
    
                relevantFiles.forEach(relevantFile => {
                    console.log(`relevantFile.basename = "${relevantFile.basename}"`)
                    let fileTags = fileTagMap.get(relevantFile.path) as string[]
                    console.groupCollapsed(`tags of "${relevantFile.basename}"`)
                    fileTags.forEach((tag, index) => console.log(`${index}: "${tag}"`));
                    console.groupEnd();

                    let fileHasTag: boolean = false;
                    console.groupCollapsed(`Testing each tag, contains: "${negatedSearchTag}"?`)
                    fileTags.forEach(tag => {
                        if(tag.contains(negatedSearchTag)) {
                            fileHasTag = true;
                            console.log(`"${tag}".contains("${negatedSearchTag}") = true`)
                        }
                        else console.log(`"${tag}".contains("${negatedSearchTag}") = false`)
                    })
                    console.groupEnd();


                    if(fileHasTag) {
                        console.log(`%c"${relevantFile.basename}" does have: "${negatedSearchTag}"`, `color: red`);
                        irrelevantFiles.push(relevantFile);
                    }
                    else {
                        console.log(`%c"${relevantFile.basename}" does not have: "${negatedSearchTag}"`, `color: green`);
                    }
                    console.log(``);
                })
    
                console.groupCollapsed(`irrelevantFiles`)
                irrelevantFiles.forEach((irrelevantFile, index) => console.log(`${index}: "${irrelevantFile.basename}"`));
                console.groupEnd();
    
                irrelevantFiles.forEach(irrelevantFile => relevantFiles.remove(irrelevantFile))
                console.groupCollapsed(`current relevantFiles`)
                relevantFiles.forEach((relevantFile, index) => console.log(`${index}: "${relevantFile.basename}"`));
                console.groupEnd()
    
                console.groupEnd()// Ends "Testing Notes For: negatedSearchTag = "${negatedSearchTag}""
            })
            console.groupEnd();
        }

        console.groupEnd();
        
        console.groupCollapsed(`relevantFiles`)
        relevantFiles.forEach((relevantFile, index) => console.log(`${index}: "${relevantFile.basename}"`));
        console.groupEnd();

        console.timeEnd(`searchChildrenNotes()`)
        console.groupEnd();
        return relevantFiles;
    }
    
    /*Was for unrestricted logic
    private searchChildrenNotesV2(): TFile[] {
        //Console Metadata
        {
            console.groupCollapsed(`searchChildrenNotes()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Finding all Notes that have the needed tag logic of every Scanner up to this ${this.scannerName}`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Creating a Map of files with their Tags using my getTags Function (wich works over Metadata, so no async).`,
                `\nGoing through each scanner in the scanner path and testing the notes for the value of that scanner.`,
                `\nFor that, create a map, that maps each file to a "has tag map" wich is just a pair of a tag and a boolean value, that says if the file has that tag.`,
                `\nWith that map, call stringLogicToBoolean() and let that function evaluate if the note should be seen or not.`
            );
            console.groupEnd();
            console.groupEnd();
            console.time(`searchChildrenNotesV2()`)
        }

        console.groupCollapsed(`Scanner info`)
        console.log(`tagName = "${this.tagName}"`)
        console.log(`scannerName = "${this.scannerName}"`)
        console.log(`relevantTags = "${this.relevantTags}"`)
        console.groupEnd();

    

        let currentScanner: Scanner | HTMLElement = this;
        let relevantFiles: TFile[] = this.plugin.app.vault.getMarkdownFiles();
        let fileTagMap: Map<string, string[]> = new Map();
        console.groupCollapsed(`Creating fileTagMap`)
        relevantFiles.forEach(relevantFile => fileTagMap.set(relevantFile.path, (this.plugin as TagsPlus).getTags(relevantFile)));
        console.groupEnd();

        console.groupCollapsed(`tags of each file`)
        console.info(fileTagMap)
        console.groupEnd();

        console.groupCollapsed(`Filtering Notes`)
        while(currentScanner instanceof Scanner) {
            console.groupCollapsed(`Testing Notes for the Value of "${currentScanner.tagName}"`)
            console.groupCollapsed(`Getting "File has tags map"`);
            let fileHasTagsMap: Map<string, Map<string, boolean>> = new Map();
            relevantFiles.forEach(file => {

            let hasTag: Map<string, boolean> = new Map();

                console.groupCollapsed(`file.path = "${file.path}"`);
                (currentScanner as Scanner).relevantTags.forEach(relevantTag => {
                    console.log(`relevant tag = "${relevantTag}"`)
                    

                    let containsTag: boolean = false;
                    fileTagMap.get(file.path)?.forEach(tagOfFile => {
                        if(tagOfFile.contains(relevantTag)) containsTag = true;
                    })

                    hasTag.set(relevantTag, containsTag);
                    fileHasTagsMap.set(file.path, hasTag);
                })
                console.groupEnd();
            })
            console.groupEnd();

            console.groupCollapsed(`file has tags map`)
            console.info(fileHasTagsMap)
            console.groupEnd();

            console.groupCollapsed(`Getting "Irrelevent Files"`)
            let irrelevantFiles: TFile[] = [];
            relevantFiles.forEach(file => {

                console.log(`file.basename = "${file.basename}"`)
                if(!stringLogicToBool((currentScanner as Scanner).tagName, fileHasTagsMap.get(file.path) as Map<string, boolean>)){ 
                    irrelevantFiles.push(file);
                    console.log(`%cfile: "${file.basename}" will be removed!`, `color: red`)
                }
                else {
                    console.log(`%cfile: "${file.basename}" will not be removed in this cycle!`, `color: green`)
                }
                console.log(``)

            })
            console.groupEnd();

            console.groupCollapsed(`Irrelevant Files`)
            irrelevantFiles.forEach((irrelevantFile, index) => console.log(`${index}: "${irrelevantFile.basename}"`));
            console.groupEnd();
            irrelevantFiles.forEach(irrelevantFile => relevantFiles.remove(irrelevantFile)) //Removing irrelevant Files



            currentScanner = currentScanner.parent;
            console.groupEnd();
        }

        console.groupEnd();

        console.groupCollapsed(`Filtered Notes`)
        console.log(`relevant files = ["${relevantFiles.map(file => file.basename).join(`",\n  - "`)}"]`)
        console.groupEnd();


        console.timeEnd(`searchChildrenNotesV2()`)
        console.groupEnd();
        

        return relevantFiles;

        function stringLogicToBool(string: string, boolValues: Map<string, boolean>): boolean {
            //Console Metadata
            {
                let boolValuesStringArray: string[] = [];
                for(const [key, value] of boolValues) {
                    boolValuesStringArray.push(`key: ${key} => value: ${value}`)
                }
                console.groupCollapsed(`stringLogicToBool(string: "${string}", `,
                    `\nboolValues: \n  ${boolValuesStringArray.join(`  \n`)}`
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
    
            function logicEvaluater(string: string, boolValues: Map<string, boolean>): boolean {
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
                    const evalBool = boolValues.get(string) as boolean;
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
    */
    /*No logic at all
    private searchChildrenNotesV1(groupEnds: number): void {
        //Console Metadata
        {
            console.groupCollapsed(`searchChildrenNotes()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Finding and rendering all Notes that have \n["${this.searchTags.join(`", "`)}"]`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Show border to graphically indicate, that the Notes are shown.`,
                `\nGoing through every Markdown File, reading them and checking with Regex if it the note has the tags. `,
                `\nIf the note has the Tags, create new NoteElement, as a way to open the Note.`
            );
            console.groupEnd();
            console.groupEnd();
        }

        this.expanderForNotesEl.style.borderStyle = "solid";

        let renderNotes: TFile[] = [];
        const files = this.plugin.app.vault.getMarkdownFiles();
        
        console.groupCollapsed(`Requests`)
        files.forEach((file, index) => {

            this.plugin.app.vault.read(file).then((content) => {

                if(index == 0) {
                    console.groupEnd();
                    console.groupCollapsed(`Testing`)
                    console.time(`Every Note was read after: `)
                } 
                console.groupCollapsed(`Read "${file.name}"`);
                let fileHasTags: boolean = true;
                this.searchTags.forEach((tag) => {
                    let tagRegExInYaml = new RegExp(`  - ${tag}`, "g");
                    let tagRegExInContent = new RegExp(`#${tag}`, "g")
                    if(!tagRegExInYaml.test(content) && !tagRegExInContent.test(content)) {
                        console.log(`%c${file.name} does not have ${tag}`, `color: red`)
                        fileHasTags = false;
                        return;
                    }
                })
                if(fileHasTags) {
                    renderNotes.push(file);
                }
                console.groupEnd();

                if(index == files.length - 1) {
                    console.groupEnd();
                    console.timeLog(`Every Note was read after: `);
                    
                    console.groupCollapsed(`note elements`)
                    renderNotes.forEach((note) => {
                        new NoteElement(note, this, this.plugin);
                    })
                    console.groupEnd();

                    console.groupEnd(); // searchChildrenNotes()
                    for(let i = 0; i < groupEnds; i++) console.groupEnd();

                }
            })
            console.log(`Waiting for "${file.basename}" to be read...`)

        })

        
        this.childrenNotesExpanded = true;

    }
    */



    private closeChildrenNotes(): void {
         //Console Metadata
         {
            console.groupCollapsed(`closeChildrenNotes()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Emptying the Notes Container, to allow a new search.`);
            console.groupEnd();
        }
        this.expanderForNotesEl.style.borderStyle = "hidden";
        this.childrenNotesEl.empty();
        this.childrenNotesExpanded = false;

        console.log(`Removed dotted Line`);
        console.log(`Emptied note container`);

        console.groupEnd();
    }
    /*
    private setNameOld(newName: string): void {
        
        //Console Metadata
        {
            console.groupCollapsed(`setName(newName: "${newName}")`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Updating everything, that has something to do with the tagName value.`);
            console.groupEnd();
        }

        this.tagName = newName;
        console.log(`tagName = "${this.tagName}"`);  

        //Extracting Search Tags
        let searchTags: string[] = [];
        {
            //Console Metadata
            {
                console.groupCollapsed(`Extracting Search Tags`);
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`);
                console.log(`Getting the correct "value" of the Scanner, so wich Tags are the ones that should be searched for.`)
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`From ${this.scannerName}, cycling through the parent Scanners,`,
                    `\nuntil the Root is the reached.`,
                    `\nIn each Cycle check if the tag value of the current Scanner is not already included`,
                    `\nin a subtag Chain.`,
                    `\nOnly if it is not, add the tag value to the search Tags.`
                );
                console.groupEnd();
                console.groupCollapsed(`%cPotential Problems`, `color: red`);
                console.log(`It might happen, that a Name is included in another name and therefore does not get added,`,
                    `even though it is technically a unique tag in that Cycle.`
                )
                console.groupEnd();
                console.groupEnd();
            }
            let currentScanner: Scanner | HTMLElement = this;
            while(currentScanner instanceof Scanner) {
    
                let addTag = true;
                searchTags.forEach((tag) => {
                    if(tag.contains(currentScanner.tagName)){   //If a currently added tag already contains the currentScanner.tagName, it means that tag is more specific
                       addTag = false;
                       console.groupCollapsed(`%cDont push "${currentScanner.tagName}"`, `color: red`);
                       console.log(`"${tag}" contains "${currentScanner.tagName}"`);
                       console.groupEnd();
                       return;
                    } 
                });
    
                if(addTag){
                    searchTags.push(currentScanner.tagName); 
                    console.log(`%cPush "${currentScanner.tagName}"`, `color: green;`)
                }
                currentScanner = currentScanner.parent;
            }
            console.groupEnd();
        }

        searchTags.sort();
        this.searchTags = searchTags;
        console.log(`searchTags = ["${this.searchTags.join(`", "`)}"]`);

        let scannerName = this.tagName.split("/").pop();
        if(!scannerName) scannerName = this.tagName;
        this.scannerName = scannerName;
        console.log(`scannerName = "${this.scannerName}"`);

        console.groupEnd();
        
    }
    */
    private setName(newName: string, setDefaultScannerName: boolean): void {
        //Console Metadata
        {
            console.groupCollapsed(`setName(newName: "${newName}")`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Updating every value that has something to do with the tag value`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`setting tagName, matching relevant Tags, if setDefaultScannerName true => get default name`
            );
            console.groupEnd();
            console.groupEnd();
        }

        //oldNameData
        {
            console.groupCollapsed(`Old Name Data`)
            console.log(`tagName = "${this.tagValue}"`)
            console.log(`scannerName = "${this.scannerName}"`);
            console.groupEnd();
        }


        this.tagValue = newName;

        //Gettign own(Negated)Tags
        {
            console.groupCollapsed(`Getting own(Negated)Tags`)
            let splitTagValue: string[] = this.tagValue.replaceAll(" ", "").split("&");
            console.groupCollapsed(`splitTagValue`)
            splitTagValue.forEach((tag, index) => console.log(`${index}: "${tag}"`))
            console.groupEnd();
    
            this.ownTags = splitTagValue.filter(tag => /^(?<!!)[üöäÜÖÄa-zA-z0-9_\-\/]+$/.test(tag))
            this.ownNegatedTags = splitTagValue.filter(tag => /^![üöäÜÖÄa-zA-z0-9_\-\/]+$/.test(tag)).map(tag => tag.replaceAll(`!`, ``));
    
            console.groupEnd()
        }

        //own(Negated)Tags
        {
            console.groupCollapsed(`own(Negated)Tags`)
            console.groupCollapsed(`ownNegatedTags`)
            this.ownNegatedTags.forEach((tag, index) => console.log(`${index}: "${tag}"`))
            console.groupEnd();
            console.groupCollapsed(`ownTags`)
            this.ownTags.forEach((tag, index) => console.log(`${index}: "${tag}"`))
            console.groupEnd();
            console.groupEnd();
        }

        if(setDefaultScannerName) {

            let croppedOwnTags: string[] = this.ownTags.map(tag => tag.split("/").pop() as string)
            let croppedOwnNegatedTags: string[] = this.ownNegatedTags.map(negatedTag => negatedTag.split("/").pop() as string)
            let ownTagsString: string = `${croppedOwnTags.join(", ")}`
            let ownNegatedTagsString: string = "";
            if(croppedOwnNegatedTags.length > 0) ownNegatedTagsString = `Nicht: ${croppedOwnNegatedTags.join(", ")}`
            if(this.ownTags.length > 0 && this.ownNegatedTags.length > 0) this.scannerName = `${ownTagsString} | ${ownNegatedTagsString}`
            else this.scannerName = `${ownTagsString}${ownNegatedTagsString}`

        }


        console.groupCollapsed(`New Name Data`)
        console.log(`tagName = "${this.tagValue}"`)
        console.log(`scannerName = "${this.scannerName}"`);
        console.groupEnd();


        console.groupEnd(); //Ends setName();
    }

    private move(direction: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`move(direction: "${direction}")`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called from: ${this.scannerName}`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            if(direction == "down") console.log(`Swapping the Scanner below with "${this.scannerName}"`);
            else console.log(`Swapping the Scanner above with "${this.scannerName}"`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Setting move value according to the direction,`, 
                `\ndetermaning if parent is a scanner or not and getting`, 
                `\nroot-scanners or children Scanners accordingly.`,
                `\nSwapping the relevant scanners and saving (new order).`, 
                `\nUpdating the relative Positions of every scanner (Check for new relative Positions).`,
                `\nEmptying the HTML and children-array of parent,`,
                `\nAppending the new Order to the HTML and children-array of parent.`,
                `\nSaving.`
            );
            console.groupEnd();
            console.groupEnd();
        }

        let moveVal: number;
        if(direction == "up") moveVal = -1;
        else moveVal = 1;

        console.log(`moving value = ${moveVal}`);

        let parentIsScanner: boolean = this.parent instanceof Scanner;
        console.log(`parent is scanner = ${parentIsScanner}`)

        let oldChildren: Scanner[] = [];
        if(parentIsScanner) oldChildren = (this.parent as Scanner).children;
        else this.accessTagScannerView((view) => oldChildren = view.rootScanners);

        console.groupCollapsed(`old order`);
        oldChildren.forEach(({ tagValue: tagName, relPosition }) => console.info( { tagName, relPosition}));
        console.groupEnd();

        let newChildren: Scanner[] = oldChildren;
        newChildren[this.relPosition] = newChildren[this.relPosition + moveVal];
        newChildren[this.relPosition + moveVal] = this;
        
        console.groupCollapsed(`new order`);
        newChildren.forEach(({ tagValue: tagName, relPosition }) => console.info( { tagName, relPosition}));
        console.groupEnd();
        
        newChildren.forEach((child, index) => child.relPosition = index);
        console.groupCollapsed(`Check for new relative Positions`);
        newChildren.forEach(({ tagValue: tagName, relPosition }) => console.info( { tagName, relPosition}));
        console.groupEnd();
        
        if(parentIsScanner) {

            (this.parent as Scanner).childrenEl.empty();
            (this.parent as Scanner).children = [];

            newChildren.forEach((child) => {
                (this.parent as Scanner).children.push(child);
                (this.parent as Scanner).childrenEl.appendChild(child.el);
            })

        }
        else {

            this.accessTagScannerView((view) => {
                
                view.contentEl.empty();
                view.rootScanners = [];

                newChildren.forEach((child) => {
                    view.rootScanners.push(child);
                    view.contentEl.appendChild(child.el)
                })
            })

        }

        this.accessTagScannerView(view => view.saveScannerStructure());
        console.groupEnd();

    }

    public setSearchTags(): void {
        //Console Metadata
        {
            console.groupCollapsed(`setSearchTags()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called From: Scanner "${this.scannerName}"`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Updating the (negated) search Tags, based on the tagValue of this scanner and those above it.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`First getting the own Tags, based on the tagValue and spliting them,`, 
                `\ninto negated and not negated.`,
                `\nIf parents are present, cycle through them and adding their (negated) search Tags`,
                `\nto the (negated)SearchTags of this scanner, if not redundant.`,
                `\n(In this case redundant means: A Scanner has a "stronger search Value" so more specific subtagchains.)`
            );
            console.groupEnd();
            console.groupEnd();
        }



        
   
        this.searchTags = this.ownTags;
        this.negatedSearchTags = this.ownNegatedTags;
        if(this.parent instanceof Scanner) {
            console.log(`"${this.scannerName}" has parent: "${this.parent.scannerName}".`)

            //Getting SearchTags
            {
                console.groupCollapsed(`Getting searchTags`)             
                let relevantParentSearchTags: string[] = [];
                console.groupCollapsed(`Getting relevantParentSearchTags`);     
                this.parent.searchTags.forEach(parentSearchTag => {
                    console.groupCollapsed(`Testing: "${parentSearchTag}"`)             
                
                    let addParentSearchTag: boolean = true;
                    this.searchTags.forEach(searchTag => {
                        if(testSubtag(parentSearchTag, searchTag) || testSubtag(searchTag, parentSearchTag)) {
                            console.log(`%c"${searchTag}" is a subtag of "${parentSearchTag}"`, `color: red`);
                            addParentSearchTag = false;
                        } 
                    })
                    console.log(`addParentSearchTag = ${addParentSearchTag}`)       
                    if(addParentSearchTag) relevantParentSearchTags.push(parentSearchTag);
                    console.groupEnd(); // Ends Testing: "${parentSearchTag}"
                })
                console.groupEnd() // Ends Getting relevantParentSearchTags

                console.groupCollapsed(`relevantParentSearchTags`)
                relevantParentSearchTags.forEach((relevantParentSearchTag, index) => console.log(`${index}: "${relevantParentSearchTag}"`));
                console.groupEnd();

                this.searchTags = this.searchTags.concat(relevantParentSearchTags)

                console.groupEnd() // Ends "Getting positveSearchTags"
            }
            
            //Getting negatedSearchTags
            {
                console.groupCollapsed(`Getting negatedSearchTags`)

                let relevantParentNegatedSearchTags: string[] = [];
                console.groupCollapsed(`Getting relevantParentNegatedSearchTags`);
                this.parent.negatedSearchTags.forEach(parentNegatedSearchTag => {
                    console.groupCollapsed(`Testing: "${parentNegatedSearchTag}"`)
                
                    let addParentNegatedSearchTag: boolean = true;
                    this.negatedSearchTags.forEach(negatedSearchTag => {
                        if(testSubtag(negatedSearchTag, parentNegatedSearchTag ) || testSubtag(parentNegatedSearchTag, negatedSearchTag)) {        //In reverse, if the negated Search Tag, applies to more than the parent, it means the predicate is "stronger"
                            console.log(`%c"${parentNegatedSearchTag}" is a subtag of "${negatedSearchTag}"`, `color: red`);
                            addParentNegatedSearchTag = false;
                        } 
                    })

                    console.log(`addParentNegatedSearchTag = ${addParentNegatedSearchTag}`)
                    if(addParentNegatedSearchTag) relevantParentNegatedSearchTags.push(parentNegatedSearchTag);
                    console.groupEnd();
                })
                console.groupEnd() // Ends Getting releavantParentNegatedSearchTags

                console.groupCollapsed(`relevantParentNegatedSearchTags`)
                relevantParentNegatedSearchTags.forEach((relevantParentNegatedSearchTag, index) => console.log(`${index}: "${relevantParentNegatedSearchTag}"`));
                console.groupEnd();

                
                this.negatedSearchTags = this.negatedSearchTags.concat(relevantParentNegatedSearchTags);


                console.groupEnd() // Ends getting negatedSearchTgas
            }
            
        }
        else console.log(`%c"${this.scannerName}" has no parent. (search tags = own tags)`, `color: blue`);

        
        console.groupCollapsed(`(negated) searchTags`)
        console.groupCollapsed(`searchTags`)
        this.searchTags.forEach((searchTag, index) => console.log(`${index}: "${searchTag}"`));
        console.groupEnd()
        console.groupCollapsed(`negatedSearchTags`)
        this.negatedSearchTags.forEach((negatedSearchTag, index) => console.log(`${index}: "${negatedSearchTag}"`));
        console.groupEnd();
        console.groupEnd();
        

        console.groupEnd() // Ends Getting Search Tags
    }

    protected updateSearchTags(): void {

        //Console Metadata
        {
            console.groupCollapsed(`updateSearchTags()`);
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`An recursive function that has`,
                `\nBase Case: when their are no children on the current scanner => call setSearchTags`,
                `\nInner Case: Call updateChildren() on the next scanner`
            );
            console.groupEnd();
        }

        this.setSearchTags();

        if(this.children.length == 0) console.log(`%c"${this.scannerName}" has no children.`, `color: green`)
        else {
            console.log(`%c"${this.scannerName}" has children.`, `color: blue`)
            this.children.forEach(child => child.updateSearchTags())
        }

        console.groupEnd();
    }

    private accessTagScannerView(viewCallback: (view: TagScannerView) => void): void {
        
        this.plugin.app.workspace.getLeavesOfType(VIEW_TYPE_TAGSCANNER).forEach((leaf) => {
            if(leaf.view instanceof TagScannerView) {
                viewCallback(leaf.view);
            }
        })
            
    }


    toCompressedScanner(): CompressedScanner {
        //Console Metadata
        {
            console.groupCollapsed(`toCompressedScanner()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Called From: "${this.scannerName}"`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Returns the Scanner compressed (Using Data Type: Compressed Scanner),`,
                `\nmapping the children Scanner, to Compressed Scanners.`
            )
            console.groupEnd()
        }
        

        //Compressing Children
        let compressedChildren: CompressedScanner[];
        {   
            //Console Metadata
            {
                console.groupCollapsed(`Compressing Children`)
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.log(`Calls this Function for every child Scanner`,
                    `so every Scanner gets Called from Top to Bottom.`
                )
                console.groupEnd();
            }
            
            compressedChildren = this.children.map((child) => child.toCompressedScanner());
            if(compressedChildren.length == 0) console.log(`%cDone, no children.`, `color: green;`)
            console.groupEnd();
        }

        const compressedScanner = new CompressedScanner(this.tagValue, this.scannerName, compressedChildren);
        console.groupEnd();

        return compressedScanner;

    }
}


export class CompressedScanner {

    tagName: string;
    scannerName: string;
    children: CompressedScanner[];

    constructor(tagName: string, scannerName: string, children: CompressedScanner[]) {
        console.groupCollapsed(`new CompressedScanner(tagName: "${tagName}", \nchildren: [${children.map((child) => child.tagName).join(", ")}])`);
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.log(`Compressing a Scanner into the relevant Data for Saving the Structure`);
        console.groupEnd();
        
        this.tagName = tagName;
        this.scannerName = scannerName;
        this.children = children;
        console.info(this);
        console.groupEnd();
    }

    
}

