import { TagFolder } from "TagFolder";
import { ItemView, WorkspaceLeaf, Menu, Notice, MenuItem, TFile } from "obsidian"

export const VIEW_TYPE_TAGFOLDER = "tagfolder-view"

export class TagFolderView extends ItemView {
    
    tagFile: TFile

    constructor(leaf: WorkspaceLeaf) {
        super(leaf)
    }

    getViewType(): string {
        return VIEW_TYPE_TAGFOLDER;
    }

    getDisplayText(): string {
        return "Hallo"
    }

    protected async onOpen(): Promise<void> {

        const content = this.contentEl
        const linkToCSS = content.createEl("link");
        linkToCSS.rel = "stylesheet";
        linkToCSS.href = "styles.css";

        content.empty();
        content.createEl("div", {cls: "test"});

        // Add an event listener to the container element for the contextmenu event
        content.addEventListener('contextmenu', (event: MouseEvent) => {
            
            const menu = new Menu();
            menu.addItem((item: MenuItem) => {
                item.setTitle("Create New Tag")
                item.setIcon("tag")
                item.onClick((evt: MouseEvent) => {

                    const containerForRenamingOrCreatingTag = content.createDiv({cls: "containerForRenamingOrCreatingTag"})
                    const fakeTagExpander = containerForRenamingOrCreatingTag.createDiv({cls: "fakeTagExpander"})
                    const arrow = fakeTagExpander.createDiv({cls: "arrow"});
                    const renamingOrCreatingTag = containerForRenamingOrCreatingTag.createEl("input", {cls: "renamingOrCreatingTag", value: "Unbenannt"});

                    fakeTagExpander.addEventListener("mouseover", () => fakeTagExpander.classList.add("highlight"));
                    fakeTagExpander.addEventListener("mouseleave", () => fakeTagExpander.classList.remove("highlight"));
                    renamingOrCreatingTag.addEventListener("mouseover", () => renamingOrCreatingTag.classList.add("highlight"))
                    renamingOrCreatingTag.addEventListener("mouseleave", () => renamingOrCreatingTag.classList.remove("highlight"))

                    renamingOrCreatingTag.focus();
                    renamingOrCreatingTag.select();

                    renamingOrCreatingTag.addEventListener("keypress", (e) => {
                        if(e.key == "Enter") {
                            const inputValue = renamingOrCreatingTag.value;
                            containerForRenamingOrCreatingTag.remove();

                            new TagFolder(inputValue, content);

                            /*
                            const tag = content.createSpan();
                            const detail1 = tag.createEl("details")
                            const sum1 = detail1.createEl("summary", {text: ""});
                            const detail2 = tag.createEl("details")
                            const sum2 = detail2.createEl("summary", {text: "Hallo2"})
                            */
                        }
                    })

                })
            })

            menu.showAtMouseEvent(event);
        })
    }

    protected async onClose(): Promise<void> {
        
    }

    private async openTagModal() {

    }
}