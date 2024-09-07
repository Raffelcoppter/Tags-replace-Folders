import { NoteElement } from "NoteElement";
import { Tag } from "Tag";
import { createExpanderContainerRenaming, createNoteExpander, createInputField, createTagExpander } from "TagFolderUtils";
import { Menu, MenuItem, Notice, Plugin, TFile } from "obsidian"

export class TagFolderElement {

    plugin: Plugin;

    container: HTMLElement;
    childrenContainer: HTMLElement;

    tagFolder: Tag;
    parentTagElement: TagFolderElement |  HTMLElement;

    childrenElements: TagFolderElement[] = [];
    childrenNotes: TFile[] = [];
    childrenExpanded: boolean = true;

    constructor(tagFolder: Tag, parentTagElement: TagFolderElement | HTMLElement, plugin: Plugin) {

        this.plugin = plugin;
        this.tagFolder = tagFolder;
        this.parentTagElement = parentTagElement;

        if(parentTagElement instanceof TagFolderElement) {

            parentTagElement.childrenElements.push(this);
            this.container = parentTagElement.childrenContainer.createDiv();

        }
        else {
            this.container = parentTagElement.createDiv();
        }

        const expanderContainer = this.container.createDiv({cls: "expanderContainer"});
        this.childrenContainer = this.container.createDiv({cls: "childrenContainer"});

        const tagExpander = createTagExpander(expanderContainer);
        const noteExpander = createNoteExpander(expanderContainer, this.tagFolder.name);
 

        //Adding new or existing Tag Here
        expanderContainer.addEventListener("contextmenu", (ev: MouseEvent) => {

            ev.stopPropagation();
            const menu = new Menu();

            //Creating Subtag Function
            menu.addItem((item) => {
                item.setTitle("Create New Tag Here");
                item.setIcon("tag");
                item.onClick(() => {

                    createExpanderContainerRenaming(this.childrenContainer).then((tagName) => {
                        new Tag(tagName, this, plugin);
                    })

                    
                })
            })

            //Creating new Note Here
            menu.addItem((item) => {
                item.setTitle("Create New Note");
                item.setIcon("file");
                item.onClick(() => {
                    
                    
                    new NoteElement("lool", this, plugin);
                })
            })

            //Renaming Function
            menu.addItem((item) => {
                item.setTitle("Rename");
                item.setIcon("pencil");
                item.onClick(() => {
                    
                    expanderContainer.addClass("renaming")
                    noteExpander.hide();
                    tagExpander.removeEventListener("mouseover", () => tagExpander.addClass("highlight"));

                    let noteExpanderRenaming = createInputField(expanderContainer, noteExpander.getText(), (ev) => {

                        if(ev.key == "Enter") {
                            const newName = noteExpanderRenaming.value;
                            noteExpanderRenaming.remove();

                            this.tagFolder.name = newName;
                            noteExpander.setText(newName)
                            noteExpander.show()
                            expanderContainer.removeClass("renaming")
                        }

                    });
                   

                })
            })

            //Deleting Function
            menu.addItem((item) => {

            })

            
            

            menu.showAtMouseEvent(ev);
        
        })
        

        tagExpander.addEventListener("click", () => {
            
            if(this.childrenExpanded) {
                this.childrenContainer.hide();
                this.childrenExpanded = false;
            }
            else {
                this.childrenContainer.show();
                this.childrenExpanded = true;
            }
            


        })




    

    }

    private expandChildren() {

    }

    
}