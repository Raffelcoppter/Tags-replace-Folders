import { App, WorkspaceLeaf, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache, TAbstractFile, EventRef } from 'obsidian';
import { resOnCreateFile } from 'Ressourcemanagement';
import { folderStructureCreate, folderStructureOnCreateFile, folderStructureOnDeleteFile, folderStructureOnModifyFile } from 'TagFolder';
const path = require("path");
import { TagScannerView, VIEW_TYPE_TAGSCANNER } from 'TagScannerView';


export default class TagsPlus extends Plugin {

	
	combinedPluginSettings: CombinedPluginSettings

	//lastNoteIntegratedIntoUniqueFolderStructure: boolean = false;
	

	async onload() {
		
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerView(VIEW_TYPE_TAGSCANNER, (leaf) => new TagScannerView(leaf, this))
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		
	}

	private async onLayoutReady() {

		//Console Metadata
		{
			console.groupCollapsed(`onLayoutReady()`);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
			console.log(`Called from: Obsidian`)
			console.log(`When Layout is ready`)
			console.trace();
			console.groupEnd();
			console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
			console.log(``)
			console.groupEnd();
		}

		await this.activateView();

		await folderStructureCreate(this);

		this.registerEvent(this.app.vault.on("create", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				folderStructureOnCreateFile();
			}
			if(abstractFile instanceof TFile && abstractFile.extension != "md") {
				resOnCreateFile(this, abstractFile)
			}
		}));
		this.registerEvent(this.app.vault.on("delete", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				folderStructureOnDeleteFile(this, abstractFile)
			}
		}))
		this.registerEvent(this.app.vault.on("modify", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				folderStructureOnModifyFile(this, abstractFile)
			}	
		}));

		console.log(`Added EventListener: "create"`);
		console.log(`Added EventListener: "delete"`);
		console.log(`Added EventListener: "modify"`);

		
		console.groupEnd();
	}


	
	

	private async fake() {

		let markdownFiles: TFile[] = this.app.vault.getMarkdownFiles();
		markdownFiles.forEach(file => {
			
			if(file.parent && file.parent.name == "Daily Notes") {
				
				let fileName: string = file.basename;
				let match = fileName.match(/(\d{2})\.(\d{2})\.(\d{2})/)
				let date: string[] = [];
				if(match) {
					date[0] = match[3].replace("0", "");
					date[1] = match[2].replace("0", "");
					date[2] = match[1];
				}

				match = fileName.match(/\w\w\w/g);
				let weekday: string = "";
				if(match) {
					weekday = match[0];
				}

				let alias = `${weekday} ${date.join(".")}`
				new Notice(alias);

				this.app.vault.read(file).then((content) => {
					
					
				})
			} 
		});
	}

	onunload() {


		let tagScannerViews: TagScannerView[] = this.app.workspace.getLeavesOfType(VIEW_TYPE_TAGSCANNER).filter((leaf) => leaf instanceof TagScannerView)
		if(tagScannerViews.length > 0) {
			tagScannerViews[0].saveScannerStructure();
		}

	}
	
	async loadSettings() {
		this.combinedPluginSettings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.combinedPluginSettings);
	}
	




	private async activateView() {
		let leaf: WorkspaceLeaf | null = null
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TAGSCANNER);

		if(leaves.length > 0) leaf = leaves[0];
		else {
			leaf = this.app.workspace.getLeftLeaf(false);
			await leaf?.setViewState( {type: VIEW_TYPE_TAGSCANNER, active: true})
		}

	}

	public getTags(file: TFile): string[] {
		//Console Metadata
		{
			console.groupCollapsed(`getTags(file: "${file.basename}")`);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
			console.trace();
			console.groupEnd();
			console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
			console.groupCollapsed(`Goal`)
			console.log(`Getting the frontmatter and content tags of a note.`);
			console.groupEnd();
			console.groupCollapsed(`Process`);
			console.log(`Get the metadata, look for frontmatter,`,
				`Look for frontmatter tags and then for content tags.`
			);
			console.groupEnd();
			console.groupEnd();
			console.time(`getTags(file: "${file.path}")`);
		}

		let fileMetadata = this.app.metadataCache.getFileCache(file);
		if(!fileMetadata) {
			console.log(`%cError: No filemetadata was found!`, `color: red`)
			console.timeLog();
			return [];
		}

		let frontmatterTags: string[] = [];

		let fileFrontmatter = fileMetadata.frontmatter;
		if(fileFrontmatter) frontmatterTags = (fileFrontmatter["tags"])
		
		console.groupCollapsed(`tags in frontmatter`)
		console.log(frontmatterTags)
		console.groupEnd()

		let contentTags: string[] = [];
		let cashedContentTags = fileMetadata.tags;
		if(cashedContentTags) contentTags = cashedContentTags.map(cashedTag => cashedTag.tag.replaceAll("#", ""));

		console.groupCollapsed(`content tags`)
		console.log(contentTags)
		console.groupEnd();

		let tags: string[] = frontmatterTags;
		contentTags.forEach(contentTag => {if(!tags.contains(contentTag)) tags.push(contentTag)})

		console.groupCollapsed(`tags`)
		console.log(tags)
		console.groupEnd();

		console.timeLog(`getTags(file: "${file.path}")`);
		console.groupEnd();
		return tags;
		
	}

}

interface CombinedPluginSettings {
	structure1: string;
}

const DEFAULT_SETTINGS: CombinedPluginSettings = {
	structure1: ''
}

class SampleSettingTab extends PluginSettingTab {
	combinedPlugin: TagsPlus;

	constructor(app: App, combinedPlugin: TagsPlus) {
		super(app, combinedPlugin);
		this.combinedPlugin = combinedPlugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Activate R Structure for: ")
			.addTextArea((input) => "")

	}
}




