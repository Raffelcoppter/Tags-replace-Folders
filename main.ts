import { MathNote } from 'mathNotes/mathNoteManagement';
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache, TAbstractFile } from 'obsidian';
const path = require("path");


export default class CombinedPlugin extends Plugin {

	
	//combinedPluginSettings: CombinedPluginSettings

	

	async onload() {
		
		//await this.loadSettings();
		//this.addSettingTab(new SampleSettingTab(this.app, this));
		this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this))
		
	}

	private async onLayoutReady() {
		console.log("-->Enter_Funktion: onLayoutReady()");

		await this.createUniqueFolderStructure();
		await this.cleanUpUniqueFolderStructure();
		
		this.registerEvent(this.app.vault.on("delete", this.onDeleteAfterLayoutReady.bind(this)))
		this.registerEvent(this.app.vault.on("create", this.onCreateAfterLayoutReady.bind(this)));
		this.registerEvent(this.app.vault.on("modify", this.onModifyAfterLayoutReady.bind(this)))

		console.log("Now watching Events: Delete, Create, Modify");

		console.log("-->Exit_Funtion: onLayoutReady()");
	}

	private async onCreateAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {
		console.log(`-->Enter_Funktion: onCreateAfterLayoutReady(${abstractFile.name}: TAbstractFile)`);
		

		if(abstractFile instanceof TFile) {
			//console.log(`${abstractFile.name} is a Note trying to place it into unique Folder Structure.`)
			//await this.moveFileIntoUniqueFolderStructure(abstractFile);
			//await this.createNoteBasedOnTemplate(note);
		}
		else {
			console.log(`${abstractFile.name} is a folder, so nothing to do.`);
		}
		
		console.log(`<--Exit_Funktion: onCreateAfterLayoutReady(${abstractFile.name}: TAbstractFile)`)
	}

	private async onModifyAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {
		console.log(`-->Enter_Funktion: onModifyAfterLayoutReady(${abstractFile.name}: TAbstractFile)`);

		if(abstractFile instanceof TFile) {
			console.log(`Registered Change in Note: ${abstractFile.name}, determening if file has tags:`)

			let note: TFile = abstractFile;
			let noteNewTags: string[] = [];

			this.app.vault.read(note).then(async (noteContent) => {

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
						.then((newUniqueFolder: TFolder) => {
							console.log(`Created new Folder: ${newUniqueFolder.name}`)
						})
						.catch(() => {});	//If Folder already exists it changes nothing, so no error needs to be handled.
						
						await this.app.vault.rename(note, `${newUniqueFolderName}/${note.name}`)
						.then(() => console.log(`Moved File into ${newUniqueFolderName}`))
						.catch(async () => console.log(`In ${newUniqueFolderName} is a note with the same name,\n
							right now no error handling, this means ${note.name} has the new Tags ${noteNewTags} but is in ${oldUniqueFolder}.\nHandle manually!`));

						if(oldUniqueFolder && oldUniqueFolder.children.length == 0) await this.app.vault.delete(oldUniqueFolder, true);	//No other notes in that folder -> delete

				
						

					}
				}
			});

			
		}
	}

	private async onDeleteAfterLayoutReady(abstractFile: TAbstractFile): Promise<void> {

		console.log(`-->Enter_Funktion: onDeleteAfterLayoutReady(${abstractFile.name}: TAbstractFile)`)

		if(abstractFile instanceof TFile) {
			let note: TFile = abstractFile;
			console.log("Trying to delete Note: " + note.name);
			let noteParentName = path.dirname(note.path);	//Since Obsidian marked this file as deleted it has not parent.
			
			let noteParent = this.app.vault.getFolderByPath(noteParentName);
			if(noteParent) {
				console.log(`Der Ordner von ${note.name} wurde gefunden: ${noteParentName}, checke jetzt ob dieser Ordner noch Notizen enthält`)
				let noteNeighbors = noteParent.children;
				console.log(noteNeighbors);
			}

			if(note.parent) {
				console.log("he")
				let neighbors = note.parent.children;
				neighbors.remove(note);
				console.log(neighbors);

			}
				
				await this.reloadTagFolderTab();
		}
		else {
			console.log(`${abstractFile.name} is a folder, so nothing to do.`)
		}

		console.log(`<--Exit_Funktion: onDeleteAfterLayoutReady(${abstractFile.name}: TAbstractFile)`)
	}

	onunload() {

	}
	/*
	async loadSettings() {
		this.combinedPluginSettings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.combinedPluginSettings);
	}
	*/


	private async createUniqueFolderStructure(): Promise<void> {

		console.log(`-->Enter_Funktion: createUniqueFolderStructure()`)

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

		console.log(`<--Exit_Funktion: createUniqueFolderStructure()`)

	}

	private  async cleanUpUniqueFolderStructure(): Promise<void> {
		console.log(`-->Enter_Funktion: cleanUpUniqueFolderStructure()`)
		let rootFolder = this.app.vault.getRoot();
		let folders = rootFolder.children;

		for(let folder of folders) {
			if(folder instanceof TFolder) {
				if(folder.children.length == 0) {
					this.app.vault.delete(folder, true)
					.then(() => {
						console.log("Succesfully deleted TFolder: " + folder.name)
					});
				}
			}
		}
		console.log(`<--Exit_Funktion: cleanUpUniqueFolderStructure()`)

	}

	private async moveFileIntoUniqueFolderStructure(note: TFile): Promise<void> {

		console.log(`-->Enter_Funktion: moveFileIntoUniqueFolderStructure(${note.name})`)

		await this.noteFullyCreated(note);
		let metadataCache = this.app.metadataCache.getFileCache(note);
		if(metadataCache && metadataCache.frontmatter && metadataCache.frontmatter["tags"]) {
			let folderName = this.getFolderNameFromTags(metadataCache.frontmatter["tags"]);

			await this.app.vault.createFolder(folderName)
			.then(async () => await this.app.vault.rename(note, `${folderName}/${note.name}`))
			.catch(async () => {
				
				await this.app.vault.rename(note, `${folderName}/${note.name}`)
				.catch(async () => {
					//This means that there is a note with the same Name with that tag.
					new Notice("There already is a file with that name and those tags!");
					await this.app.vault.delete(note);
				});
			
			});
		
			//Check ob Folder existiert, wenn nicht dann erstelle einen. Anders herum für delete. FÜr modify, check ob tags geändert werden (Am besten eigene Funtion dafür schreiben)
		}
		
		console.log(`<--Exit_Funktion: moveFileIntoUniqueFolderStructure(${note.name})`)
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
		
	}	



	private async createNoteBasedOnTemplate(note: TFile): Promise<void> {
		
		if(note.parent) {

			if(/Raphael\/Formalwissenschaften\/Mathematik\//g.test(note.parent.path)) {

				let mathNote: MathNote = new MathNote(this, note);
				console.log(mathNote);
			}
			
		}
		
		

		
	}
}
/*
interface CombinedPluginSettings {
	structure1: string;
}

const DEFAULT_SETTINGS: CombinedPluginSettings = {
	structure1: ''
}

class SampleSettingTab extends PluginSettingTab {
	combinedPlugin: CombinedPlugin;

	constructor(app: App, combinedPlugin: CombinedPlugin) {
		super(app, combinedPlugin);
		this.combinedPlugin = combinedPlugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName('Enter Structure Name')
			.setDesc('Track Structure')
			.addText(text => text
				.setPlaceholder('Enter your Structure')
				.setValue(this.combinedPlugin.combinedPluginSettings.structure1)
				.onChange(async (value) => {
					this.combinedPlugin.combinedPluginSettings.structure1 = value;
					await this.combinedPlugin.saveSettings();
				}));
	}
}


*/