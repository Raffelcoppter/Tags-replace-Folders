import { structureOnCreateFile, structureOnDeleteFile, structureOnModifyFile, structureOnRenameFile } from 'BackendEventManager';
import { addCommands } from 'CustomCommands';
import { App, WorkspaceLeaf, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache, TAbstractFile, EventRef } from 'obsidian';
import { resOnCreateFile } from 'Ressourcemanagement';
import { FileMetadataExtension, loadFileMetadata, loadSyncTemplateMetadata, SyncTemplateMetadataExtension, syncTemplateStructureOnCreateFile, setStatusBar, syncTemplateStructureOnModify } from 'SyncTemplateManager';
import { folderStructureCreate, folderStructureOnCreateFile, folderStructureOnDeleteFile, folderStructureOnModifyFile } from 'TagFolderManager';
import { TagScannerView, VIEW_TYPE_TAGSCANNER } from 'TagScannerView';
import { CombinedPluginSettingsTab, createFunction } from 'Settings'


export default class TagsPlus extends Plugin {

	
	combinedPluginSettings: CombinedPluginSettings
	syncTemplateMetadataList: Map<string, SyncTemplateMetadataExtension> = new Map();
	fileMetadataList: Map<string, FileMetadataExtension> = new Map();
	statusBarItemSyncTemplateActive: HTMLElement;

	hashToFolderNameMap: Map<string, string> = new Map();
	//lastNoteIntegratedIntoUniqueFolderStructure: boolean = false;
	
	ignoreAllRenames: boolean = false;
	ignoreAllModifies: boolean = false;
	ignoreNextModify: boolean = false;
	ignoreNextRename: boolean = false;
	ignoreNextCreate: boolean = false;

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

		await this.loadSettings();
		this.addSettingTab(new CombinedPluginSettingsTab(this.app, this));
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
				structureOnCreateFile(this, abstractFile)
				//folderStructureOnCreateFile(this, abstractFile);
				//syncTemplateStructureOnCreate(this, abstractFile)
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
		//Console Metadata
		{
			console.groupCollapsed(`loadSettings()\n>> main`);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
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
		const loaded = await this.loadData();
		const rawSettings = {
			...loaded,
		  };
	  
		console.groupCollapsed("raw data")
		console.log(rawSettings)
		console.groupEnd()

		const customFuncStringsListFixed = new Map<string, string>(Object.entries(rawSettings.customFuncStringsList ?? {}));
		console.groupCollapsed("customFuncStringsListFixed")
		console.log(customFuncStringsListFixed)
		console.groupEnd()

		const customFuncList = new Map()
		customFuncStringsListFixed.forEach((rawString, funcName)=> {
			customFuncList.set(funcName, createFunction(rawString))
		})

		this.combinedPluginSettings = {
			customFuncStringsList: customFuncStringsListFixed,
			customFuncList: customFuncList
		}
		console.groupCollapsed("%ccombinedPluginSettings", "color: blue")
		console.log(this.combinedPluginSettings)
		console.groupEnd()
		
		console.groupEnd()

	  }

	async saveSettings() {
		//Console Metadata
		{
			console.groupCollapsed(`saveSettings()\n>> main`);
			console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
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
		console.log(this.combinedPluginSettings)
		const settingsToSave = {
			customFuncStringsList: Object.fromEntries(this.combinedPluginSettings.customFuncStringsList),
		  };
		await this.saveData(settingsToSave);

		console.groupEnd()
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
	customFuncList: Map<string, (inputString: string, ...args: any[]) => any>
	customFuncStringsList: Map<string, string>
}

const DEFAULT_SETTINGS: CombinedPluginSettings = {
	customFuncList: new Map() as Map<string, (inputString: string, ...args: any[]) => any>,
	customFuncStringsList: new Map() as Map<string, string>
}







