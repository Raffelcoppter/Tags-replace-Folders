import CombinedPlugin from "main";
import { TFile, Plugin } from "obsidian";

export class MathNote extends TFile {

    mathNote: TFile;
    tags: string[];
    aliases: string[];
    type: string;

    public constructor(combinedPlugin: CombinedPlugin, note: TFile) {
        super();
        this.mathNote = note;

        let noteMetaData: any = combinedPlugin.app.metadataCache.getFileCache(note);
        this.tags = noteMetaData?.frontmatter["tags"];

        let relevantTags: string[] = [];

        this.tags.forEach((tag) => {
            if(/^Raphael\/Formalwissenschaften\/Mathematik/g.test(tag)) relevantTags.push(tag);
        })

        relevantTags.forEach((tag) => {
            if(/Axiom/g.test(tag)) this.type = "A";
            else if(/Definition/g.test(tag)) this.type = "D";
            else if(/Erweiterung/g.test(tag)) this.type = "E";
            else if(/Satz/g.test(tag)) this.type = "S";
            else if(/Folgerung/g.test(tag)) this.type = "F";
            else if(/Lemma/g.test(tag)) this.type = "L";

        })

        
    }

    

}