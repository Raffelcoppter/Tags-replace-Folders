import { MathNote } from 'mathNotes/mathNoteManagement';
import { App, WorkspaceLeaf, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache, TAbstractFile } from 'obsidian';
const path = require("path");
import { TagFolderView, VIEW_TYPE_TAGFOLDER } from 'TagFolderView';


export default class TagsPlus extends Plugin {

	
	combinedPluginSettings: CombinedPluginSettings

	lastNoteIntegratedIntoUniqueFolderStructure: boolean = false;

	async onload() {
		
		await this.loadSettings();
		this.addSettingTab(new SampleSettingTab(this.app, this));
		this.registerView(VIEW_TYPE_TAGFOLDER, (leaf) => new TagFolderView(leaf))
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this))
		
	}

	private async onLayoutReady() {
		console.log("-->Enter_Funktion: onLayoutReady()");

		await this.createUniqueFolderStructure();
		await this.cleanUpUniqueFolderStructure();

		await this.activateView();
		
		this.registerEvent(this.app.vault.on("delete", this.onDeleteAfterLayoutReady.bind(this)))
		this.registerEvent(this.app.vault.on("create", this.onCreateAfterLayoutReady.bind(this)));
		this.registerEvent(this.app.vault.on("modify", this.onModifyAfterLayoutReady.bind(this)))

		
		console.log("Now watching Events: Delete, Create, Modify");
  
		console.log("<--Exit_Funtion: onLayoutReady()");
		


	}

	private async onCreateAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {
		console.log(`\n-->Enter_Function: onCreateAfterLayoutReady(${abstractFile.name}: TAbstractFile)`);

		if(abstractFile instanceof TFile) {
			let note: TFile = abstractFile;

			await this.createNoteBasedOnTemplate(note);
		}
		else {
			console.log(`${abstractFile.name} is a folder, so nothing to do.`);
		}
		
		console.log(`<--Exit_Function: onCreateAfterLayoutReady(${abstractFile.name}: TAbstractFile)\n `)
	}

	private async onModifyAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {
		console.log(`\n-->Enter_Function: onModifyAfterLayoutReady(${abstractFile.name}: TAbstractFile)`);

		if(abstractFile instanceof TFile) {
			console.log(`Registered Change in Note: ${abstractFile.name}, determening if file has tags:`)

			let note: TFile = abstractFile;
			let noteNewTags: string[] = [];

			await this.app.vault.read(note).then(async (noteContent) => {

				if(/tags:\n  -(?:\s[a-zA-Z0-9_\-])/g.test(noteContent)) {
					console.log(`Note ${note.name} has tags, determening if files have changed`)

					let buffer: any = noteContent.match(/(?<=tags:\n)((?:  - )([a-zA-Z0-9_\-\/]+)(?:\n))+(?=(---)|(\w+:)|)/g)
					buffer = buffer[0];
					noteNewTags = buffer.match(/(?<=  - )[a-zA-Z0-9_\-\/]+/g);		
					

					let oldUniqueFolder: any = note.parent;
					let oldUniqueFolderName = oldUniqueFolder.name;
					let newUniqueFolderName = this.getFolderNameFromTags(noteNewTags);
					if(oldUniqueFolderName == newUniqueFolderName) {
						console.log(`Tags have note changed, ${note.name} still in ${oldUniqueFolder}`);
					}
					else {
						console.log(`Tags have changed for ${note.name}`);

						await this.app.vault.createFolder(newUniqueFolderName)
						.then(async (newUniqueFolder: TFolder) => {
							console.log(`Created new Folder: ${newUniqueFolderName}`)
						})
						.catch(() => console.log(`Folder ${newUniqueFolderName} already exists`));	//If Folder already exists it changes nothing, so no error needs to be handled.
						
						await this.app.vault.rename(note, `${newUniqueFolderName}/${note.name}`)
						.then(async () => {
							console.log(`Moved File into ${newUniqueFolderName}`)
						})
						.catch(async () => console.log(`In ${newUniqueFolderName} is a note with the same name,\n
							right now no error handling, this means ${note.name} has the new Tags ${noteNewTags} but is in ${oldUniqueFolder}.\nHandle manually!`));

						if(oldUniqueFolder && oldUniqueFolder.children.length == 0) await this.app.vault.delete(oldUniqueFolder, true);	//No other notes in that folder -> delete

					}
				}
			});
			
		}

		console.log(`<--Exit_Function: onModifyAfterLayoutReady(${abstractFile.name}: TAbstractFile)\n `);
	}

	private async onDeleteAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {

		console.log(`\n-->Enter_Funktion: onDeleteAfterLayoutReady(${abstractFile.name}: TAbstractFile)`)

		if(abstractFile instanceof TFile) {
			let note: TFile = abstractFile;
			console.log("Trying to delete Note: " + note.name);
			let noteParentName = path.dirname(note.path);	//Since Obsidian marked this file as deleted it has not parent.
			
			let noteParent = this.app.vault.getFolderByPath(noteParentName);
			if(noteParent) {
				console.log(`The Parent of ${note.name} was found: ${noteParentName}, checking if ${noteParentName} has other notes`)
				
				if(noteParent.children.length == 0) {
					console.log(`${noteParentName} is empty without ${note.name}.`)
					await this.app.vault.delete(noteParent, true)
					.then(() => console.log(`${noteParentName} was succesfully deleted.`))
					.catch((reason) => console.log(`Error trying to delete ${noteParentName}:}n${reason}`))
				}
				else { 
					console.log(`${noteParentName} is not empty, therfore it was not deleted.\nnoteParent: `)
					console.log(`${noteParent.children}`)
				}
			}
			else console.log(`There is no parent for ${note.name}`)		
			await this.reloadTagFolderTab();
		}
		else console.log(`${abstractFile.name} is a folder, so nothing to do.`)
		
		console.log(`<--Exit_Funktion: onDeleteAfterLayoutReady(${abstractFile.name}: TAbstractFile)\n `)
	}

	onunload() {

	}
	
	async loadSettings() {
		this.combinedPluginSettings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.combinedPluginSettings);
	}
	


	private async createUniqueFolderStructure(): Promise<void> {

		console.log(`-->Enter_Function: createUniqueFolderStructure()`)

		const notes = this.app.vault.getMarkdownFiles();

		for(let note of notes) {

			let noteMetaData = this.app.metadataCache.getFileCache(note);

			if(noteMetaData && noteMetaData.frontmatter && noteMetaData.frontmatter["tags"]) {	//Hier braucht man nicht zu checken ob die Tags schon geladen sind.
				let folderName: string = this.getFolderNameFromTags(noteMetaData.frontmatter["tags"]);

				//Erstell den Ordner falls er noch nicht existiert und bewegt die Notiz hinein
			 	await this.app.vault.createFolder(folderName)
				.then(async () => await this.app.vault.rename(note, `${folderName}/${note.name}`))
				.catch(async () => {

					await this.app.vault.rename(note, `${folderName}/${note.name}`)
					.catch(async () => {
						//This means that there is a note with the same Name with that tag.
						let duplicate = this.app.vault.getFileByPath(`${folderName}/${note.name}`);
						if(duplicate) {
							new Notice("Achtung Duplikat, wird einfach belassen.")	//Hier war ich faul MEHR ADDEN
						}
					});

						
				});
			
			}
		}

		console.log(`<--Exit_Function: createUniqueFolderStructure()`)

	}

	private  async cleanUpUniqueFolderStructure(): Promise<void> {
		console.log(`-->Enter_Function: cleanUpUniqueFolderStructure()`)
		let rootFolder = this.app.vault.getRoot();
		let folders = rootFolder.children;

		for(let folder of folders) {
			if(folder instanceof TFolder) {
				if(folder.children.length == 0) {
					await this.app.vault.delete(folder, true)
					.then(() => {
						console.log("Succesfully deleted Folder: " + folder.name)
					});
				}
			}
		}
		console.log(`<--Exit_Function: cleanUpUniqueFolderStructure()`)

	}

	

	private async noteFullyCreated(note: TFile, retries: number = 20, delay: number = 100): Promise<void> {

		if(retries == 0) {
			console.log("Metadata of Note: " + note.name + " unavailable") 
		}
		else {
			if(!this.app.metadataCache.getFileCache(note)) {
				console.log("retries: " + retries)
				await window.sleep(delay)
				await this.noteFullyCreated(note, retries - 1);
			}
			else {
				console.log(`Note ${note.name} was succefully registered with Metadata`)
			}
		}

	}



	private getFolderNameFromTags(tags: string[]): string {
		let sortedTags: string[] = tags.sort();	//Sortieren egal wie, damit man keine Dopplung haben kann
		let newFolderName: string = "";
		for(let i = 0; i < sortedTags.length; i++) {	
			if(i == 0) newFolderName += sortedTags[i];
			else newFolderName += "_" + sortedTags[i];
		}
		newFolderName = newFolderName.replaceAll("/", "§");

		return newFolderName;
	}


	private async reloadTagFolderTab() {
		console.log(`-->Enter_Function: reloadTagFolderTab`)

		await window.sleep(100);
		let tagfolderView = this.app.workspace.getLeavesOfType("tagfolder-view");
		for(let x of tagfolderView) {
			x.detach();
		}

		await window.sleep(1000);
		let newLeaf = this.app.workspace.getLeftLeaf(false);
		if(newLeaf) {
            newLeaf.setViewState({ type: 'tagfolder-view' });
			await window.sleep(500);
			this.app.workspace.revealLeaf(newLeaf);
		}

		console.log(`<--Exit_Function: reloadTagFolderTab`)		
	}	



	private async createNoteBasedOnTemplate(note: TFile): Promise<void> {
		console.log(`\n-->Enter_Function: createNoteBasedOnTemplate(${note.name}: TFile)`);

		
		await window.sleep(1000);

		if(note.parent) {

			console.log(note.parent.name)
			if(/Raphael\§Formalwissenschaften\§Mathematik/g.test(note.parent.name)) {

				
				let mathNote: MathNote = new MathNote(this, note);
				console.log(mathNote);
			}
			
		}
		
		console.log(`<--Exit_Function: createNoteBasedOnTemplate(${note.name}: TFile)\n `);

	}

	private async activateView() {
		let leaf: WorkspaceLeaf | null = null
		const leaves = this.app.workspace.getLeavesOfType(VIEW_TYPE_TAGFOLDER);

		if(leaves.length > 0) leaf = leaves[0];
		else {
			leaf = this.app.workspace.getLeftLeaf(false);
			await leaf?.setViewState( {type: VIEW_TYPE_TAGFOLDER, active: true})
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




