import { TagFolderElement } from "TagFolderElemnt";
import { TFile } from "obsidian"; 

export class TagFolder {

    name: string = "";
    elements: TagFolderElement[];

    constructor(tagName: string, parentTag: TagFolderElement | HTMLElement) {

        this.name = tagName;

        this.elements[0] = new TagFolderElement(this, parentTag);
        
    }

 

    




}