import TagsPlus from "main"
import { Command, Notice, TFile } from "obsidian";
import { applyNewContentBlocks, configurationRegEx, FileMetadataExtension, SyncTemplateMetadataExtension } from "SyncTemplateManager";

export function addCommands(plugin: TagsPlus): void {
    //Console Metadata
    {
        console.groupCollapsed(`addCommands()`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Adding every command`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`defining the commands and adding it via the plugin variable.`);
        console.groupEnd();
        console.groupEnd();
    }



    let applySyncTemplatecommand: Command = {
        id: 'apply-sync-template',
        name: 'Apply sync-template to synced Files.',
        callback: applySyncTemplate
    } 
    plugin.addCommand(applySyncTemplatecommand);
    
    let showSyncTemplateCommand: Command = {
        id: 'show-sync-template',
        name: 'Show sync template',
        callback: showSyncTemplate
    }
    plugin.addCommand(showSyncTemplateCommand)
    
    console.groupEnd();
    return;

    function applySyncTemplate(): void {
        //Console Metadata
        {
            console.groupCollapsed(`applySyncTemplate()\n>> TagsPlus: CustomCommands`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Updating the form of the notes, that are synced to this Template`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Getting the active File`);
            console.groupEnd();
            console.groupEnd();
        }
        
        //Preparation
        let syncTemplateMetadata: SyncTemplateMetadataExtension | undefined
        let syncTemplate: TFile | null;
        {
            console.groupCollapsed(`Preparation`)
            syncTemplate = plugin.app.workspace.getActiveFile();
            if(!syncTemplate) {
                console.log(`No file selected.`)
                new Notice(`No file selected.`)
                console.groupEnd();
                console.groupEnd();
                return;
            }
    
            if(!syncTemplate.path.contains(`Plugin Ordner/Sync Templates/`)) {
                let msg: string = `Selected file is not a sync Template!`
                console.log(msg)
                new Notice(msg)
                console.groupEnd();
                console.groupEnd();
                return;
            }
    
            syncTemplateMetadata = plugin.syncTemplateMetadataList.get(syncTemplate.path)
            if(!syncTemplateMetadata) {
                //Warning Log
                {
                    console.groupCollapsed(`%cWarning: SyncTemplateMetadata not found`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Look inside the list`)
                    console.log(`syncTemplatePath: "${syncTemplate.path}"`)
                    console.groupCollapsed(`syncTemplateMetadataList`)
                    console.log(plugin.syncTemplateMetadataList)
                    console.groupEnd()
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`cant use the metadata to build content.`)
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: Preparation`)
                    console.groupEnd()
                    console.warn(`Error in: applySyncTemplate()`)
                }
                return
            }

            console.log(`no error.`)
            console.groupEnd();
        }

        //Getting relevantFiles
        let relevantFiles: TFile[] = [];
        {
            console.groupCollapsed(`Getting relevantFiles`)

            let files: TFile[] = plugin.app.vault.getMarkdownFiles().filter(file => !file.path.contains(`Plugin Ordner`))
            console.groupCollapsed(`all markdown files`)
            console.log(files)
            console.groupEnd();

            console.groupCollapsed(`Check for files with the syncTemplate as Metadata`)
            files.forEach(file => {
                console.groupCollapsed(`file = "${file.basename}"`)
                let fileMetadata = plugin.fileMetadataList.get(file.path)
                if(!fileMetadata) {
                    //Warning Log
                    {
                        console.groupCollapsed(`%cWarning: fileMetadata of "${file.basename}" not found.`, `color: red`);
                        console.group(`Fix`)
                        console.log(`Check the list`)
                        console.log(`file.path = "${file.path}"`)
                        console.groupCollapsed(`fileMetadataList`)
                        console.log(plugin.fileMetadataList)
                        console.groupEnd();
                        console.groupEnd();
                        console.group(`Consequence`)
                        console.log(`Cant see if the file is linked to a syncTemplate.`)
                        console.groupEnd();
                        console.groupEnd()
                        console.groupEnd();
                        console.warn(`Error in: "file = "${file.basename}""`)
                    }
                    return
                }
                
                let syncTemplateOfFile: TFile = fileMetadata.syncTemplate;
                console.log(`syncTemplateOfFile.path = "${syncTemplateOfFile.path}"`)
                if((syncTemplate as TFile).path != syncTemplateOfFile.path) {
                    console.log(`%cFile is not synced to Template!`, `color: orange`)
                    console.groupEnd()
                    return;
                }
                
                console.log(`fileMetadata.syncTemplateActive = ${fileMetadata.syncTemplateActive}`)
                if(!fileMetadata.syncTemplateActive) {
                    console.log(`%cFile is not in the format of the Template!`, `color: orange`)
                    console.groupEnd()
                    return
                }

                console.log(`%cFile is ready for transformation.`, `color: green`)
                relevantFiles.push(file);

                console.groupEnd();
            })
            console.groupEnd();


            console.groupEnd();
        }

        
        console.groupCollapsed(`relevantFiles`)
        relevantFiles.forEach((value, index) => console.log(`${index}: "${value.basename}"`))
        console.groupEnd();




        plugin.app.vault.read(syncTemplate).then(newRawContent => contentPromiseThenHandler(newRawContent))
        console.log(`Waiting for: content promise...`, `color: orange`)

        console.groupEnd();

        function contentPromiseThenHandler(newRawContent: string) {
            //Console Metadata
            {
                console.groupCollapsed(`%capplySyncTemplate():`, `color: green`, `contentPromiseThenHandler(newRawContent: ...)\n>> TagsPlus: CustomCommands`)
                console.groupCollapsed(`...`)
                console.groupCollapsed(`newRawContent:`)
                console.log(newRawContent)
                console.groupEnd()
                console.groupEnd()
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

            syncTemplateMetadata = syncTemplateMetadata as SyncTemplateMetadataExtension
            syncTemplate = syncTemplate as TFile

            let oldRawContent = syncTemplateMetadata.rawContent;
            if(oldRawContent == newRawContent) {
                console.log(`contents have not changed.`)
                new Notice(`Sync Template has not changed`)
                console.groupEnd()
                return;
            }


            //Getting oldRegExConfigurationBlock
            let oldRegExConfigurationBlock: string;
            {
                console.groupCollapsed(`Getting oldRegExConfigurationBlock`)
                let oldRegExConfigurationBlockMatch: RegExpMatchArray | null = syncTemplateMetadata.rawContent.match(configurationRegEx);
                console.groupCollapsed(`oldRegExConfigurationBlockMatch`)
                console.log(oldRegExConfigurationBlockMatch)
                console.groupEnd()
                if(oldRegExConfigurationBlockMatch) oldRegExConfigurationBlock = oldRegExConfigurationBlockMatch[0]
                else oldRegExConfigurationBlock = ""

                console.groupEnd();
            }

            //Getting newRegExConfigurationBlock
            let newRegExConfigurationBlock: string;
            {
                console.groupCollapsed(`Getting newRegExConfigurationBlock`)
                let newRegExConfigurationBlockMatch = newRawContent.match(configurationRegEx)
                console.groupCollapsed(`newRegExConfigurationBlockMatch`)
                console.log(newRegExConfigurationBlockMatch)
                console.groupEnd()
                if(newRegExConfigurationBlockMatch) newRegExConfigurationBlock = newRegExConfigurationBlockMatch[0]
                else newRegExConfigurationBlock = "";
                console.groupEnd()
            }

            console.groupCollapsed(`oldRegExConfigurationBlock`)
            console.log(oldRegExConfigurationBlock)
            console.groupEnd()
            console.groupCollapsed(`newRegExConfigurationBlock`)
            console.log(newRegExConfigurationBlock)
            console.groupEnd()

            if(oldRegExConfigurationBlock != newRegExConfigurationBlock) {
                console.log(`Feature for changing regexConfig not implemented yet`)
                new Notice(`Feature for changing regexConfig not implemented yet`)
                console.groupEnd()
                return;
            }

            console.log(`Requirements met`)
            let newSyncTemplateMetadata: SyncTemplateMetadataExtension = new SyncTemplateMetadataExtension(plugin, newRawContent, syncTemplate .basename)
            plugin.syncTemplateMetadataList.set(syncTemplate.path, newSyncTemplateMetadata)
            
            let newNoteContentWithContentVariables = newSyncTemplateMetadata.noteContentWithVariables;
            console.groupCollapsed(`newNoteContentWithContentVariables`)
            console.log(newNoteContentWithContentVariables)
            console.groupEnd();

            console.groupCollapsed(`Applying newNoteContent`)
            plugin.ignoreAllModifies = true;
            let modifyPromises: Promise<void>[] = []
            relevantFiles.forEach(relevantFile => {
                console.groupCollapsed(`relevantFile = "${relevantFile.basename}"`)
                let fileMetadata = plugin.fileMetadataList.get(relevantFile.path) as FileMetadataExtension //Must exist, since its in relevantFiels
                let newNoteContent: string = applyNewContentBlocks(fileMetadata.contentBlocks, newNoteContentWithContentVariables);

                console.groupCollapsed(`%cnewNoteContent`, `color: blue`)
                console.log(newNoteContent)
                console.groupEnd();

                
                modifyPromises.push(plugin.app.vault.modify(relevantFile, newNoteContent))
                console.groupEnd()
            })
            console.groupEnd()


            Promise.allSettled(modifyPromises).then(settledModifyPromises => modifyPromisesHandler(settledModifyPromises))

            console.log(`%cWaiting for: settled modify promises...`, `color: orange`)
            console.groupEnd();

            function modifyPromisesHandler(settledModifyPromises: PromiseSettledResult<void>[]) {
                //Console Metadata
                {
                    console.groupCollapsed(`%capplySyncTemplate():`, `color: orange`, `modifyPromisesHandler(settledModifyPromises: ...)`)
                    console.groupCollapsed(`...`)
                    console.groupCollapsed(`settledModifyPromises`)
                    console.log(settledModifyPromises)
                    console.groupEnd()
                    console.groupEnd()
                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                    console.trace();
                    console.groupEnd();
                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                    console.groupCollapsed(`Goal`)
                    console.log(`End modify ignores`); 
                    console.groupEnd();
                    console.groupCollapsed(`Process`);
                    console.log(`set ignoreAllModifies to false`);
                    console.groupEnd();
                    console.groupEnd();
                }

                plugin.ignoreAllModifies = false;
                

                console.groupEnd();
            }
        }
    }

    function showSyncTemplate(): void {
        //Console Metadata
        {
            console.groupCollapsed(`showSyncTemplate()`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Displaying a notice with the name of the current sync Template`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }

        //Preparation
        let activeFile: TFile | null;
        let fileMetadata: FileMetadataExtension | undefined;
        {
            console.groupCollapsed(`Preparation`)
            activeFile = plugin.app.workspace.getActiveFile();
            if(!activeFile) {
                let msg: string = "No file selected"
                console.log(msg)
                new Notice(msg)
                console.groupEnd();
                console.groupEnd();
                return;
            }

                
            if(activeFile.path.contains(`Plugin Ordner/Sync Templates/`)) {
                let msg: string = `Selected file is a sync Template!`
                console.log(msg)
                new Notice(msg)
                console.groupEnd();
                console.groupEnd();
                return;
            }

            fileMetadata = plugin.fileMetadataList.get(activeFile.path)
            if(!fileMetadata) {
                //Warning Log
                {
                    console.groupCollapsed(`%cWarning: fileMetadata not found`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Look inside the list`)
                    console.log(`filePath: "${activeFile.path}"`)
                    console.groupCollapsed(`fileMetadataList`)
                    console.log(plugin.fileMetadataList)
                    console.groupEnd()
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`cant use the metadata to get the SyncTemplate`)
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: Preparation`)
                    console.groupEnd()
                    console.warn(`Error in: showSyncTemplate()`)
                }
                new Notice(`fileMetadata not found`)
                return
            }

            console.groupEnd()
        }

        let syncTemplate = fileMetadata.syncTemplate;
        let syncTemplateName = syncTemplate.basename;
        console.log(`%csyncTemplateName = "${syncTemplateName}"`)

        new Notice(syncTemplateName, 10000)

        console.groupEnd();
    }
}


