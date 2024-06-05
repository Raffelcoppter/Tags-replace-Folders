import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFolder, TFile, MetadataCache } from 'obsidian';



export default class MyPlugin extends Plugin {

	async onload() {
		
		await this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this))

		

	}

	private async onLayoutReady() {
		console.log("ready");
		await this.createFolderStructure();
		await this.cleanUpFolderStructure();
		this.registerEvent(this.app.vault.on("create", this.moveFileIntoFolderStructure.bind(this)));
	}

	onunload() {

	}

	private async createFolderStructure(): Promise<void> {

		const notes = this.app.vault.getMarkdownFiles();

		for(let note of notes) {

			let noteMetaData = this.app.metadataCache.getFileCache(note);

			if(noteMetaData && noteMetaData.frontmatter && noteMetaData.frontmatter["tags"]) {	//Hat die Notiz tags?
				
				//Erstell einen eindeutig generierten Namen aus den Tags einer Notiz
				let newFolderName: string = this.getFolderNameFromTags(noteMetaData.frontmatter["tags"]);

				//Erstell den Ordner falls er noch nicht existiert und bewegt die Notiz hinein
			 	await this.app.vault.createFolder(newFolderName)
				.then(async () => await this.app.vault.rename(note, `${newFolderName}/${note.name}`))
				.catch(async () => {
					
					let newFolder = this.app.vault.getFolderByPath(newFolderName);
					if(newFolder) {
						if(newFolder.children) {
							await this.app.vault.rename(note, `${newFolderName}/${note.name}`)
						}
					}
				});
			
			}
		}
	}

	private  async cleanUpFolderStructure(): Promise<void> {
		let rootFolder = this.app.vault.getRoot();
		console.log("rootFolder: " + rootFolder.path);
		let folders = rootFolder.children;
		console.log(folders);

		for(let folder of folders) {
			if(folder instanceof TFolder) {
				console.log("Hat erkann dass es ein TFolder ist " + folder.path);
				if(folder.children.length == 0) {
					console.log("Hat erkannt, dass es keine Kinder hat: " + folder.path)
					await this.app.vault.delete(folder, true);
				}
			}
		}
	}


	private async moveFileIntoFolderStructure(file: TFile): Promise<void> {
		console.log("bin dring")
		if(await this.fileHasTagsWithRetries(file, 20, 100)) {
			let metadataCache = this.app.metadataCache.getFileCache(file);
			if(metadataCache && metadataCache.frontmatter && metadataCache.frontmatter["tags"]) {
				let folderName = this.getFolderNameFromTags(metadataCache.frontmatter["tags"]);
				//Check ob Folder existiert, wenn nicht dann erstelle einen. Anders herum für delete. FÜr modify, check ob tags geändert werden (Am besten eigene Funtion dafür schreiben)
				await this.app.vault.rename(file, `${folderName}/${file.name}`);
			}
		}
	}

	private async fileHasTagsWithRetries(file: TFile, retries: number, delay: number): Promise<boolean> {
		
		if(retries == 0) {
			return false;
		}
		else {
			let fileMetaData = this.app.metadataCache.getFileCache(file);
			let bool = fileMetaData && fileMetaData.frontmatter && fileMetaData.frontmatter["tags"] 
			if(bool) {
				return true;
			}
			else {
				await window.sleep(delay);
				console.log("retries: " + (retries - 1))
				return await this.fileHasTagsWithRetries(file, retries - 1, delay)
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
}


