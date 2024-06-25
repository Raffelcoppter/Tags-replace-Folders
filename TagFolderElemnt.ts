import { TagFolder } from "TagFolder";
import { Menu, MenuItem, Notice } from "obsidian"

export class TagFolderElement {

    container: HTMLElement;

    tagFolder: TagFolder;
    level: number;
    parent: TagFolderElement[];
    children: TagFolderElement[];

    constructor(tagFolder: TagFolder, parentTag: TagFolderElement | HTMLElement) {

        this.tagFolder = tagFolder;

        if(parentTag instanceof TagFolderElement) {
            this.level = parentTag.level + 1;
            this.parent[0] = parentTag;
            parentTag.children.push(this);

            this.container = parentTag.container.createDiv();

        }
        else {
            this.level = 0;
            this.container = parentTag.createDiv();
        }

        this.container.addClass("containerForTag");
        const tagExpander = this.container.createDiv({cls: "tagExpander"});
        const arrow = tagExpander.createDiv({cls: "arrow"});
        const noteExpander = this.container.createSpan({cls: "noteExpander", text: this.tagFolder.name})
       
        tagExpander.addEventListener("mouseover", () => tagExpander.classList.add("highlight"));
        tagExpander.addEventListener("mouseleave", () => tagExpander.classList.remove("highlight"));

        noteExpander.addEventListener("mouseover", () => noteExpander.classList.add("highlight"))
        noteExpander.addEventListener("mouseleave", () => noteExpander.classList.remove("highlight"))

        this.container.addEventListener("contextmenu", (ev: MouseEvent) => {

            ev.stopPropagation();
            const menu = new Menu();
            menu.addItem((item: MenuItem) => {
                item.setTitle("Create New Subtag")
                item.setIcon("tag");
                item.onClick((ev: MouseEvent) => {
                    
                    const containerForRenamingOrCreatingTag = this.container.createDiv({cls: "containerForRenamingOrCreatingTag"})
                    const fakeTagExpander = containerForRenamingOrCreatingTag.createDiv({cls: "fakeTagExpander"})
                    const arrow = fakeTagExpander.createDiv({cls: "arrow"});
                    const renamingOrCreatingTag = containerForRenamingOrCreatingTag.createEl("input", {cls: "renamingOrCreatingTag", value: "Unbenannt"}); 
                    renamingOrCreatingTag.focus();
                    renamingOrCreatingTag.select();
                    renamingOrCreatingTag.addEventListener("keypress", (e) => {
                        if(e.key == "Enter") {
                            const inputValue = renamingOrCreatingTag.value;
                            renamingOrCreatingTag.remove();

                            
                        }  

                    })
                })
            })

            menu.showAtMouseEvent(ev)
        })

        tagExpander.addEventListener("click", () => {
            this.expandChildren();
        })

        

    }

    private expandChildren() {

    }

    
}