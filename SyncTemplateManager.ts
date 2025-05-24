import TagsPlus from "main";
import { text } from "node:stream/consumers";
import { App, FuzzySuggestModal, Modal, Notice, Plugin, Setting, SuggestModal, TFile, TFolder } from "obsidian";
import { folderNameToHashedFolderName, folderStructureOnModifyFile, getTagsThroughContent, getTagsThroughMetadata, tagsToFolderName } from "TagFolderManager";
import { createInputField } from "TagScannerView";

//Regular Expression for parsing sync templates
const defaultRegEx: RegExp = /[\w\W]*?/g
export const configurationRegEx: RegExp = /<!\n[\w\W]+\n!>\n/g   
export const contentVariableRegEx: RegExp = /<{[\w\W]+?}>/g
export const notizNameDefaultRegExp: RegExp = /[^"*/\\<>:|?}]+?/g

//Event watchers
/*export function syncTemplateStructureOnCreate(plugin: TagsPlus, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`syncTemplateStructureOnCreate()\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Once Creation registered, use the name variable to`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Read the content of the new File`);
        console.groupEnd();
        console.groupEnd();
    }

    let fileMetadata = plugin.fileMetadataList.get(file.path);
    if(!fileMetadata) {
        //Warning Log
        {
            let warnMessage: string = `Logic-Warning: File Metadata for "${file.basename}"` +
                `\nwas not Created before file creation was registered!`;
            console.groupCollapsed(`%c${warnMessage}`, `color: red`);
            console.group(`Fix`)
            console.log(`Check how the file was created and ensure that metadata is created beforehand.`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`Cant get the syncTemplate that the file was created with,`,
                `\nso no content update for "${file.basename}"`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: syncTemplateStructureOnCreate(file: "${file.basename}")`)
        }
        return;
    }
    console.groupCollapsed(`fileMetadata`)
    console.log(fileMetadata)
    console.groupEnd();

    let syncTemplateMetadata = plugin.syncTemplateMetadataList.get(fileMetadata.syncTemplate.path);

    if(!syncTemplateMetadata) {
        //Warning Log
        {
            let warnMessage: string = `Logic-Warning: SyncTemplateMetadata for "${fileMetadata.syncTemplate.basename}"` +
                `\nwas not found in syncTemplateMetadataList!`;
            console.groupCollapsed(`%c${warnMessage}`, `color: red`);
            console.group(`Fix`)
            console.log(`Check for the creation and see if that worked, then look for maybe name doublets.`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`Cant read the relationships or the noteContentWithVariables,`,
                `\nthat will be used for the Updated Content.`
            )
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: syncTemplateStructureOnCreate(file: "${file.basename}")`)
        }
        return;
    }
    console.groupCollapsed(`syncTemplateMetadata`)
    console.dir(syncTemplateMetadata)
    console.groupEnd();


    let notizNameRelationships = syncTemplateMetadata.relationships.filter(value => value.from == "notizName");
    if(notizNameRelationships.length == 0) {
        console.log(`No relationships defined for notizName`)
        console.groupEnd()
        return;
    }

    //Getting newContentBlocks
    let newContentBlocks: Map<string, string> = fileMetadata.contentBlocks; 
    {
        console.groupCollapsed(`Getting newContentBlocks`)
        notizNameRelationships.forEach(notizNameRelationship => {
            console.groupCollapsed(`notizNameRelationship = {from "${notizNameRelationship.from}}", to "${notizNameRelationship.to}"}`)
        
            let toBeUpdatedVariable = notizNameRelationship.to;
            if(!syncTemplateMetadata.contentVariables.contains(toBeUpdatedVariable)) {
                //Warning Log
                {
                    let warnMessage: string = `Logic-Warning: SyncTemplate "${fileMetadata.syncTemplate}"` +
                    `\nhas a relationshipvalue: "${toBeUpdatedVariable}", that is not in the content of the template!.`
                    console.groupCollapsed(`%c${warnMessage}`, `color: red`);
                    console.group(`Fix`)
                    console.log(`See syncTemplate and use the relationship variable, or delete relationship!`)
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`None, just redundant.`)
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: "notizNameRelationship = {from "${notizNameRelationship.from}}", to "${notizNameRelationship.to}"}"`)
                    
                }
                return
            }

            let updatedContent = applyRelationship(file.basename ,notizNameRelationship)
            console.log(`toBeUpdatedVariable = "${toBeUpdatedVariable}"`)
            console.log(`updatedContent = ${updatedContent}`)

            newContentBlocks.set(toBeUpdatedVariable, updatedContent)

            console.groupEnd();
        })
        console.groupEnd();
    }
    
    console.groupCollapsed(`newContentBlocks`)
    console.log(newContentBlocks)
    console.groupEnd();
    let newFileMetadata: FileMetadataExtension = fileMetadata;
    newFileMetadata.contentBlocks = newContentBlocks;
    plugin.fileMetadataList.set(file.path, newFileMetadata);

    let updatedContent: string = applyNewContentBlocks(newContentBlocks, syncTemplateMetadata.noteContentWithVariables)

    console.groupCollapsed(`updatedContent`)
    console.log(updatedContent)
    console.groupEnd();

    plugin.app.vault.modify(file, updatedContent).then((value) => {
        //Console Metadata
        {
            console.groupCollapsed(`%csyncTemplateStructureOnCreate(file: "${file.basename}"):`, `color: green`,
                `modifyPromiseThenHandler()\n>> TagsPlus: SyncTemplateManager`
            )
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: `)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Giving feedback, whether the modify promise worked`)
            console.groupEnd();
        }

        console.log(`Worked.`)
        console.log(value);

        console.groupEnd()
    });
    console.log(`%cWaiting for modifyPromise...`, `color: orange`)

    console.groupEnd();
}*/

export function syncTemplateStructureOnCreateFile(plugin: TagsPlus, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`syncTemplateStructureOnCreateFile(file: "${file.basename}")\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Prompt the user for a sync Template, then based on that create a file.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`When this gets called, it means it wasnt created from a scanner,`,
            `\nthis means we dont know the tags, just when it was created, the name of the file.`,
            `\nSo we the one thing that can have relationships is the name of the file.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    let syncTemplates: TFile[] | undefined = plugin.app.vault.getFolderByPath(`Plugin Ordner/Sync Templates`)?.children.filter(file => file instanceof TFile)
    if(!syncTemplates) {
        //Warning Log
        {
            console.groupCollapsed(`%cWarning: sync templates folder not found!`, `color: red`);
            console.group(`Fix`)
            console.log(`Check path inconsistancy`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`Not able to prompt user for sync Templates`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: "syncTemplateStructureOnCreate(file: "${file.basename}")"`)
        }
        return
    }

    new TemplateModal(plugin.app, (syncTemplate) => {
        //Console Metadata
        {
            console.groupCollapsed(`%csyncTemplateStructureOnCreateFile(file: "${file.basename}")`, `color: orange`, `syncTemplateInputHandler(syncTemplate: "${syncTemplate.basename}")\n>> TagsPlus: SyncTemplateManager`)
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

        let syncTemplateMetadata = plugin.syncTemplateMetadataList.get(syncTemplate.path)
        if(!syncTemplateMetadata) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: SyncTemplate not found in Metadatalist`, `color: red`);
                console.group(`Fix`)
                console.log(`Check list`)
                console.log(`syncTemplate.path = "${syncTemplate.path}"`)
                console.groupCollapsed(`syncTemplateMetadataList`)
                console.log(plugin.syncTemplateMetadataList)
                console.groupEnd();
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Cant apply Template.`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: "syncTemplateInputHandler(syncTemplate: "${syncTemplate.basename}")"`)
            }
            return
        }

        //Getting defaultFileName and select
        let defaultFileName: string;
        let select: boolean;
        {
            console.groupCollapsed(`Getting defaultFileName`)
            if(file.basename != "Unbennant") {
                console.log(`File Basename was already set to to something`)
                select = false;
                defaultFileName = file.basename;
            }
            else {
                console.log("File has no defined Name yet.")
                if(syncTemplateMetadata.notizNameDefault) {
                    console.log(`syncTemplate has a defined default`)
                    console.log(`syncTemplateMetadata.notizNameDefault = "${syncTemplateMetadata.notizNameDefault}"`)
                    select = syncTemplateMetadata.selectNotizNameDefault;
                    defaultFileName = syncTemplateMetadata.notizNameDefault;
                }
                else {
                    console.log("Sync Template has no default notizName value set.")
                    select = true;
                    defaultFileName = "Unbenannt"
                }
            }

            console.groupEnd()
        }
        console.log(`%defaultFileName = "${defaultFileName}"`, `color: blue`)
        console.log(`%cselect = "${select}`, `color: blue`)
        

        new InputModal(plugin.app, "Gib den Notiz Namen ein", "notizName", defaultFileName, select, (fileBasename) => {
            //Console Metadata
            {
                console.groupCollapsed(`%csyncTemplateStructureOnCreateFile(file: "${file.basename}")`, `color: orange`, `fileBasenameInputHandler(fileBasename: "${fileBasename}")\n>> TagsPlus: SyncTemplateManager`)
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

            let fromValToContentMap: Map<string, string> = new Map()
            fromValToContentMap.set("notizName", fileBasename)
            let processedNoteContent = getProcessedNoteContentFromRawInputs(plugin, fromValToContentMap, syncTemplateMetadata)
            console.groupCollapsed(`%cprocessedNoteContent`, `color: blue`)
            console.log(processedNoteContent)
            console.groupEnd();

            //Getting fileAdress
            let fileAdress: string;
            {
                console.groupCollapsed(`Getting fileAdress`)
                let fileTags = getTagsThroughContent(processedNoteContent)
                let tagFolderName = tagsToFolderName(fileTags)
                let hashedTagFolderName = folderNameToHashedFolderName(plugin, tagFolderName)

                fileAdress = `${hashedTagFolderName}/${fileBasename}.md`
                console.groupEnd()
            }
            console.log(`%cfileAdress = "${fileAdress}"`, `color: blue`)

            plugin.ignoreNextModify = true;
            plugin.app.vault.modify(file, processedNoteContent)

            folderStructureOnModifyFile(plugin, file, fileAdress)

            plugin.fileMetadataList.set(fileAdress, new FileMetadataExtension(plugin, processedNoteContent, syncTemplate, fileBasename))

            console.groupEnd();
        }).open();

        console.log(`%cWaiting for: fileBasenameInput`, `color: orange`)

        console.groupEnd();
    }).open()
    
    console.log(`%cWaiting for: SyncTemplateInput...`, `color: orange`)

    console.groupEnd();
}


export function syncTemplateStructureOnModify(plugin: TagsPlus, file: TFile, newFileContent: string): [Promise<void> | null, [file: TFile, newPath: string] | null] {
    //Console Metadata
    {
        console.groupCollapsed(`syncTemplateStructureOnModify(file: "${file.basename}"..., newFileContent: ...,\nnewTagFolderName: ...)`);
        console.groupCollapsed(`...`)
        console.groupCollapsed(`newFileContent:`)
        console.log(newFileContent)
        console.groupEnd()
        console.groupCollapsed(`file`)
        console.log(file)
        console.groupEnd();
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(``);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Getting fileMetadata first, then reading content.`,
            `\nCall contentPromiseThenHanlder if it worked!`
        );
        console.groupEnd();
        console.groupEnd();
    }

    //Preparation
    let oldFileMetadata: FileMetadataExtension | undefined;
    let syncTemplateMetadata: SyncTemplateMetadataExtension | undefined;
    {
        console.groupCollapsed(`Preparation`)
        oldFileMetadata = plugin.fileMetadataList.get(file.path);
        if(!oldFileMetadata) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: Couldnt find fileMetadata of "${file.basename}"`, `color: red`);
                console.group(`Fix`)
                console.log(`Look inside the list.`);
                console.groupCollapsed(`plugin.fileMetadataList`)
                console.log(plugin.fileMetadataList)
                console.groupEnd();
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`No comparison to old content possible!`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: Preparation`)
                console.groupEnd();
                console.warn(`Error in: syncTemplateStructureOnModify(file: "${file.basename}", ...)`)
            }
            return [null, null];
        }
        syncTemplateMetadata = plugin.syncTemplateMetadataList.get(oldFileMetadata.syncTemplate.path)
        if(!syncTemplateMetadata) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: Couldnt find syncTemplateMetdata of "${oldFileMetadata.syncTemplate.basename}"`, `color: red`);
                console.group(`Fix`)
                console.log(`Check loading Method at the start.`);
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Needed for nice Iteration and for new Content if needed!`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: Preparation`)
                console.groupEnd();
                console.warn(`Error in: syncTemplateStructureOnModify(file: "${file.basename}")`)
            }
            return [null, null];
        }

        console.log(`%cNo errors`, `color: green`)
        console.groupEnd();
    }

    let newFileMetadata = new FileMetadataExtension(plugin, newFileContent, oldFileMetadata.syncTemplate, file.basename)
    

    //Getting processedFileContent
    let processedFileContent: string;
    let contentChanged: boolean = false;
    processedFileContent = (function(): string {
        
        console.groupCollapsed(`Getting processedFileMetadata`)

        if(!newFileMetadata.syncTemplateActive) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: sync Template is not active on this file`, `color: red`);
                console.group(`Fix`)
                console.log(`Check for formatting differences`)
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Not able to process the fileMetadata, so return newFileMetadata.`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: "Getting processedFileMetadata"`)
            }
            return newFileContent;
        }

        if(!oldFileMetadata.syncTemplateActive) {
            
            new Notice(`"${oldFileMetadata.syncTemplate.basename}" is now active on file: "${file.basename}"`)

            console.log(`%csyncTemplate: "${oldFileMetadata.syncTemplate.basename}" was inactive! No comparison possible,\nbut update metadata`, `color: orange`)
            console.groupEnd();
            return newFileContent;
        }

        //Getting changedRelationshipVariableToContentMap and keys
        let changedRelationshipVariableToContentMap: Map<string, string> = new Map();
        let changedRelationshipVariables: string[] = [];
        {
            console.groupCollapsed(`Comparing relationship Variables`)
            syncTemplateMetadata.relationshipVariables.forEach(relationshipVariable => {
                console.groupCollapsed(`relationshipVariable = "${relationshipVariable}"`);
                
                let oldContent = oldFileMetadata.contentBlocks.get(relationshipVariable) as string
                let newContent = newFileMetadata.contentBlocks.get(relationshipVariable) as string;

                if(oldContent == newContent) {
                    console.log(`"${relationshipVariable}" has not changed.`)
                    console.groupEnd();
                    return;
                }
                else {
                    console.log(`"${relationshipVariable}" has changed.`)
                    changedRelationshipVariableToContentMap.set(relationshipVariable, newContent)
                    changedRelationshipVariables.push(relationshipVariable)
                }
                console.groupEnd();
            })
            console.groupEnd();
            
        }

        if(changedRelationshipVariables.length == 0) {
            console.log(`no changed relationship variables`)
            console.groupEnd()
            return newFileContent;
        }
        
        console.groupCollapsed(`changedRelationshipVariables`)
        changedRelationshipVariableToContentMap.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();


        //This block jus applies the relationships and logs the results in shape of a Map and the keyArray
        let changedRelationshipToValToContentMap = applyRelationships(plugin, changedRelationshipVariableToContentMap, syncTemplateMetadata.relationships)
        if(changedRelationshipToValToContentMap == "Overlap-Error") {
            //Warning Log
            {
                console.groupCollapsed(`%cOverlap-Warning: "${newFileMetadata.syncTemplate.basename}" has conflicting relationships!`, `color: red`);
                console.group(`Fix`)
                console.log(`Change the syncTemplate relationships`)
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Cant apply the inner relationships, so no content update, just file adress maybe.`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: "Getting processedFileMetadata"`)
            }
            return newFileContent;
        }

        let processedContentVariableToContentMap: Map<string, string> = combineMaps(changedRelationshipToValToContentMap, newFileMetadata.contentBlocks)  
        console.groupCollapsed(`processedContentVariableToContentMap`)
        console.log(processedContentVariableToContentMap)
        console.groupEnd();

        let processedFileContent = applyNewContentBlocks(processedContentVariableToContentMap, syncTemplateMetadata.noteContentWithVariables)
        console.groupCollapsed(`%cprocessedFileContent`, `color: blue`)
        console.log(processedFileContent)
        console.groupEnd();

        contentChanged = true;
        console.groupEnd();
        return processedFileContent;
    }) ()
    let processedFileMetadata: FileMetadataExtension = new FileMetadataExtension(plugin, processedFileContent, newFileMetadata.syncTemplate, ""); //Update name later



    //Getting processedFileMetadataAdress
    let processedFileMetadataAdress: string;
    let processedName: string;
    {
        //Getting hashedProcessedTagFolderName
        let hashedProcessedTagFolderName;
        {
            console.groupCollapsed(`Getting hashedProcessedTagFolderName`);
            let processedTags = getTagsThroughContent(processedFileContent);
            let processedTagFolderName = tagsToFolderName(processedTags);
            hashedProcessedTagFolderName = folderNameToHashedFolderName(plugin, processedTagFolderName)
            console.groupEnd();
        }

        //Getting processedName
        {
            console.groupCollapsed(`Getting processedName`)
            if(processedFileMetadata.syncTemplateActive && syncTemplateMetadata.notizNameUsedInContent) {
                console.log(`%csync Template is actve and notizName is beeing used.`, `color: green`)
                processedName = processedFileMetadata.contentBlocks.get(`notizName`) as string; //Must be defined, because the syncTemplate is active on the processed content
            }
            else {
                if(syncTemplateMetadata.notizNameUsedInContent) console.log(`Notiz name is not used in content`)
                else {
                    console.log(`%csync Template is not active on the processed File`, `color: red`)
                }
                processedName = file.basename;
            }
        }

        console.groupEnd()
        console.log(`%chashedProcessedTagFolderName = "${hashedProcessedTagFolderName}"`, `color: blue`)
        console.log(`%cprocessedName = "${processedName}"`, `color: blue`)

        processedFileMetadataAdress = `${hashedProcessedTagFolderName}/${processedName}.md`
    }
    console.log(`%cprocessedFileMetadataAdress = "${processedFileMetadataAdress}"`, `color: blue`)
    processedFileMetadata.fileBasename = processedName;

    //Adress Change
    let adressChanged: boolean = false;
    {
        console.groupCollapsed(`Adress Change`)
        let oldFileMetadataAdress: string = file.path;
        console.log(`processedFileMetadataAdress = "${processedFileMetadataAdress}"`)
        console.log(`oldFileMetadataAdress = "${oldFileMetadataAdress}"`)

        if(oldFileMetadataAdress != processedFileMetadataAdress) {
            console.log(`%cAdress has changed`, `color: blue`)
            plugin.fileMetadataList.delete(oldFileMetadataAdress)
            adressChanged = true;
        }
        else console.log(`%cAdress has not changed`, `color: blue`)

        plugin.fileMetadataList.set(processedFileMetadataAdress, processedFileMetadata)
        


        console.groupCollapsed(`fileMetadataList`)
        console.log(plugin.fileMetadataList)
        console.groupEnd();
        console.groupEnd();
    }

    //Status bar Update
    {
        console.groupCollapsed(`Status bar update`)
        let status: "active" | "inactive";
        if(processedFileMetadata.syncTemplateActive) status = "active";
        else status = "inactive";

        setStatusBar(plugin, null ,status)

        console.groupEnd(); 
    }

    let returnPair: [Promise<void> | null, [TFile, string] | null] = [null, null]
    if(adressChanged) {
        console.log(`Request: folderStructure change`)
        returnPair[1] = [file, processedFileMetadataAdress]
    }

    if(contentChanged) {
        console.log(`Request: content modify`)
        returnPair[0] = plugin.app.vault.modify(file, processedFileContent)
    }
    
    console.groupEnd();
    return returnPair;
}

export function syncTemplateStructureOnRenameFile(plugin: TagsPlus, file: TFile, oldFilePath: string) {
    //Console Metadata
    {
        console.groupCollapsed(`syncTemplateStructureOnRenameFile(file: "${file.basename}", oldFilePath: ...)\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`...`)
        console.log(`oldFilePath = "${oldFilePath}"`)
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Updating`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(``);
        console.groupEnd();
        console.groupEnd();
    }
    
    //Preparation
    let oldFileMetadata: FileMetadataExtension | undefined;
    let syncTemplateMetadata: SyncTemplateMetadataExtension | undefined;
    let oldFileMetadataAdress = oldFilePath;
    {
        console.groupCollapsed(`Preparation`)
        oldFileMetadata = plugin.fileMetadataList.get(oldFileMetadataAdress);
        if(!oldFileMetadata) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: Couldnt find fileMetadata of "${file.basename}"`, `color: red`);
                console.group(`Fix`)
                console.log(`Look inside the list.`);
                console.log(`oldFileMetadataAdress = "${oldFileMetadataAdress}"`)
                console.groupCollapsed(`plugin.fileMetadataList`)
                console.log(plugin.fileMetadataList)
                console.groupCollapsed();
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`No comparison to old content possible!`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: Preparation`)
                console.groupEnd();
                console.warn(`Error in: syncTemplateStructureOnModify(file: "${file.basename}", ...)`)
            }
            return
        }
        syncTemplateMetadata = plugin.syncTemplateMetadataList.get(oldFileMetadata.syncTemplate.path)
        if(!syncTemplateMetadata) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: Couldnt find syncTemplateMetdata of "${oldFileMetadata.syncTemplate.basename}"`, `color: red`);
                console.group(`Fix`)
                console.log(`Check loading Method at the start.`);
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Needed for nice Iteration and for new Content if needed!`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: Preparation`)
                console.groupEnd();
                console.warn(`Error in: syncTemplateStructureOnModify(file: "${file.basename}")`)
            }
            return
        }

        console.log(`%cNo errors`, `color: green`)

        console.groupEnd();
    }

    if(!syncTemplateMetadata.notizNameUsedInContent || !oldFileMetadata.syncTemplateActive) {
        if(!syncTemplateMetadata.notizNameUsedInContent) {
            console.log(`notizName is not beeing used in syncTemplateContent`)
        }
        if(!oldFileMetadata.syncTemplateActive) {
            console.log(`%cSync Template is not active`, `color: orange`)
        }
        console.log(`-> just update fileMetadata Adress and name from old Metadata.`)

        let newFileMetadata = oldFileMetadata;
        newFileMetadata.fileBasename = file.basename;

        plugin.fileMetadataList.delete(oldFileMetadataAdress)
        plugin.fileMetadataList.set(file.path, newFileMetadata)

        console.groupCollapsed(`fileMetadataList`)
        console.log(plugin.fileMetadataList)
        console.groupEnd();

        console.groupEnd();
        return;
    }


    //Getting newContent
    let newContent: string;
    {
        let notizNameToContentMap: Map<string, string> = new Map();
        notizNameToContentMap.set(`notizName`, file.basename);
        let changedRelationshipVariableToContentMap = applyRelationships(plugin, notizNameToContentMap, syncTemplateMetadata.relationships)
        if(changedRelationshipVariableToContentMap == "Overlap-Error") {
            //Warning Log
            {
                console.groupCollapsed(`%cOverlap-Warning: Some of the relationships are conflicting`, `color: red`);
                console.group(`Fix`)
                console.log(`Check the relationships of "${syncTemplateMetadata.syncTemplateBaseName}"`)
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Not able to apply that template to this note.`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: syncTemplateStructureOnRenameFile(file: "${file.basename}")`)
            }
            return
        }

        let oldContentBlocksWithUpdatedNotizName: Map<string, string> = oldFileMetadata.contentBlocks;
        oldContentBlocksWithUpdatedNotizName.set(`notizName`, file.basename)   //Is definitely being used since if not, notizNameUsedInContent would not be true
        console.groupCollapsed(`oldContentBlocksWithUpdatedNotizName`)
        console.log(oldContentBlocksWithUpdatedNotizName)
        console.groupEnd();
        
        let combinedMap = combineMaps(changedRelationshipVariableToContentMap, oldContentBlocksWithUpdatedNotizName);
        newContent = applyNewContentBlocks(combinedMap, syncTemplateMetadata.noteContentWithVariables);
    }

    
    //Getting newFileMetadataAdress
    let newFileMetadataAdress: string;
    {
        console.groupCollapsed(`Getting newFileMetadataAdress`)
        let newTags = getTagsThroughContent(newContent)
        let newTagFolderName = tagsToFolderName(newTags);
        newFileMetadataAdress = `${newTagFolderName}/${file.basename}.md`
        console.groupEnd();
    }

    let newFileMetadata = new FileMetadataExtension(plugin, newContent, oldFileMetadata.syncTemplate, file.basename)
    //Adress Change
    {
        console.groupCollapsed(`Adress Change`)

        plugin.fileMetadataList.delete(oldFileMetadataAdress)
        plugin.fileMetadataList.set(newFileMetadataAdress, newFileMetadata)

        console.groupCollapsed(`fileMetadataList`)
        console.log(plugin.fileMetadataList)
        console.groupEnd();

        console.log(`Request: folderStructure change`)
        folderStructureOnModifyFile(plugin, file, newFileMetadataAdress);

        console.groupEnd();
    }

    plugin.ignoreNextModify = true;
    plugin.app.vault.modify(file, newContent)

    console.groupEnd();
}

export function syncTemplateStructureOnDeleteFile(plugin: TagsPlus, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`syncTemplateStructureOnDeleteFile(file: "${file.basename}")\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Updating Metadata`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Deleting the fileMetadata associated with the old path.`);
        console.groupEnd();
        console.groupEnd();
    }

    plugin.fileMetadataList.delete(file.path);

    console.groupCollapsed(`%cUpdated fileMetadataList`, `color: blue`)
    console.log(plugin.fileMetadataList)
    console.groupEnd()

    console.groupEnd();
}

//Types
/* Old types, replaced through custom functions
type replaceAll = {
    type: "replaceAll",
    old: RegExp,
    new: string
}
type attachOrDetachString = { 
    type: "attachToFront" | "detachFromFront" | "attachToBack" | "detachFromBack"
    string: string
}
type command = replaceAll | attachOrDetachString
*/




//Event Watcher Helpers

export function applyRelationships(plugin: TagsPlus, fromValToContentMap: Map<string, string>, relationships: {from: string, to: string, funcName: string, addArgs:any []}[]): Map<string, string> | "Overlap-Error" { 
    //Console Metadata
    {
        console.groupCollapsed(`applyRelationships(fromValNameAndContent: ..., relationships: ...)`);
        console.groupCollapsed(`...`)
        console.groupCollapsed(`fromValToContentMap`)
        console.log(fromValToContentMap)
        console.groupEnd();
        console.groupCollapsed(`relationships`)
        console.log(relationships)
        console.groupEnd()
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Getting a map that has every Relevant Output with the correct content.`,
            `\nThe rest of the contentBlocks, should be from the new Content Blocks from the User.`
        );
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Go through each from-value Name and Content,`,
            `\nget the relevantRelationships, by using the fromValName.`,
            `\nOnce relationships are given, us the value to apply them.`
        );
        console.groupEnd();
        console.groupEnd();
    }


    let toValToNewContentMaps: Map<string, string>[] = [];
    //Getting updatedVariablesMaps
    {
        console.groupCollapsed(`getting toValToNewContentMaps`)
        fromValToContentMap.forEach((content, fromVal) => {
            console.groupCollapsed(`fromVal: "${fromVal}" => content: ...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd();

            let relevantRelationships = relationships.filter(relationship => relationship.from == fromVal);
            console.groupCollapsed(`relationships`)
            console.dir(relevantRelationships)
            console.groupEnd();

            //Getting toValToNewContentMap, from the "fromValue" applied relationships
            let toValToNewContentMap: Map<string, string> = new Map();
            {
                console.groupCollapsed(`Getting toValToNewContentMap`)
                relevantRelationships.forEach(relevantRelationship => {
                    console.groupCollapsed(`relevantRelationship: ...`)
                    console.groupCollapsed(`...`)
                    console.dir(relevantRelationship)
                    console.groupEnd();
                    toValToNewContentMap.set(relevantRelationship.to, applyRelationship(plugin, content, relevantRelationship));    //content is the content from the current fromVal
                    console.groupEnd();
                })
                console.groupEnd();
            }

            toValToNewContentMaps.push(toValToNewContentMap)

            console.groupEnd();
        })
        console.groupEnd();
    }
    
    console.groupCollapsed(`toValToNewContentMaps`)
    console.dir(toValToNewContentMaps)
    console.groupEnd();

    //Check For Overlap
    let overlap = false;
    {
        console.groupCollapsed(`Check for Overlap`);

        let everyKey: string[] = [];
        toValToNewContentMaps.forEach(updatedVariablesMap => {
            updatedVariablesMap.forEach((value, key) => {
                everyKey.push(key)
            })
        })
        console.groupCollapsed(`everyKey`)
        console.log(everyKey)
        console.groupEnd();

        if(everyKey.length != everyKey.unique().length) {
            console.log(`%ceveryKey contains duplicats!`, `color: red`)
            overlap = true;
        }
        else {
            console.log(`%ceveryKey only has unique members!`, `color: green`)
        }
        console.groupEnd();
    }
    
    if(overlap) {
        //Warning Log
        {
            console.groupCollapsed(`%cWarning: Some relationships overlap each other!`, `color: red`);
            console.log(`Note:`)
            console.log(`Maybe there is a way that this error message gets logged even though there is no`,
                `\nactual conflicting overlap. Because when there is a relationship between 3 variables,`,
                `\nit is possible, that the user changed two variables according to his rules but the`,
                `\nlast variable should get updated automatically, in that case both of these changed content variables`,
                `\nwill try to change the third, both with the same rules but still this function will call an error.`,
                `\nSo if this is the case, you know what to do!`
            )
            console.group(`Fix`)
            console.log(`Change the relationships, so that there are no conflicing overlaps`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`Cant return Map, return empty Map.`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: "applyRelationships(...)`)
        }
        return "Overlap-Error";
    }

    let combinedMap: Map<string, string> = new Map();
    toValToNewContentMaps.forEach(map => {
        map.forEach((value, key) => {
            combinedMap.set(key, value)
        })
    })

    console.groupCollapsed(`%ccombinedMap`, `color: blue`)
    console.log(combinedMap)
    console.groupEnd();

    console.groupEnd();
    return combinedMap;
}

function applyRelationship(plugin: TagsPlus, fromVal: string, relationship: {from: string, to: string, funcName: string, addArgs: any[]}): string {
    //Console Metadata
    {
        console.groupCollapsed(`applyRelationship(fromVal: "${fromVal}",\n relationship: {from: "${relationship.from}", to: "${relationship.to}"}), funcName: "${relationship.funcName}`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Getting the to-Value`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(``);
        console.groupEnd();
        console.groupEnd();
    }

    let toVal= ""
    let func = plugin.combinedPluginSettings.customFuncList.get(relationship.funcName)
    if(!func) {
        //Warning Log
        {
            console.groupCollapsed(`%cWarning: func "${relationship.funcName}" not found`, `color: red`);
            console.group(`Fix`)
            console.log()
            console.groupEnd();
            console.group(`Consequence`)
            console.log()
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: `)
        }
        return fromVal
    }

    toVal = func(fromVal, ...relationship.addArgs)
    console.log(`toVal = "${toVal}"`)

    console.groupEnd();

    return toVal
}

export function applyNewContentBlocks(newContentBlocks: Map<string,string>, noteContentWithVariables: string): string {
    //Console Metadata
    {
        console.groupCollapsed(`applyNewContentBlocks(newContentBlocks: ..., noteContentWithVariables: ...)\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`...`)
        console.groupCollapsed(`newContentBlocks`)
        console.log(newContentBlocks)
        console.groupEnd();
        console.groupCollapsed(`noteContentWithVariables`)
        console.log(noteContentWithVariables)
        console.groupEnd();
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Building the new Note Content with the contentBlocks`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Taking the content with variables through an iterative process and updating each variable.`);
        console.groupEnd();
        console.groupEnd();
    }

    let returnContent: string = noteContentWithVariables;
    console.groupCollapsed(`updating every variable.`)
    newContentBlocks.forEach((value, key) => {
        console.groupCollapsed(`key: "${key}"`)
        console.groupCollapsed(`value`)
        console.log(value)
        console.groupEnd()

        returnContent = returnContent.replaceAll(`<{${key}}>`, value)
        
        console.groupCollapsed(`current content`)
        console.log(returnContent)
        console.groupEnd();
        console.groupEnd();
    })
    console.groupEnd();

    console.groupCollapsed(`%creturnContent`, `color: blue`)
    console.log(returnContent)
    console.groupEnd();

    console.groupEnd();
    return returnContent;
}

export function combineMaps(prioMap: Map<string, string>, map: Map<string, string>): Map<string, string> {
    //Console Metadata
    {
        console.groupCollapsed(`combineMaps(prioMap: ..., map: ...)`);
        console.groupCollapsed(`...`)
        console.groupCollapsed(`prioMap`)
        console.log(prioMap)
        console.groupEnd();
        console.groupCollapsed(`map`)
        console.log(map)
        console.groupEnd();
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Combining the maps into one map in wich overlaps are set to the prioMap`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`First combine every key into one unique array.`);
        console.groupEnd();
        console.groupEnd();
    }


    //Getting combinedKeys
    let combinedKeys: string[];
    let prioMapKeys: string[]
    let mapKeys: string[]
    {
        console.groupCollapsed(`combinedKeys`)

        prioMapKeys = Array.from(prioMap.keys());
        console.groupCollapsed(`prioMapKeys`)
        prioMapKeys.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();
        mapKeys = Array.from(map.keys());
        console.groupCollapsed(`mapKeys`)
        mapKeys.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();

        combinedKeys = prioMapKeys.concat(mapKeys).unique();
        console.groupEnd();
    }

    console.groupCollapsed(`combinedKeys`)
    combinedKeys.forEach((value, index) => console.log(`${index}: "${value}"`))
    console.groupEnd();
    
    //Getting combinedMap
    let combinedMap: Map<string, string> = new Map();
    {
        console.groupCollapsed(`Getting combinedMap`)
        combinedKeys.forEach(key => {
            console.groupCollapsed(`key = "${key}"`)
            let value: string;
            if(prioMapKeys.contains(key)) {
                console.log(`prioritizedMap contains key`)
                value = prioMap.get(key) as string
            }
            else {
                console.log(`normal map contains key`)
                value = map.get(key) as string
            }

            console.log(`%cvalue = "${value}"`, `color: blue`)
            combinedMap.set(key, value);

            console.groupEnd()
        })
        console.groupEnd()
    }

    console.groupCollapsed(`%ccombinedMap`, `color: blue`)
    console.log(combinedMap)
    console.groupEnd();

    console.groupEnd();
    return combinedMap;    
}

export function getProcessedNoteContentFromRawInputs(plugin: TagsPlus, fromValToContentMap: Map<string, string>, syncTemplateMetadata: SyncTemplateMetadataExtension): string {
    //Console Metadata
    {
        console.groupCollapsed(`getProcessedNoteContentFromRawInputs(fromValToContentMap:..., syncTemplateMetadata:...)`);
        console.groupCollapsed(`...`)
        console.groupCollapsed(`fromValToContentMap`)
        console.log(fromValToContentMap)
        console.groupEnd();
        console.groupCollapsed(`syncTemplateMetadata`)
        console.log(syncTemplateMetadata)
        console.groupEnd()
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`For "Note Creation", either from scanner or from the create note event.`, 
            `\nIn both cases a note content is need just from infos about name, tags and syncTemplate.`,
            `\nThis function provides an attempt for a note content, when given just the raw inputs of for example notizName and freieKategorien...`
        );
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Applying the relationships of every value, checking for overlap.`,
            `\nIf not there, combine Maps piece by piece, first with the new values from the relationships,`,
            `\nthen from the default values from the syncTemplateMetadata.`,
            `\nThen last step is to remove every contentVariabe that remains without value.`
        );
        console.groupEnd();
        console.groupEnd();
    }
    let processedNoteContent: string;

    let toValToContentMap = applyRelationships(plugin, fromValToContentMap, syncTemplateMetadata.relationships)
    if(toValToContentMap == "Overlap-Error") {
        //Warning Log
        {
            console.groupCollapsed(`%cOverlap-Warning: applyRelationships didnt work on file creation`, `color: red`);
            console.group(`Fix`)
            console.log(`Since this was called from creation, something is probably wrong with the logic of the syncTemplate`)
            console.log(`syncTemplate: "${syncTemplateMetadata.syncTemplateBaseName}"`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`Cant create file!`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.groupEnd();
            console.warn(`Error in: "getProcessedNoteContentFromRawInputs(...)"`)
        }
        return "";
    }
    console.groupCollapsed(`toValToContentMap`)
    console.log(toValToContentMap)
    console.groupEnd();

    let contentVariableToContentMap = combineMaps(toValToContentMap, fromValToContentMap)
    console.groupCollapsed(`contentVariableToContentMap`)
    console.log(contentVariableToContentMap)
    console.groupEnd();
    
    let completedContentVariableToContentMap = combineMaps(contentVariableToContentMap, syncTemplateMetadata.nameToDefaultConfigMap)
    console.groupCollapsed(`completedContentVariableToContentMap`)
    console.log(completedContentVariableToContentMap)
    console.groupEnd()
    
    
    processedNoteContent= applyNewContentBlocks(completedContentVariableToContentMap, syncTemplateMetadata.noteContentWithVariables)
    processedNoteContent = processedNoteContent.replaceAll(contentVariableRegEx, "");

    console.groupEnd();
    return processedNoteContent;
}

//Metadata functions and classes

export class FileMetadataExtension {

    fileBasename: string

    contentBlocks: Map<string, string> = new Map();
    plugin: TagsPlus
    syncTemplate: TFile
    syncTemplateActive: boolean;

    constructor(plugin: TagsPlus, fileContent: string, syncTemplate: TFile, fileBasename: string) {
        //Console Metadata
        {
            console.groupCollapsed(`new FileMetadataExtension(fileContent: ..., syncTemplate: ..., fileBasename: "${fileBasename}") \n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`fileContent`)
            console.log(fileContent)
            console.groupEnd();
            console.groupCollapsed(`syncTemplate`)
            console.dir(syncTemplate)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Holding Content Blocks of the Note as Metadata`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Getting the Tags, looking for the template the note was created with.`,
                `\n`
            );
            console.groupEnd();
            console.groupEnd();
        }
        this.plugin = plugin;
        this.syncTemplate = syncTemplate;
        this.fileBasename = fileBasename

        this.getContentBlocks(fileContent);
        

       console.groupEnd();
    }



    getContentBlocks(fileContent: string) {
         //Console Metadata
         {
            console.groupCollapsed(`getContentBlocks(fileContent: ...) \n>>TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`fileContent`)
            console.log(fileContent)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Getting the content blocks with the variable names and format from "${this.syncTemplate.basename}".`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Getting the Tags, looking for the template the note was created with.`,
                `\n`
            );
            console.groupEnd();
            console.groupEnd();
        }
        
        let syncTemplateExtension = this.plugin.syncTemplateMetadataList.get(this.syncTemplate.path)
        if(!syncTemplateExtension) {
            console.log(`%cError: no Entry of "${this.syncTemplate.path}" inside the list`, `color: red`)
            console.groupEnd();
            return;
        }
        if(!syncTemplateExtension.regEx) {
            console.log(`%c"${this.syncTemplate.basename}" has no regular expression!`, `color: red`)
            console.groupEnd();
            return;
        }
        if(!syncTemplateExtension.contentVariables) {
            console.log(`%c"${this.syncTemplate.basename}" has no contentVariables!`, `color: red`)
            console.groupEnd();
            return;
        }

        console.groupCollapsed(`fileContent`)
        console.log(fileContent)
        console.groupEnd()
        
        console.groupCollapsed(`syncTemplateExtension`)
        console.log(syncTemplateExtension)
        console.groupEnd();

    
        let contentBlockMatch = fileContent.match((syncTemplateExtension.regEx as RegExp))

        if(!contentBlockMatch || contentBlockMatch.length <= 1) {
            console.log(`%cContent did not match RegEx, or no content-blocks`, `color: red`)
            this.syncTemplateActive = false;
            console.groupEnd();
            return
        }
        this.syncTemplateActive = true;
        console.groupCollapsed(`contentBlockMatch`)
        console.log(contentBlockMatch)
        console.groupEnd();

        contentBlockMatch.remove(contentBlockMatch[0])
        contentBlockMatch.forEach((contentBlock, index) => {
            this.contentBlocks.set((syncTemplateExtension as SyncTemplateMetadataExtension).contentVariables[index], contentBlock)
        })

        console.groupCollapsed(`Updated Content Blocks`)
        console.log(this.contentBlocks)
        console.groupEnd();

        console.groupEnd();
        
    }
}

export class SyncTemplateMetadataExtension {

    plugin: Plugin;
    syncTemplateBaseName: string;


    //contents
    rawContent: string;
    noteContentForCreation: string;
    noteContentWithVariables: string;

    //notizName configuration
    notizNameUsedInContent: boolean;
    notizNameDefault: undefined | string;
    selectNotizNameDefault: boolean = true;

    nameToRegExConfigMap: Map<string, RegExp> = new Map();
    nameToTagBoundConfigMap: Map<string, string> = new Map();
    nameToDefaultConfigMap: Map<string, string> = new Map();
    //regExConfiguration: {[key: string]: RegExp} = {}
    contentVariables: string[] = [];
    regEx: RegExp | null;
    relationships: {from: string, to: string, funcName: string, addArgs: any[]}[] = [];
    relationshipVariables: string[] = [];

    constructor(plugin: TagsPlus, syncTemplateContent: string, syncTemplateBaseName: string) {
        //Console Metadata
        {
            console.groupCollapsed(`new SyncTemplateMetadataExtension(syncTemplateBaseName: "${syncTemplateBaseName}")\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Getting every relevent Data out of the Template Content, parsing it into useful Data.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Call every parsing method.`);
            console.groupEnd();
            console.groupEnd();
        }

        this.plugin = plugin;
        this.syncTemplateBaseName = syncTemplateBaseName;
        this.notizNameUsedInContent = false;
        /*
        The order is importent, contentVariables need to be ready before parsing the Relationships
        because, parseRelationships has to know if notizName is used. If so, it gets added to relationshipVariables
        */
        this.updateContentVariables(syncTemplateContent)
        this.parseFormatConfiguration(syncTemplateContent)
        this.parseRelationships(syncTemplateContent)
        this.buildContents(syncTemplateContent)
        this.buildRegEx(syncTemplateContent)
        this.rawContent = syncTemplateContent;

        console.groupCollapsed(`%cCreated: SyncTemplateMetadataExtension`, `color: blue`)
        console.log(this)
        console.groupEnd();

        console.groupEnd();
    }

    parseFormatConfiguration(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`parseFormatConfiguration(content: ...) \n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd();
            console.groupEnd()
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Parsing the syntax in a way where the naming conventions can be checked.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`RegEx`);
            console.groupEnd();
            console.groupEnd();
        }

        const formatConfigurationBlockRegEx = /(?<=<!\n)[\w\W]+(?=\n!!)/g
        const formatConfigurationBlockMatch = content.match(formatConfigurationBlockRegEx)
        if(!formatConfigurationBlockMatch) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: No configuration block found`, `color: red`);
                console.group(`Fix`)
                console.log(`Check formating of the Sync Template if this block is relevant`)
                console.log(`formatConfigurationBlockRegEx = ${formatConfigurationBlockRegEx}`)
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Cant use any of the configurations, so every variable gets the default setting!`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: parseFormatConfiguration(...)`)
            }
            return
        }
        const formatConfigurationBlock = formatConfigurationBlockMatch[0];
        console.groupCollapsed(`formatConfigurationBlock`)
        console.log(formatConfigurationBlock)
        console.groupEnd();

        let singleLines: string[] = formatConfigurationBlock.replaceAll("\n", "").split(/(?<!\\);/).filter(singleLine => singleLine);
        console.groupCollapsed(`singleLines`)
        singleLines.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd(); 

        //Getting nameToConfigMap
        let nameToConfigMap: Map<string, string> = new Map()
        console.groupCollapsed(`Getting nameToConfigMap`)
        singleLines.forEach((singleLine, index) => {
            console.groupCollapsed(`${index}: "${singleLine}"`)
            let splitLine = singleLine.split(/===/)
                if(splitLine.length != 2) {
                    //Warning Log
                    {
                        console.groupCollapsed(`%cWarning: the "===" split didnt work.`, `color: red`);
                        console.group(`Fix`)
                        console.log(`Check if its the right number of eq signs.`)
                        console.groupEnd();
                        console.group(`Consequence`)
                        console.log(`Cant parse the line.`)
                        console.groupEnd();
                        console.groupEnd()
                        console.groupEnd();
                        console.warn(`Error in: "${index}: "${singleLine}""`)
                    }
                    return
                }
                
                let nameRaw: string = splitLine[0]
                let configRaw: string = splitLine[1]

                console.log(`nameRaw = "${nameRaw}"`)
                console.log(`configRaw = "${configRaw}"`)

                let name = nameRaw.trim()
                let config = configRaw.trim();
                console.log(`name = "${name}"`)
                console.log(`config = "${config}"`)

                if(name.contains(` `)) {
                    //Warning Log
                    {
                        console.groupCollapsed(`%cWarning: name still has whiteSpaces.`, `color: red`);
                        console.group(`Fix`)
                        console.log(`Remove whitespaces`)
                        console.groupEnd();
                        console.group(`Consequence`)
                        console.log(`cant parse config`)
                        console.groupEnd();
                        console.groupEnd()
                        console.groupEnd();
                        console.warn(`Error in: "${index}: "${singleLine}""`)
                    }
                    return
                }

                nameToConfigMap.set(name, config)
                
            console.groupEnd();
        })
        console.groupEnd()

        console.groupCollapsed(`%cnameToConfigMap`, `color: blue`)
        console.log(nameToConfigMap)
        console.groupEnd();

        let names: string[] = Array.from(nameToConfigMap.keys())
        console.groupCollapsed(`%cnames`, `color: blue`)
        names.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();

        this.nameToDefaultConfigMap = parseDefaultConfig(names, nameToConfigMap)
        this.nameToRegExConfigMap = parseRegExConfiguration(names, nameToConfigMap)
        this.nameToTagBoundConfigMap = parseBoundTagConfiguration(names, nameToConfigMap)
        parseNameConfig.bind(this)(names, nameToConfigMap)
        

        console.groupEnd();

        
        function parseNameConfig(names: string[], nameToConfigMap: Map<string, string>): void {
            //Console Metadata
            {
                console.groupCollapsed(`parseRegExConfiguration(names: ...,nameToConfigMap: ...)\n>> TagsPlus: SyncTemplateManager`);
                console.groupCollapsed(`...`)
                console.groupCollapsed(`names`)
                names.forEach((value, index) => console.log(`${index}: "${value}"`))
                console.groupEnd();
                console.groupCollapsed(`nameToConfigMap`)
                console.log(nameToConfigMap)
                console.groupEnd();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Looking for name configurations and setting the sync Template status accordingly`);
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Update stuff`);
                console.groupEnd();
                console.groupEnd();
            }

            if(names.contains("notizNameDefault")) {
                console.log(`%cnotizNameDefault found:` , `color: green`)
                let notizNameDefault: string = nameToConfigMap.get(`notizNameDefault`) as string
                console.log(`notizNameDefault = "${notizNameDefault}"`)
                this.notizNameDefault = notizNameDefault
            }
            else {
                console.log(`notizName not found`, `color: red`)
                this.notizNameDefault = undefined;
            }


            if(names.contains(`selectNotizNameDefault`)) {
                console.log(`%cselectNotizNameDefault found:`, `color: green`)
                let selectNotizNameDefault: boolean = true;
                if(nameToConfigMap.get("selectNotizNameDefault") as string == "true") {
                    console.log(`set to true`)
                    selectNotizNameDefault = true
                }
                else if(nameToConfigMap.get("selectNotizNameDefault") as string == "false") {
                    console.log(`set to false`)
                    selectNotizNameDefault = false;
                }
                else {
                    console.log(`neither true nor false, set to true`)
                }

                console.log(`selectNotizNameDefault = ${selectNotizNameDefault}`)
            }
            else {
                console.log(`%cselectNotizNameDefault not found:`, `color: red`)
            }

            console.groupEnd()
        }
        function parseRegExConfiguration(names: string[], nameToConfigMap: Map<string, string>): Map<string, RegExp> {
            //Console Metadata
            {
                console.groupCollapsed(`parseRegExConfiguration(names:..., nameToConfigMap: ...)\n>> TagsPlus: SyncTemplateManager`);
                console.groupCollapsed(`...`)
                console.groupCollapsed(`names`)
                names.forEach((value, index) => console.log(`${index}: "${value}"`))
                console.groupEnd();
                console.groupCollapsed(`nameToConfigMap`)
                console.log(nameToConfigMap)
                console.groupEnd();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Parsing the regExConfiguration for the contentVariables into the syncTemplate value`);
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Looking for variablesWith "RegExFormat" at the end.`);
                console.groupEnd();
                console.groupEnd();
            }

            let namesForRegExConfig = names.filter(name => name.contains(`RegExConfig`))
            console.groupCollapsed(`namesForRegExConfig`)
            console.log(namesForRegExConfig)
            console.groupEnd();

            console.groupCollapsed(`Getting nameToRegExConfigMap`)
            let nameToRegExConfigMap: Map<string, RegExp> = new Map();
            namesForRegExConfig.forEach(nameForRegExConfig => {
                console.groupCollapsed(`nameForRegExConfig = "${nameForRegExConfig}`)

                let regExString = nameToConfigMap.get(nameForRegExConfig) as string
                console.log(`regExString = "${regExString}"`)
                let regEx = new RegExp(regExString)
                console.log(`regEx = "${regEx}"`)

                let contentVariable: string = nameForRegExConfig.slice(0, nameForRegExConfig.length - "RegExConfig".length)
                console.log(`contentVariable = "${contentVariable}"`)

                nameToRegExConfigMap.set(contentVariable, regEx)

                console.groupEnd();
            })
            console.groupEnd()

            console.groupCollapsed(`%cnameToRegExConfigMap`, `color: blue`)
            console.log(nameToRegExConfigMap)
            console.groupEnd();

            console.groupEnd();
            return nameToRegExConfigMap;
        }
        function parseBoundTagConfiguration(names: string[], nameToConfigMap: Map<string, string>): Map<string, string> {
            //Console Metadata
            {
                console.groupCollapsed(`parseBoundTagConfiguration(names:..., nameToConfigMap: ...)\n>> TagsPlus: SyncTemplateManager`);
                console.groupCollapsed(`...`)
                console.groupCollapsed(`names`)
                names.forEach((value, index) => console.log(`${index}: "${value}"`))
                console.groupEnd();
                console.groupCollapsed(`nameToConfigMap`)
                console.log(nameToConfigMap)
                console.groupEnd()
                console.groupEnd()
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Filtering the notes that are relevant for the tagBound feature`);
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Looking for variables with "TagBind" at the end.`);
                console.groupEnd();
                console.groupEnd();
            }

            let namesForBoundTagConfig: string[] = names.filter(name => name.contains(`TagBind`))
            console.groupCollapsed(`%cnamesForBoundTagConfig`, `color: blue`)
            namesForBoundTagConfig.forEach((value, index) => console.log(`${index}: "${value}"`))
            console.groupEnd();

            console.groupCollapsed(`Getting nameToRegExConfigMap`)
            let nameToTagBoundConfigMap: Map<string, string> = new Map();
            namesForBoundTagConfig.forEach(nameForBoundTagConfig => {
                console.groupCollapsed(`nameForBoundTagConfig = "${nameForBoundTagConfig}`)

                let tagBoundConfig: string = nameToConfigMap.get(nameForBoundTagConfig) as string
                console.log(`tagBoundConfig = "${tagBoundConfig}"`)

                let contentVariable: string = nameForBoundTagConfig.slice(0, nameForBoundTagConfig.length - "TagBind".length)
                console.log(`contentVariable = "${contentVariable}"`)

                nameToTagBoundConfigMap.set(contentVariable, tagBoundConfig)

                console.groupEnd();
            })
            console.groupEnd()

            console.groupCollapsed(`%cnameToTagBoundConfigMap`, `color: blue`)
            console.log(nameToTagBoundConfigMap)
            console.groupEnd();

            console.groupEnd();
            return nameToTagBoundConfigMap
        }
        function parseDefaultConfig(names: string[], nameToConfigMap: Map<string, string>): Map<string, string> {
            //Console Metadata
            {
                console.groupCollapsed(`parseDefaultConfig(names:..., nameToConfigMap: ...)\n>> TagsPlus: SyncTemplateManager`);
                console.groupCollapsed(`...`)
                console.groupCollapsed(`names`)
                names.forEach((value, index) => console.log(`${index}: "${value}"`))
                console.groupEnd();
                console.groupCollapsed(`nameToConfigMap`)
                console.log(nameToConfigMap)
                console.groupEnd()
                console.groupEnd()
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Filtering the notes that are relevant for the default feature`);
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Looking for variables with "Default" at the end, except notizNameDefault`);
                console.groupEnd();
                console.groupEnd();
            }

            let namesForDefaultConfig: string[] = names.filter(name => name.contains("Default") && !name.contains("notizName"))
            console.groupCollapsed(`namesForDefaultConfig`)
            namesForDefaultConfig.forEach((value, index) => console.log(`${index}: "${value}"`))
            console.groupEnd();

            let nameToDefaultConfigMap: Map<string, string> = new Map();
            console.groupCollapsed(`Getting nameToDefaultConfigMap`)
            namesForDefaultConfig.forEach(nameForDefaultConfig => {
                console.groupCollapsed(`nameForDefaultConfig = "${nameForDefaultConfig}"`)

                let contentVariable: string = nameForDefaultConfig.slice(0, nameForDefaultConfig.length - "DefaultConfig".length)
                console.log(`contentVariable = "${contentVariable}"`)

                let defaultConfig: string = nameToConfigMap.get(nameForDefaultConfig) as string
                console.log(`defaultConfig = "${defaultConfig}"`)

                nameToDefaultConfigMap.set(contentVariable, defaultConfig)

                console.groupEnd()
            })
            console.groupEnd()

            console.groupCollapsed(`%cnameToDefaultConfigMap`, `color: blue`)
            console.log(nameToDefaultConfigMap)
            console.groupEnd()

            console.groupEnd();
            return nameToDefaultConfigMap;
        }
    }
    /*parseRegExConfiguration(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`parseRegExConfiguration(content: ...) >> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd();
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
        const regExConfigurationParse: RegExp = /(?<=<!\n)[\w\W]+(?=\n!!)/g //Needs Improvement

        let regExConfigurationMatch = content.match(regExConfigurationParse);
        if(!regExConfigurationMatch) {
            console.log(`%cNo configuration match!`, `color: red`)
            console.groupEnd();
            return
        }
        let regExConfigurationBlock: string = regExConfigurationMatch[0];
        console.groupCollapsed(`regExConfigurationBlock`)
        console.log(regExConfigurationBlock)
        console.groupEnd();

        let singleLines: string[] = regExConfigurationBlock.replaceAll("\n", "").split(";").filter(singleLine => singleLine);
        console.groupCollapsed(`singleLines`)
        singleLines.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd(); 

        //Getting variableNames and regExStrings
        let returnPairs: [string, RegExp][]
        {
            console.groupCollapsed(`Getting variableNames and regExs`)
            let throwError: boolean = false;
            returnPairs = singleLines.map(singleLine => {
                console.groupCollapsed(`Split: "${singleLine}"`);
                let splitLine = singleLine.split("===")
                if(splitLine.length != 2) {
                    console.log(`%cError: Not just one or not any: "==="`)
                    throwError = true
                    console.groupEnd();
                    return ["", new RegExp("")];
                }
                let variableNameRaw: string = splitLine[0];
                let regExStringRaw: string = splitLine[1];
                console.log(`variableNameRaw = "${variableNameRaw}"`)
                console.log(`regExStringRaw = "${regExStringRaw}"`);
    
                let variableName = variableNameRaw.replaceAll(` `, "")
                let regExString = regExStringRaw.trim().slice(1, regExStringRaw.length - 2);
                console.log(`variableName = "${variableName}"`)
                console.log(`regExString = "${regExString}"`);
                
                let regEx: RegExp = new RegExp(regExString)
                console.log(`regEx = ${regEx}`)
                console.groupEnd();
                return [variableName, regEx];
            })
            console.groupEnd();
            if(throwError) {
                console.log(`%cProcess was interrupted`, `color: red`);
                console.groupEnd();
                return;
            }
        }
        
        console.groupCollapsed(`variableNames and regExs`)
        returnPairs.forEach((pair, index) => console.log(`${index}: ["${pair.join(`", "`)}"]`))
        console.groupEnd();

        returnPairs.forEach(pair => this.regExConfiguration[pair[0]] = pair[1]);

        //Getting tagBoundVariablesToTagValueMap
        let tagBoundVariablesToTagValueMap: Map<string, string> = new Map()

        console.groupCollapsed(`Getting tagBoundVariablesToTagValueMap`)
        returnPairs.forEach(pair => {
            console.groupCollapsed(`pair = ["${pair[0]}", "${pair[1]}"]`)

            console.log(`pair[0].slice(pair[0].length - "TagBound".length = "${pair[0].slice(pair[0].length - "TagBound".length)}"`)
            if(pair[0].slice(pair[0].length - "TagBound".length) == "TagBound") {
                console.log(`%cIs tag bound`, `color: green`)
                tagBoundVariablesToTagValueMap.set(pair[0], pair[1])
            }
            else {
                console.log(`Not a tagBound content Variable`)
            }

            console.groupEnd();
        })
        console.groupEnd();

        console.groupCollapsed(`tagBoundVariablesToTagValueMap`)
        console.log(tagBoundVariablesToTagValueMap)
        console.groupEnd();

        console.groupEnd()
    }*/
    parseRelationships(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`parseRelationships() >> SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Parsing the second Configuration Block into relationships`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }
        let returnArray: {from: string, to: string, funcName: string, addArgs: any[]}[] = [];

        //Getting relationshipStrings
        let relationshipRawStrings: string[] = [];
        {
            console.groupCollapsed(`Getting relationshipRawStrings`)

            const relationshipsBlockRegEx = /(?<=!!\n)[\w\W]*(?=\n!>)/g

            let relationshipsBlockMatch = content.match(relationshipsBlockRegEx)
            if(!relationshipsBlockMatch) {
                //Warning Log
                {
                    console.groupCollapsed(`%cParse-Warning: No valid relationshipBlock`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Check Syntax on "${this.syncTemplateBaseName}"`)
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`Relationships cant be read, just means that if`,
                        `\nthere are relationship configurations, it cant be read!`
                    )
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: Getting relationshipRawStrings`)
                    console.groupEnd();
                    console.warn(`Error in: parseRelationships()`)
                }
                return;
            }
            let relationshipsBlock: string = relationshipsBlockMatch[0];
    
            console.groupCollapsed(`relationshipsBlock`)
            console.log(relationshipsBlock)
            console.groupEnd();
    
            relationshipRawStrings = relationshipsBlock.replaceAll(`\n`, ``).split(`;`).filter(singleLine => singleLine);
            console.groupEnd();
        }
        console.groupCollapsed(`relationshipStrings`)
        relationshipRawStrings.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();
    

        console.groupCollapsed(`Parsing relationshipStrings`)
        relationshipRawStrings.forEach((relationshipRawString, index) => {
            console.groupCollapsed(`relationshipString = "${relationshipRawString}"`)
            
            const relationshipRawStringFormat: RegExp = /^[\w]+-->[\w]+\(([\w"]+, *)*([\w"]+)?\)-->[\w]+$/
            if(!relationshipRawStringFormat.test(relationshipRawString)) {
                //Warning Log
                {
                    console.groupCollapsed(`%cParse-Warning: "${relationshipRawString}" is not correctly formatted!`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Check Syntax`)
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`"${relationshipRawString}" will not be parsed!`)
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: "relationshipString = "${relationshipRawString}""`)
                }
                return
            }


            let seperation: [string, string, string] = relationshipRawString.split(`-->`) as [string, string, string]
            console.groupCollapsed(`seperation`)
            seperation.forEach((value, index) => console.log(`${index}: "${value}"`))
            console.groupEnd();
            let fromVal: string = seperation[0]
            let toVal: string = seperation[2]

            //Parsin func and args
            let funcName: string;
            let addArgs: any[] = []
            {
                console.groupCollapsed("Parsin func and args")
                let rawFuncString: string = seperation[1]
                console.log("rawFuncString = " + rawFuncString)
                let funcparse: RegExp = /(\w+)\((.*)\)/
                let funcStringMatch = rawFuncString.match(funcparse)
                if(!funcStringMatch || !funcStringMatch[1] || !funcStringMatch[2]) {
                    //Warning Log
                    {
                        console.groupCollapsed(`%cWarning: no regex match for a function`, `color: red`);
                        console.group(`Fix`)
                        console.log()
                        console.groupEnd();
                        console.group(`Consequence`)
                        console.log()
                        console.groupEnd();
                        console.groupEnd()
                        console.groupEnd();
                        console.warn(`Error in: Parsin func and args`)
                    }
                    return
                }

                addArgs = funcStringMatch[2].split(",").map(val => parseArg(val))

                funcName = funcStringMatch[1]
                
                console.log("funcName: "+funcName)
                console.log("args:")
                console.log(addArgs)

                console.groupEnd()
            }
            

            //Updating RelationshipVariables
            {
                console.groupCollapsed(`Updating RelationshipVariables`)
                if(!this.relationshipVariables.contains(fromVal)){
                    console.log(`%c"${toVal}" was not added yet.`, `color: blue`)
                    this.relationshipVariables.push(fromVal)
                }
                else console.log(`"${fromVal} is already inside relationshipVariables`)
                if(!this.relationshipVariables.contains(toVal)){ 
                    console.log(`%c"${toVal}" was not added yet.`, `color: blue`)
                    this.relationshipVariables.push(toVal)
                }
                else console.log(`"${fromVal} is already inside relationshipVariables`)

                console.groupEnd();
            }


            returnArray.push({
                from: fromVal,
                to: toVal,
                funcName: funcName,
                addArgs: addArgs
            })
                
            console.groupEnd()
        })
        console.groupEnd();


        console.groupCollapsed(`relationshipVariables`)
        this.relationshipVariables.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();

        console.groupCollapsed(`returnArray`)
        console.log(returnArray)
        console.groupEnd();

        this.relationships = returnArray;
        console.groupEnd();

    }
    /*parseRelationships(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`parseRelationships() >> SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Parsing the second Configuration Block into relationships`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }
        let returnArray: {from: string, to: string, rules: command[]}[] = [];

        //Getting relationshipStrings
        let relationshipRawStrings: string[] = [];
        {
            console.groupCollapsed(`Getting relationshipRawStrings`)

            const relationshipsBlockRegEx = /(?<=!!\n)[\w\W]*(?=\n!>)/g

            let relationshipsBlockMatch = content.match(relationshipsBlockRegEx)
            if(!relationshipsBlockMatch) {
                //Warning Log
                {
                    console.groupCollapsed(`%cParse-Warning: No valid relationshipBlock`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Check Syntax on "${this.syncTemplateBaseName}"`)
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`Relationships cant be read, just means that if`,
                        `\nthere are relationship configurations, it cant be read!`
                    )
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: Getting relationshipRawStrings`)
                    console.groupEnd();
                    console.warn(`Error in: parseRelationships()`)
                }
                return;
            }
            let relationshipsBlock: string = relationshipsBlockMatch[0];
    
            console.groupCollapsed(`relationshipsBlock`)
            console.log(relationshipsBlock)
            console.groupEnd();
    
            relationshipRawStrings = relationshipsBlock.replaceAll(`\n`, ``).split(`;`).filter(singleLine => singleLine);
            console.groupEnd();
        }

        console.groupCollapsed(`relationshipStrings`)
        relationshipRawStrings.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();
    
        console.groupCollapsed(`Parsing relationshipStrings`)
        relationshipRawStrings.forEach((relationshipRawString, index) => {
            console.groupCollapsed(`relationshipString = "${relationshipRawString}"`)
            
            const relationshipRawStringFormat: RegExp = /^[\w\W]+-->(?:replaceAll\("[\w\W]+?","[\w\W]+?"\)|(?:(?:attachToFront|detachFromFront|attachToBack|detachFromBack)\("[\w\W]+?"\)))(?:&&&(?:replaceAll\("[\w\W]+?","[\w\W]+?"\)|(?:(?:attachToFront|detachFromFront|attachToBack|detachFromBack)\("[\w\W]+?"\))))*-->[\w\W]+$/
            if(!relationshipRawStringFormat.test(relationshipRawString)) {
                //Warning Log
                {
                    console.groupCollapsed(`%cParse-Warning: "${relationshipRawString}" is not correctly formatted!`, `color: red`);
                    console.group(`Fix`)
                    console.log(`Check Syntax`)
                    console.groupEnd();
                    console.group(`Consequence`)
                    console.log(`"${relationshipRawString}" will not be parsed!`)
                    console.groupEnd();
                    console.groupEnd()
                    console.groupEnd();
                    console.warn(`Error in: "relationshipString = "${relationshipRawString}""`)
                }
                return
            }

            let mainSeperation: [string, string, string] = relationshipRawString.split(`-->`) as [string, string, string]
            console.groupCollapsed(`mainSeperation`)
            mainSeperation.forEach((value, index) => console.log(`${index}: "${value}"`))
            console.groupEnd();
            let fromVal: string = mainSeperation[0]
            let toVal: string = mainSeperation[2]
            console.log(`fromVal = "${fromVal}"`)
            console.log(`toVal = "${toVal}"`)

            //Updating RelationshipVariables
            {
                console.groupCollapsed(`Updating RelationshipVariables`)
                if(!this.relationshipVariables.contains(fromVal)){
                    console.log(`%c"${toVal}" was not added yet.`, `color: blue`)
                    this.relationshipVariables.push(fromVal)
                }
                else console.log(`"${fromVal} is already inside relationshipVariables`)
                if(!this.relationshipVariables.contains(toVal)){ 
                    console.log(`%c"${toVal}" was not added yet.`, `color: blue`)
                    this.relationshipVariables.push(toVal)
                }
                else console.log(`"${fromVal} is already inside relationshipVariables`)
            }


            console.groupEnd();

            let commandStrings: string[] = mainSeperation[1].split(`&&&`)
            console.groupCollapsed(`singleCommands`)
            commandStrings.forEach((singleCommandString, index) => console.log(`${index}: "${singleCommandString}"`));
            console.groupEnd();

            //Parsing commands and negatedCommands
            let commands: command[] = [];
            let negatedCommands: command[] = [];
            {
                console.groupCollapsed(`parsing singleCommands`)
                const parenthesisValueRegEx = /(?<=\()[\w\W]+(?=\))/g

                commandStrings.forEach(commandString => {
                    console.groupCollapsed(`singleCommand = "${commandString}"`)
                    let parenthesisValue: string = (commandString.match(parenthesisValueRegEx) as RegExpMatchArray)[0]
                    console.log(`parenthesisValue = "${parenthesisValue}"`)
                    
                    if(/replaceAll/g.test(commandString)) {
                        console.log(`type: replaceAll`)
                        let parenthesisValueSplit: string[] = parenthesisValue.split(`,`).map(value => value.slice(1, value.length - 1))
                        let oldVal: string = parenthesisValueSplit[0]
                        let newVal: string = parenthesisValueSplit[1]
                        console.log(`oldVal = "${oldVal}"`)
                        console.log(`newVal = "${newVal}`)

                        let oldValRegEx: RegExp = new RegExp(oldVal, "g")
                        console.log(`oldValRegEx = ${oldValRegEx}`)
                        let newValRegEx: RegExp = new RegExp(stringIntoRegExString(newVal), "g")
                        console.log(`newValRegEx = ${newValRegEx}`)

                        commands.push({type: "replaceAll", old: oldValRegEx, new: newVal} as replaceAll);
                        negatedCommands.push({type: "replaceAll", old: newValRegEx, new: oldVal} as replaceAll)
                    }
                    else {
                        let slicedParenthesisValue = parenthesisValue.slice(1, parenthesisValue.length - 1)
                        console.log(`slicedParenthesisValue = "${parenthesisValue}"`)

                        if(/attachToFront/g.test(commandString)) {
                            console.log(`type: attatchToFront`)
                            commands.push({type: "attachToFront", string: slicedParenthesisValue} as attachOrDetachString)
                            negatedCommands.push({type: "detachFromFront", string: slicedParenthesisValue} as attachOrDetachString)
                        }
                        else if(/detachFromFront/g.test(commandString)) {
                            console.log(`type: detachFromFront`)
                            commands.push({type: "detachFromFront", string: slicedParenthesisValue} as attachOrDetachString)
                            negatedCommands.push({type: "attachToFront", string: slicedParenthesisValue} as attachOrDetachString)
                        }
                        else if(/attachToBack/g.test(commandString)) {
                            console.log(`type: attachToBack`)
                            commands.push({type: "attachToBack", string: slicedParenthesisValue} as attachOrDetachString)
                            negatedCommands.push({type: "detachFromBack", string: slicedParenthesisValue} as attachOrDetachString)
                        }
                        else if(/detachFromBack/g.test(commandString)) {
                            console.log(`type: detachFromBack`)
                            commands.push({type: "detachFromBack", string: slicedParenthesisValue} as attachOrDetachString)
                            negatedCommands.push({type: "attachToBack", string: slicedParenthesisValue} as attachOrDetachString)
                        }

                    }


                    console.groupEnd();
                })
                console.groupEnd();
            }

            console.groupCollapsed(`commands`)
            console.log(commands)
            console.groupEnd();

            console.groupCollapsed(`negatedCommands`)
            console.log(commands)
            console.groupEnd();

            returnArray.push({
                from: fromVal,
                to: toVal,
                rules: commands
            })
            returnArray.push({
                from: toVal,
                to: fromVal,
                rules: negatedCommands
            })
                
            console.groupEnd()
        })
        console.groupEnd();


        console.groupCollapsed(`relationshipVariables`)
        this.relationshipVariables.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();

        console.groupCollapsed(`returnArray`)
        console.log(returnArray)
        console.groupEnd();

        this.relationships = returnArray;
        console.groupEnd();

    }*/
    buildContents(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`buildContents(content: ...)\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content:`)
            console.log(content)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Build the initial Content of the Notes`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Removing each Backend Logic Text From the Content for noteContent.`,
                `\nLeave Content Variables for noteContentWithVariables.`
            );
            console.groupEnd();
            console.groupEnd();
        }

        let contentWithoutConfig = content.replaceAll(configurationRegEx, "")    
        console.groupCollapsed(`contentWithoutConfig`)
        console.log(contentWithoutConfig)
        console.groupEnd();


        /*
        if(!this.syncActive) {
            console.log(`%cSync is not active -> just build noteContentForCreation`, `color: red`)

            //Getting noteContentForCreation
            let noteContentForCreation: string;
            {
                console.groupCollapsed(`Getting noteContentForCreation`)
                if(!this.contentVariables.contains(`freieKategorien`)) {
                    console.log(`freieKategorien is missing for basic noteCreation -> add to top.`)
                    noteContentForCreation = `((freieKategorien))\n${contentWithoutConfig}`
                }
                else {
                    console.log(`freieKategorien is already added -> replace parenthesis`)
                    noteContentForCreation = contentWithoutConfig.replaceAll(`<{freieKategorien}>`, `((freieKategorien))`)
                }
                console.groupEnd();
            }


            console.groupCollapsed(`noteContentForCreation`)
            console.log(noteContentForCreation)
            console.groupEnd();

            this.noteContentForCreation = noteContentForCreation;
            

            return;
        }
        */
        let noteContentWithContentVariables: string = contentWithoutConfig;

        console.groupCollapsed(`%cnoteContentWithContentVariables`, `color: blue`)
        console.log(noteContentWithContentVariables)
        console.groupEnd();

        this.noteContentWithVariables = noteContentWithContentVariables;

        //Getting noteContentForCreation
        let noteContentForCreation = contentWithoutConfig; // start point
        {
            console.groupCollapsed(`noteContentForCreation`)
            noteContentForCreation = noteContentForCreation.replaceAll(`<{freieKategorien}>`, `((freieKategorien))`)
            noteContentForCreation = noteContentForCreation.replaceAll(`<{notizName}>`, `((notizName))`)
            console.groupCollapsed(`content after freieKategorien and notizName replacement`)
            console.log(noteContentForCreation)
            console.groupEnd()

            console.groupEnd()
        }
        console.groupCollapsed(`%cnoteContentForCreation`, `color: blue`)
        console.log(noteContentForCreation)
        console.groupEnd()
        this.noteContentForCreation = noteContentForCreation;

        console.groupEnd();
    }
    buildRegEx(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`buildRegEx(content:...) \n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Building the regular expression, that will be used to extract content-variables from Notes.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }

        if(this.contentVariables.length == 0) {
            console.log(`Template has no content blocks`)
            this.regEx = null
            console.groupEnd()
            return
        }

        let contentWithoutConfig = this.noteContentWithVariables;

        console.groupCollapsed(`Replacing contentVariables with Regex-strings`)
        this.contentVariables.forEach((contentVariable, index) => {
            console.groupCollapsed(`${index}: "${contentVariable}"`)
            if(!this.nameToRegExConfigMap.get(contentVariable)) {
                console.log(`%cNo regEx Configuration for "${contentVariable}"!`, `color: red`)
                if(contentVariable == "notizName") {
                    console.log(`%c ->Set to default notizNameRegEx`, `color: blue`)
                    this.nameToRegExConfigMap.set(contentVariable, notizNameDefaultRegExp)
                }
                else {
                    console.log(`%c ->Set to default`, `color: blue`)
                    this.nameToRegExConfigMap.set(contentVariable, defaultRegEx);
                }
            }
            console.log(`this.nameToRegExConfigMap.get("${contentVariable}") = "${this.nameToRegExConfigMap.get(contentVariable)?.source}"`)
      
            let replaceRegEx: RegExp = new RegExp(`${(stringIntoRegExString(`<{${contentVariable}}>`))}(?: *?)`, `g`);
            console.groupCollapsed(`replaceRegEx`)
            console.log(replaceRegEx)
            console.groupEnd();

            contentWithoutConfig = contentWithoutConfig.replaceAll(replaceRegEx, `(${this.nameToRegExConfigMap.get(contentVariable)?.source})(?: *?)`)
            console.groupCollapsed(`current content`)
            console.log(contentWithoutConfig)
            console.groupEnd();
            console.groupEnd();
        })
        console.groupEnd()

        let returnRegEx: RegExp = new RegExp(contentWithoutConfig)
        console.groupCollapsed(`returnRegEx`)
        console.log(returnRegEx)
        console.groupEnd();

        this.regEx = returnRegEx;
        console.groupEnd();
    }
    updateContentVariables(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`updateContentVariables(content: ...) \n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Getting a list variable names for the content Blocks.`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Matching content with the contentVariable RegEx`);
            console.groupEnd();
            console.groupEnd();
        }

        let contentVariableMatches = content.match(contentVariableRegEx);

        console.groupCollapsed(`contentVariableMatches`)
        console.log(contentVariableMatches)
        console.groupEnd();

        let contentVariables: string[] = [];
        console.groupCollapsed(`Getting contentVariables`)
        contentVariableMatches?.forEach(contentVariableMatch => {
            console.log(`contentVariableMatch = "${contentVariableMatch}"`)
            console.log(`contentVariableMatch.slice(2, contentVariableMatch.length - 2) = "${contentVariableMatch.slice(2, contentVariableMatch.length - 2)}"`)
            contentVariables.push(contentVariableMatch.slice(2, contentVariableMatch.length - 2));
        })
        console.groupEnd();

        this.contentVariables = contentVariables;

        //Extra Handling for notizName
        if(this.contentVariables.contains(`notizName`)) {
            this.notizNameUsedInContent = true;
        }
        console.log(`%notizNameUsedInContent = ${this.notizNameUsedInContent}`)
        console.groupEnd();
        return;
    }

    /*
    replaceVariablesInContent(boundTags: Map<string, string>) {
        //Console Metadata
        {
            console.groupCollapsed(`replaceVariablesInContent(boundTags:...)\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`...`)
            console.groupCollapsed(`boundTags`)
            console.log(boundTags)
            console.groupEnd()
            console.groupEnd()
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Replacing every content Variable, either with a bound Tag, if so configured or the default.`
            );
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }


    }*/

}   

export function loadSyncTemplateMetadata(plugin: TagsPlus): void {
    //Console Metadata
    {
        console.groupCollapsed(`loadSyncTemplateMetadata() \n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Creating the list inside the plugin runtime, that stores metadata about the SyncTemplates.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Getting every SyncTemplate and then going through them creating SyncTemplateMetadataExtensions`);
        console.groupEnd();
        console.groupEnd();
    }

    let syncTemplateFolder = plugin.app.vault.getFolderByPath(`Plugin Ordner/Sync Templates`)
    if(!syncTemplateFolder) {
        console.log(`%cError: No SyncTemplate Folder Found!`, `color: red`)
        console.groupEnd();
        return;
    }

    let syncTemplates = syncTemplateFolder.children.filter(syncTemplate => syncTemplate instanceof TFile);
    console.groupCollapsed(`syncTemplates`)
    console.log(syncTemplates)
    console.groupEnd();

    let contentPromises: Promise<string>[] = []
    syncTemplates.forEach(syncTemplate => {
        contentPromises.push(plugin.app.vault.read(syncTemplate))
    })
    
    Promise.allSettled(contentPromises).then(settledContentPromises => contentPromisesHandler(settledContentPromises))

    console.log(`%cWaiting for: content promises...`, `color: orange`)
    console.groupEnd();

    function contentPromisesHandler(settledContentPromises: PromiseSettledResult<string>[]) {
        //Console Metadata
        {
            console.groupCollapsed(`%cloadSyncTemplateMetadata():`, `color: orange`, `contentPromisesHandler()\n>>TagsPlus: SyncTemplateManager`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Using the read contents to create the list of syncTemplateMetadataExtensions`); 
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Go through each content and create SyncTemplateMetadataExtension`);
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`settledContentPromises`)
        console.log(settledContentPromises)
        console.groupEnd();

        console.groupCollapsed(`Creation Process`)
        settledContentPromises.forEach((settledContentPromise, index) => {
            if(settledContentPromise.status == "fulfilled") {
                plugin.syncTemplateMetadataList.set(syncTemplates[index].path, new SyncTemplateMetadataExtension(plugin, settledContentPromise.value, syncTemplates[index].basename))
            }
            else {
                console.groupCollapsed(`%cPromise rejected`, `color: red`)
                console.log(settledContentPromise)
                console.groupEnd();
            }
        })
        console.groupEnd();

        console.groupEnd();
    }
}

export function loadFileMetadata(plugin: TagsPlus): void {
    //Console Metadata
    {
        console.groupCollapsed(`loadFileMetadata()\n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Creating the list of Metadata that holds the ContentBlocks of files.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Reading all the file contents and calling contentPromisesHandler()`);
        console.groupEnd();
        console.groupEnd();
        console.time(`loadFileMetadata()`)
    }

    let files: TFile[] = plugin.app.vault.getMarkdownFiles().filter(file => !file.path.contains(`Plugin Ordner`));

    console.groupCollapsed(files)
    files.forEach((file, index) => console.log(`${index}: "${file.basename}"`))
    console.groupEnd();


    let contentPromises: Promise<string>[] = [];
    files.forEach(file => {
        contentPromises.push(plugin.app.vault.read(file))
    })

    let syncTemplates: (TFile | null)[] = []
    console.groupCollapsed(`Get fitting sync Templates in the same order as contents.`)
    files.forEach(file => {
        console.groupCollapsed(`For file = "${file.basename}"`)
        let fileTags: string[] = getTagsThroughMetadata(plugin, file);
        let syncTemplate = getSyncTemplate(plugin, fileTags)

        console.log(`syncTemplate = ${syncTemplate?.basename}`)

        syncTemplates.push(syncTemplate)
        console.groupEnd();
    })
    console.groupEnd();

    console.groupCollapsed(`fitting syncTemplates`)
    console.log(syncTemplates)
    console.groupEnd();

    Promise.allSettled(contentPromises).then(settledContentPromises => contentPromisesHandler(settledContentPromises))
    console.log(`%cWaiting for content promises...`, `color: orange`)
    console.groupEnd()
    
    function contentPromisesHandler(settledContentPromises: PromiseSettledResult<string>[]) {
        //Console Metadata
        {
            console.groupCollapsed(`%cloadFileMetadata()`, `color: orange`, `contentPromisesHandler()\n>> TagsPlus: SyncTemplateManager`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: `)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Using the contents, to build Metadata list`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(``);
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`settledContentPromises`)
        console.log(settledContentPromises)
        console.groupEnd();

        console.groupCollapsed(`Creation Process`)
        settledContentPromises.forEach((settledContentPromise, index) => {
            if(settledContentPromise.status == "rejected") {
                console.log(`%cError: content was not read!`, `color: red`)
                
            }
            else {
                if(!syncTemplates[index]) {
                    console.log(`%cError: no fitting syncTemplate was returned!`, `color: red`)
                    return;
                }
                plugin.fileMetadataList.set(files[index].path, new FileMetadataExtension(plugin, settledContentPromise.value, syncTemplates[index], files[index].basename))
            }
        })
        console.groupEnd();

        console.timeEnd(`loadFileMetadata()`)

        console.groupCollapsed(`%cUpdated fileMetdataList`, `color: blue`)
        console.log(plugin.fileMetadataList)
        console.groupEnd();
        console.groupEnd();

    }
}

export function getSyncTemplate(plugin: TagsPlus, tags: string[]): TFile | null {
    //Console Metadata
    {
        console.groupCollapsed(`getSyncTemplate(tags: ["${tags.join(`",\n"`)}"])) \n>> TagsPlus: SyncTemplateManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Getting the content of the most specific template for the tags.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Getting the Tags of the file,`,
            `\nGetting the templates and narrowing down the syncTemplates to the ones that contain the tags.`,
            `\nThen sort the templates in order of complexity and take the most complex. (Base-Template being the least complex)`,
            `\nThen read this template and return the result.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    
    //Getting the syncTemplates and the Base-Template from  "Plugin Ordner/Sync Templates" can later be updated to a dynamic folder path the user can decide
    let syncTemplates: TFile[];
    let baseTemplate: TFile | undefined;
    {
        console.groupCollapsed(`Getting the sync Templates and the Base-Template from the "Plugin Ordner/Sync Templates`)
        let syncTemplateFolder: TFolder | null = plugin.app.vault.getFolderByPath(`Plugin Ordner/Sync Templates`);
        if(!syncTemplateFolder) {
            console.log(`%cDidnt find Template Folder`, `color: red`);
            console.groupEnd();
            return null;
        }
        else {
            console.log(`%cFound Template Folder`, `color: green`);
            syncTemplates = syncTemplateFolder.children.filter(child => child instanceof TFile);    //Normaly should just be TFiles,
        }

        //Getting Base Template
        baseTemplate = syncTemplates.find(syncTemplate => syncTemplate.basename == "Base-Template");
        if(!baseTemplate) {
            console.log(`%cDidnt find Base-Template`, `color: red`);
            console.groupEnd()
            return null;
        }
        else {
            console.log(`%cFound Base-Template`, `color: green`);
        }
        console.groupEnd();
    }

    console.groupCollapsed(`syncTemplates`)
    console.log(`%cCheck if "Base-Template" is in syncTemplates!`, `color: orange`)
    syncTemplates.forEach((syncTemplate, index) => console.log(`${index}: "${syncTemplate.name}"`));
    console.groupEnd();
    


    //Getting relevantSyncTemplates
    let relevantSyncTemplates: TFile[] = syncTemplates 
    relevantSyncTemplates.remove(baseTemplate) //Base Template is relevant anyway, will be added later.
    {
        console.groupCollapsed(`Getting relevantSyncTemplates`)
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.log(`This code, narrows the relevant sync templates down to all`,
            `\nsync Templates that have the a subset of the filetags so: `,
            `\n  ${tags.join(`\n  `)}`
        )
        console.groupEnd()
        
        let syncTemplatesTagsMap: Map<TFile, string[]> = new Map();
        relevantSyncTemplates.forEach(syncTemplate => {
            syncTemplatesTagsMap.set(syncTemplate, syncTemplate.basename.replaceAll("§", "/").split("_"));
        })
        syncTemplatesTagsMap.set(baseTemplate, []); //Needed for clean code later
        console.groupCollapsed(`syncTemplatesTagsMap`)
        console.log(syncTemplatesTagsMap)
        console.groupEnd();



        let irrelevantSyncTemplates: TFile[] = [];
        relevantSyncTemplates.forEach(relevantSyncTemplate => {
            console.groupCollapsed(`Testing syncTemplate: "${relevantSyncTemplate.basename}"`);
            let relevant = true;

            
            let syncTemplateTags: string[] = syncTemplatesTagsMap.get(relevantSyncTemplate) as string[]
            console.groupCollapsed(`Cycling through the tags`);
            syncTemplateTags.forEach(syncTemplateTag => {
                console.groupCollapsed(`tag = "${syncTemplateTag}"`)
                let tagsContainSyncTemplateTag: boolean = false;
                tags.forEach(tag => {
                    if(tag.contains(syncTemplateTag)) {
                        console.log(`%c"${tag}" contains "${syncTemplateTag}"`, `color: green`)
                        tagsContainSyncTemplateTag = true;
                    }
                    else {
                        console.log(`%c"${tag}" does not contain "${syncTemplateTag}"`, `color: red`)
                    }
               
                })

                if(!tagsContainSyncTemplateTag) {
                    relevant = false;
                }
                console.groupEnd();
            })
            console.groupEnd();

            if(!relevant) irrelevantSyncTemplates.push(relevantSyncTemplate);

            console.groupEnd()
        })

        console.groupCollapsed(`irrelevantSyncTemplates`);
        irrelevantSyncTemplates.forEach((irrelevantSyncTemplate, index) => console.log(`${index}: "${irrelevantSyncTemplate.basename}"`))
        console.groupEnd();

        irrelevantSyncTemplates.forEach(irrelevantSyncTemplate => relevantSyncTemplates.remove(irrelevantSyncTemplate))

        console.groupEnd();
    }
    
    console.groupCollapsed(`relevantSyncTemplates`);
    relevantSyncTemplates.forEach((relevantSyncTemplate, index) => console.log(`${index}: "${relevantSyncTemplate.basename}"`))
    console.groupEnd();


    relevantSyncTemplates.sort((relevantSyncTemplate1, relevantSyncTemplate2) => {
        if(relevantSyncTemplate1.basename.length > relevantSyncTemplate2.basename.length) return 1;
        else if(relevantSyncTemplate1.basename.length < relevantSyncTemplate2.basename.length) return -1;
        else return 0;
    })
    relevantSyncTemplates.unshift(baseTemplate);    //Base template is the least complex.

    console.groupCollapsed(`sorted for stringlength with baseTemplated, relevantSyncTemplates`)
    relevantSyncTemplates.forEach((relevantSyncTemplate, index) => console.log(`${index}: "${relevantSyncTemplate.basename}"`))
    console.groupEnd();

    let syncTemplate = relevantSyncTemplates.pop() as TFile;    //Since baseTemplate is definitly in the array
    console.log(`%csyncTemplate: "${syncTemplate.basename}"`, `color: blue`)

    console.groupEnd();
    return syncTemplate;
}

export function setStatusBar(plugin: TagsPlus, file: TFile | null, status?: "active" | "inactive"): void {
    //Console Metadata
    {
        console.groupCollapsed(`setStatusBar(file: "${file?.basename}")`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Based on the current open file, change the status bar to the status of the file.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Error handling if file is null,`,
            `\nif not get fileMetadata,`,
            `\nget the syncTemplateActive value and display.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    const msgFirstPart = `SyncTemp Status: `;
    let wholeMessage = msgFirstPart;

    if(status) {
        console.log(`overide, no search required`)
        console.log(`status = ${status}`)
        wholeMessage += status;
        plugin.statusBarItemSyncTemplateActive.setText(wholeMessage)
        console.groupEnd();
        return;
    }

    if(!file) {
        plugin.statusBarItemSyncTemplateActive.setText(`${msgFirstPart}File not found!`)

        //Warning Log
        {
            console.groupCollapsed(`%cWarning: current open file not found`, `color: red`);
            console.group(`Fix`)
            console.log(`try again.`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`cant display syncTemplate status in the status bar`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: "syncTemplateStructureOnFileOpen(file: null)"`)
        }
        return;
    }

    if(file.path.contains(`Plugin Ordner`)) {
        plugin.statusBarItemSyncTemplateActive.setText(`${msgFirstPart}-`)
        console.groupEnd();
        return;
    }

    let fileMetadata = plugin.fileMetadataList.get(file.path);
    if(!fileMetadata) {
        plugin.statusBarItemSyncTemplateActive.setText(`${msgFirstPart}File Metadata not found!`)

        //Warning Log
        {
            console.groupCollapsed(`%cWarning: couldnt retrieve fileMetadata for "${file.basename}"`, `color: red`);
            console.group(`Fix`)
            console.log(`check path`)
            console.groupEnd();
            console.group(`Consequence`)
            console.log(`cant display status`)
            console.groupEnd();
            console.groupEnd()
            console.groupEnd();
            console.warn(`Error in: `)
        }
        return
    }

    if(fileMetadata.syncTemplateActive) wholeMessage += "active"
    else wholeMessage += "inactive"

    plugin.statusBarItemSyncTemplateActive.setText(wholeMessage)

    console.groupEnd();
}


export class TemplateModal extends FuzzySuggestModal<TFile> {

    onChooseTemplate: (syncTemplate: TFile) => void
    

    constructor(app: App , onChooseTemplate: (syncTemplate: TFile) => void) {
        //Console Metadata
        {
            console.groupCollapsed(`new TemplateModal()\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Creating a TemplateModal`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`calling the super constructor from FuzzySuggestModal<TFile>`);
            console.groupEnd();
            console.groupEnd();
        }

        super(app)
        this.onChooseTemplate = onChooseTemplate;
        console.groupEnd();
    }

    getItemText(file: TFile): string {
        //Console Metadata
        {
            console.groupCollapsed(`getItemText(file: "${file.basename}")\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Getting the basename`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`returning the basename property`);
            console.groupEnd();
            console.groupEnd();
        }

        console.log(`%cfile.basename = "${file.basename}"`, `color: blue`)
        console.groupEnd()
        return file.basename;
    }

    getItems(): TFile[] {
        //Console Metadata
        {
            console.groupCollapsed(`getItems()\n>> TagsPlus: SyncTemplateManager`);
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Getting the syncTemplates`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Getting the children of the Pluign Ordner/Sync Templates folder`);
            console.groupEnd();
            console.groupEnd();
        }

        let syncTemplates: TFile[] | undefined = this.app.vault.getFolderByPath(`Plugin Ordner/Sync Templates`)?.children.filter(file => file instanceof TFile)
        if(!syncTemplates) {
            //Warning Log
            {
                console.groupCollapsed(`%cWarning: sync templates folder not found!`, `color: red`);
                console.group(`Fix`)
                console.log(`Check path inconsistancy`)
                console.groupEnd();
                console.group(`Consequence`)
                console.log(`Not able to prompt user for sync Templates`)
                console.groupEnd();
                console.groupEnd()
                console.groupEnd();
                console.warn(`Error in: getItems()`)
            }
            return []
        }
        console.groupCollapsed(`%csyncTemplates`, `color: blue`)
        syncTemplates.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();
        
        console.groupEnd()
        return syncTemplates
    }

    onChooseItem(syncTemplate: TFile, evt: MouseEvent | KeyboardEvent): void {this.onChooseTemplate(syncTemplate)}

}

export class InputModal extends Modal {
    constructor(app: App, title: string, inputName: string,placeholder: string, select: boolean, onSubmit: (input: string) => void) {
        super(app);

        this.setTitle(title)
        
        let name = placeholder;
        new Setting(this.contentEl)
        .setName(inputName)
        .addText((text) => {
            text.onChange(value => {
                name = value;
            })
            text.setValue(placeholder)
            if(select) text.inputEl.select()
        
        })

        new Setting(this.contentEl)
        .addButton((btn) => {
            btn
            .setButtonText("Submit")
            .setCta()
            .onClick(() => {
                this.close()
                onSubmit(name)
            })
        })

    }
}


//Utility
export function stringIntoRegExString(string: string): string {
    //Console Metadata
    {
        console.groupCollapsed(`stringIntoRegex(string: -)`);
        console.groupCollapsed(`string`)
        console.log(string)
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Turning a raw string into the regEx version of that raw string.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Escaping every special character`);
        console.groupEnd();
        console.groupEnd();
    }

    let regExCompatibleString = string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    console.log(`regExCompatibleString = "${regExCompatibleString}"`);
    console.groupEnd();
    return regExCompatibleString;
}

export function parseArg(arg: string): string | number | boolean | RegExp | null {
    // String
    if (/^['"].*['"]$/.test(arg)) {
      return arg.slice(1, -1);
    }
  
    // RegExp literal (z. B. /abc/i oder /\d+/g)
    if (/^\/.*\/[gimsuy]*$/.test(arg)) {
      const regexParts = arg.match(/^\/(.*)\/([gimsuy]*)$/);
      if (regexParts) {
        const [, pattern, flags] = regexParts;
        return new RegExp(pattern, flags);
      }
    }
  
    // Number
    if (/^\d+(\.\d+)?$/.test(arg)) {
      return Number(arg);
    }
  
    // Boolean
    if (arg === "true" || arg === "false") {
      return arg === "true";
    }
  
    // null
    if (arg === "null") {
      return null;
    }
  
    // Fallback
    return arg;
  }
  


