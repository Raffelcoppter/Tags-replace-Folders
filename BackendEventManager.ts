import TagsPlus from "main";
import { TFile } from "obsidian";
import { syncTemplateStructureOnDeleteFile, syncTemplateStructureOnModify, syncTemplateStructureOnRenameFile } from "SyncTemplateManager";
import { folderStructureOnDeleteFile, folderStructureOnModifyFile, getTagsThroughContent, tagsToFolderName } from "TagFolderManager";

export function structureOnModifyFile(plugin: TagsPlus, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`structureOnModifyFile(file: "${file.basename}")\n>> TagsPlus: BackendEventManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Bundling the EventManagers for Modify in a runtime efficient way.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`first read the content, then `);
        console.groupEnd();
        console.groupEnd();
    }

    if(plugin.ignoreNextModify || plugin.ignoreAllModifies) {
        console.log(`%cignored`, `color: blue`);
        plugin.ignoreNextModify = false;
        console.groupEnd();
        return;
    }

    plugin.app.vault.read(file).then(content => contentPromiseThenHandler(content));
    console.log(`%cWaiting for contentPromise...`, `color: orange`);


    console.groupEnd();

    function contentPromiseThenHandler(content: string): void {
        //Console Metadata
        {
            console.groupCollapsed(`%cstructureOnModifyFile(file: "${file.basename}"):`, `color: orange`, `contentPromiseThenHandler(content: ...)\n>> TagsPlus: BackendEventManger`)
            console.groupCollapsed(`...`)
            console.groupCollapsed(`content`)
            console.log(content)
            console.groupEnd()
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`With read content, call:`,
                `\n  - folderStructureOnModifyFile`,
                `\n  - syncTemplateStructureOnModifyFile`
            )
            console.groupEnd();
        }


        syncTemplateStructureOnModify(plugin, file, content)
        //folderStructureOnModifyFile(plugin, file, content);

        console.groupEnd();
    }
}

export function structureOnRenameFile(plugin: TagsPlus, file: TFile, oldPath: string) {
    //Console Metadata
    {
        console.groupCollapsed(`structureOnRenameFile(file: "${file.basename}")`);
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

    if(plugin.ignoreNextRename) {
        console.log(`%cignored`, `color: blue`)
        plugin.ignoreNextRename = false;
        console.groupEnd();
        return;
    }

    syncTemplateStructureOnRenameFile(plugin, file, oldPath)

    console.groupEnd();
}

export function structureOnDeleteFile(plugin: TagsPlus, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`structureOnDeleteFile(file: "${file.basename}")`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Managing every function that has something to do with the deleteFile event.`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Call syncTemplateStructureOnDeleteFile,`,
            `\nCall folderStructureOnDeleteFile`
        );
        console.groupEnd();
        console.groupEnd();
    }

    syncTemplateStructureOnDeleteFile(plugin, file)
    folderStructureOnDeleteFile(plugin, file)

    console.groupEnd();
}