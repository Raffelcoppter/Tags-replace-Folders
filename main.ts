import { structureOnDeleteFile, structureOnModifyFile, structureOnRenameFile } from 'BackendEventManager';
import { addCommands } from 'CustomCommands';
import { App, WorkspaceLeaf, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache, TAbstractFile, EventRef } from 'obsidian';
import { resOnCreateFile } from 'Ressourcemanagement';
import { FileMetadataExtension, loadFileMetadata, loadSyncTemplateMetadata, SyncTemplateMetadataExtension, syncTemplateStructureOnCreate, setStatusBar, syncTemplateStructureOnModify } from 'SyncTemplateManager';
import { folderStructureCreate, folderStructureOnCreateFile, folderStructureOnDeleteFile, folderStructureOnModifyFile } from 'TagFolderManager';
import { TagScannerView, VIEW_TYPE_TAGSCANNER } from 'TagScannerView';


export default class TagsPlus extends Plugin {

	
	combinedPluginSettings: CombinedPluginSettings
	syncTemplateMetadataList: Map<string, SyncTemplateMetadataExtension> = new Map();
	fileMetadataList: Map<string, FileMetadataExtension> = new Map();
	statusBarItemSyncTemplateActive: HTMLElement;

	hashToFolderNameMap: Map<string, string> = new Map();
	//lastNoteIntegratedIntoUniqueFolderStructure: boolean = false;
	
	ignoreAllModifies: boolean = false;
	ignoreNextModify: boolean = false;
	ignoreNextRename: boolean = false;

	async onload() {
		//Console Metadata
		{
			console.groupCollapsed(`onload() \n>> main`);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
			console.log(`Called from: Obsidian`)
			console.log(`When Plugin gets loaded`)
			console.trace();
			console.groupEnd();
			console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
			console.log(`Init Plugin`)
			console.groupEnd();
		}

		addCommands(this)

		//await this.loadSettings();
		//this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerView(VIEW_TYPE_TAGSCANNER, (leaf) => new TagScannerView(leaf, this))
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));
		
		console.groupEnd();
	}

	private async onLayoutReady() {

		//Console Metadata
		{
			console.groupCollapsed(`onLayoutReady() >>\nTagsPlus: main`);
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

		loadSyncTemplateMetadata(this)
		loadFileMetadata(this)


		this.statusBarItemSyncTemplateActive = this.addStatusBarItem()
		setStatusBar(this, this.app.workspace.getActiveFile())
		this.registerEvent(this.app.workspace.on("file-open", (file) => setStatusBar(this, file)))

		this.registerEvent(this.app.vault.on("create", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				folderStructureOnCreateFile(this, abstractFile);
				syncTemplateStructureOnCreate(this, abstractFile)
			}
			if(abstractFile instanceof TFile && abstractFile.extension != "md") {
				//resOnCreateFile(this, abstractFile)
			}
		}));
		this.registerEvent(this.app.vault.on("delete", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {		
				structureOnDeleteFile(this, abstractFile)
			}
		}))
		this.registerEvent(this.app.vault.on("modify", (abstractFile) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				structureOnModifyFile(this, abstractFile)
			}	
		}));
		this.registerEvent(this.app.vault.on('rename', (abstractFile, oldPath) => {
			if(abstractFile instanceof TFile && abstractFile.extension == "md" && !abstractFile.path.includes(`Plugin Ordner`)) {
				structureOnRenameFile(this, abstractFile, oldPath);
			}
		}));

		console.log(`Added EventListener: "create"`);
		console.log(`Added EventListener: "delete"`);
		console.log(`Added EventListener: "modify"`);

		
		
		
		console.groupEnd();
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




