import TagsPlus from "main";
import { FrontMatterCache, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";
import { createHash } from "crypto";


//Initizializers
export async function folderStructureCreate(plugin: TagsPlus): Promise<void> { 
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureCreate() \n>> TagsPlus: TagFolderManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Creating the folderStructure that allows two notes`,
            `\nwith the same name, when they have different tags.`,
            `\nCalling the cleanUp after the creation is done.`,
            `\n(is called when the "rename promises" is settled)`
        );
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Going through each markdown file, getting each tag from every note,`,
            `\ncalling tagsToFolderName() to create the dedicated folder.`,
            `\nGroup folder promises and call folderPromisesHandler() once every folder promise was settled.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    let folderPromises: Promise<TFolder>[] = [];
    console.groupCollapsed(`Folder-name computation`)
    const notes = plugin.app.vault.getMarkdownFiles().filter((note) => !note.path.includes("Plugin Ordner"));
    
    let noteToFolderNameMap: Map<TFile, string> = new Map();

    console.groupCollapsed(`Pushing each folder promise`)
    notes.forEach((note, index) => {
        console.groupCollapsed(`${index}: "${note.basename}"`)
        
        let tags = getTagsThroughMetadata(plugin, note)
        console.groupCollapsed(`tags`)
        tags.forEach((value, index) => console.log(`${index}: "${value}"`))
        console.groupEnd();
        let tagFolderName = tagsToFolderName(tags)
        console.log(`tagFolderName = "${tagFolderName}"`)
        let hashedTagFolderName = folderNameToHashedFolderName(plugin, tagFolderName)
        console.log(`%chashedOldTagFolderName = ${hashedTagFolderName}"`, `color: blue`)

        noteToFolderNameMap.set(note, hashedTagFolderName);

        folderPromises.push(plugin.app.vault.createFolder(hashedTagFolderName));
 
        console.groupEnd(); //End Group: "Note: ${note.basename}"
    })
    console.groupEnd();

    console.groupCollapsed(`noteToFolderNameMap`)
    console.log(noteToFolderNameMap)
    console.groupEnd();

    console.groupEnd(); //End Group: "Folder-name computation"

    //Promise settled: "folder promises"
    Promise.allSettled(folderPromises).then(settledFolderPromises => folderPromisesHandler(settledFolderPromises));
    console.log(`%cWaiting for: "folder promises"...`, `color: orange`)
    
    console.groupEnd();//End Group: folderStructureCreate()


    function folderPromisesHandler(settledFolderPromises: PromiseSettledResult<TFolder>[]) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderStructureCreate():`, `color: orange`, `folderPromisesHandler(settledFolderPromises:...) \n>> TagsPlus: Tag-Folder-Manager`)
            console.groupCollapsed(`...`)
            console.groupCollapsed(`settledFolderPromises`)
            console.log(settledFolderPromises)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise Handler from: folderStructureCreate()`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Handling the promised Folders and creating sorting promise`);
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Checking for each promise, whether the folder was created or not.`,
                `\nMatching every note to its folder and creating Promise for changing the Path.`
            );
            console.groupEnd();
            console.groupEnd();
        }


        console.groupCollapsed(`%cCreated Folders`, `color: green`)
        settledFolderPromises
        .filter(promise => promise.status == "fulfilled")
        .filter((promise, index, resolvedFolderPromises) => index == resolvedFolderPromises.map(promise => promise.value).indexOf(promise.value))
        .forEach((resolvedFolderPromise) => console.log(`%c${resolvedFolderPromise.value.name}`, `color: green`));
        console.groupEnd();

        console.groupCollapsed(`Renaming requests`)

        let renamePromises: Promise<void>[] = [];
        notes.forEach((note) => {
            
            renamePromises.push(plugin.app.vault.rename(note, `${noteToFolderNameMap.get(note)}/${note.name}`));
            console.log(`Move "${note.basename}" into "${noteToFolderNameMap.get(note)}"`);

        })
        console.groupEnd(); //End Group: `Renaming requests`


        Promise.allSettled(renamePromises).then(settledRenamePromises => renamePromisesHandler(settledRenamePromises));
        console.log(`%cWaiting for: "rename promises"...`, `color: orange`)

        console.groupEnd(); //End Group: `Promise settled: "folder promises"`


        function renamePromisesHandler(settledRenamePromises: PromiseSettledResult<void>[]) {
            //Console Metadata
            {
                console.groupCollapsed(`%cfolderStructureCreate():`, `color: orange`, `renamePromisesHandler() \n>> TagsPlus: Tag-Folder-Manager`)
                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                console.log(`Promise handler from: folderPromiseHandler()`);
                console.trace();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Giving Feedback and error handling, also calling:`, 
                    `\n  folderStructureCleanUp()`,
                    `\nso that the Clean Up does not happen before the files are moved,`,
                    `\nto avoid complications.`
                ); //Error Handling is not existend right now
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Going through each rename, seeing if files where correctly moved`,
                    `\nMatching every note to its folder and creating Promise for changing the Path.`,
                    `\nCalling folderStructureCleanUp()`
                );
                console.groupEnd();
                console.groupEnd();
            }
    
            console.groupCollapsed(`Settled rename promises`)
            console.log(settledRenamePromises)
            console.groupEnd();

            folderStructureCleanUp(plugin);

            console.groupEnd(); //End Group: renamePromiseHandler()
        }
    }  
}

export async function folderStructureCleanUp(plugin: Plugin): Promise<void> {
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureCleanUp() \n>> TagsPlus: TagFolderManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Deleting Folders that are not needed`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Checking if Folders are empty, if so remove`);
        console.groupEnd();
        console.groupEnd();
    }

    const rootFolders: TFolder[] = plugin.app.vault.getRoot().children.filter((file) => file instanceof TFolder);
    console.groupCollapsed(`root folders, before clean up`)
    rootFolders.forEach(rootFolder => console.log(rootFolder.name));
    console.groupEnd();

    const emptyRootFolders: TFolder[] = rootFolders.filter((rootFolder) => rootFolder.children.length == 0)

    console.groupCollapsed(`%cempty root folders`, `color: red`);
    emptyRootFolders.forEach(emptyRootFolder => {
        console.groupCollapsed(`Test: "${emptyRootFolder.name}".children:`)
        console.log(emptyRootFolder.children)
        console.groupEnd()
    })
    console.groupEnd();

    let deleteFolderPromises: Promise<void>[] = [];
    emptyRootFolders.forEach(emptyRootFolder => deleteFolderPromises.push(plugin.app.vault.delete(emptyRootFolder, true)))

    Promise.all(deleteFolderPromises).then((settledDeleteFolderPromises) => deleteFolderPromisesHandler(settledDeleteFolderPromises));
    console.log(`%cWaiting for: "folder delete promises"...`, `color: orange`);

    console.groupEnd(); //End Group: folderStructureCleanUp()

    function deleteFolderPromisesHandler(settledDeleteFolderPromises: void[]) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderStructureCleanUp():`, `color: orange`, `deleteFolderPromisesHandler() \n>> TagsPlus: Tag-Folder-Manager`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: folderStructureCleanUp()`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving Feedback and error handling`); //Error Handling is not existend right now
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Logging the promise array`);
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`delete folder promises`)
        console.log(deleteFolderPromises)
        console.groupEnd();

        console.groupEnd(); //End Group: deletePromisesHandler()
    }
}

//Watchers
export function folderStructureOnModifyFile(plugin: TagsPlus, file: TFile, newPath: string): void {
    //Console Metadata
    {
    console.groupCollapsed(`folderStructureOnModify(file: "${file.basename}", "${newPath}") \n>> TagsPlus: TagFolderManager`);
    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
    console.trace();
    console.groupEnd();
    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
    console.groupCollapsed(`Goal`)
    console.log(`Registering tag change, moving file accordingly and deleting old folder if no siblings`);
    console.groupEnd();
    console.groupCollapsed(`Process`);
    console.log(
        `\nTry to create Tag Folder,`,
        `\nthen move file into folder.`,
        `\nIf empty delete old folder. `,
        `\nLast three steps, are nested promises.`
    );
    console.groupEnd();
    console.groupEnd();
    }
    
    let oldTagFolder: TFolder | null = null;   
    let hashedOldTagFolderName: string = ""
    if(file.parent) {
        oldTagFolder = file.parent;
        hashedOldTagFolderName = file.parent.name;
    }
    
    console.log(`hashedOldTagFolderName = "${hashedOldTagFolderName}"`);

    let newFileName = newPath.split("/").pop() ?? newPath;
    console.log(`newFileName = "${newFileName}"`)
    
    let newTagFolderName: string = newPath.slice(0, newPath.length - newFileName.length)
    console.log(`newTagFolderName = "${newTagFolderName}"`)

    plugin.app.vault.createFolder(newTagFolderName)
    .then(folderPromiseThenHandler)
    .catch(folderPromiseCatchHandler)
    .finally(folderPromiseFinallyHandler)
    console.log(`%cWaiting for: "folder promise"...`, `color: orange`);
    
    
    console.groupEnd() //End Group: contentPromiseHandler()

    //Promise Handlers
    function folderPromiseThenHandler(newTagFolder: TFolder) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderStructureOnModify(file: "${file.basename}", ...):`, `color: green`, `folderPromiseThenHandler(newTagFolder: ...)\n>> TagsPlus: TagFolderManager`)
            console.groupCollapsed(`...`)
            console.groupCollapsed(`newTagFolder`)
            console.info(newTagFolder)
            console.groupEnd();
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving feedback`); //Error Handling is not existend right now
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Giving feedback of the folder promise.`,);
            console.groupEnd();
            console.groupEnd();
        }


        console.groupEnd()//Group End: folderPromiseThenHandler()
    }
    function folderPromiseCatchHandler(reason: any) { 
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderStructureOnModify(file: "${file.basename}", ...):`, `color: red`, `folderPromiseCatchHandler(reason: ...)\n>> TagsPlus: TagFolderManager`)
            console.groupCollapsed(`...`)
            console.groupCollapsed(`reason`)
            console.log(reason)
            console.groupEnd()
            console.groupEnd()
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving Error Feedback`); 
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Giving feedback of the folder promise.`);
            console.groupEnd();
            console.groupEnd();
        }

        console.log(`As long as, error reason is: "folder already exists", no problem`);
        console.log(reason)

        console.groupEnd() //End Group: folderPromiseCatchHandler();
    }
    function folderPromiseFinallyHandler() {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderStructureOnModify(file: "${file.basename}", ...):`, `color: orange`, `folderPromiseFinallyHandler()\n>> TagsPlus: TagFolderManager`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Moving File into the now definitly existing Folder: "${newTagFolderName}"`); 
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Request obsidian to move "${file.basename}" into "${newTagFolderName}"`,
                `\ncall renamePromiseHandlers when waiting done.`
            );
            console.groupEnd();
            console.groupEnd();
        }

        console.log(`newPath = "${newPath}"`)
        plugin.ignoreNextRename = true;
        plugin.app.vault.rename(file, newPath)
        .then(renamePromiseThenHandler)
        console.log(`%cWaiting for: "rename promise"...`, `color: orange`)

        console.groupEnd() //End Group: folderPromiseFinallyHandler()

        //Promise Handlers
        function renamePromiseThenHandler() {
            //Console Metadata
            {
                console.groupCollapsed(`%cfolderStructureOnModify(file: "${file.basename}", ...):`, `color: green`, `renamePromiseThenHandler()\n>> TagsPlus: TagFolderManager`)
                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                console.trace();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Giving feedback, deleting old tag folder, when empty`); //Error Handling is not existend right now
                console.groupEnd();
                console.groupCollapsed(`Process`);
                console.log(`Giving feedback of the folder promise.`,
                    `\nchecking if old tag folder still has children,`,
                    `\nif not request delete, after delete done, call deleteFolderPromiseHandlers`
                );
                console.groupEnd();
                console.groupEnd();
            }
            console.log(`Moving "${file.basename}" was succesfull`)

            console.groupCollapsed(`old tag folder`)
            console.info(oldTagFolder)
            console.groupEnd();

            if(oldTagFolder && oldTagFolder.children.length == 0) {
                console.log(`${oldTagFolder.name} is empty, request delete`)
                plugin.app.vault.delete(oldTagFolder, true)
                .then(deleteFolderPromiseThenHandler)
                console.log(`%cWaiting for: "delete folder promise"...`, `color: orange`)
            }

            console.groupEnd() //End Group: renamePromiseThenHandler()

            //Promise Handlers
            function deleteFolderPromiseThenHandler() {
                //Console Metadata
                {
                    console.groupCollapsed(`%cfolderStructureOnModify(file: "${file.basename}", ...):`, `color: green`, `deleteFolderPromiseThenHandler()\n>> TagsPlus: TagFolderManager`)
                    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                    console.trace();
                    console.groupEnd();
                    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                    console.log(`Giving feedback, of "delete folder promise"`); //Error Handling is not existend right now
                    console.groupEnd();

                    
                }
                console.log(`Old tag folder has been deleted`)
                console.log(`%cfolderStructureOnModifyFile(file: ${file.basename}) done`, `font-weight: bold`)

                console.groupEnd()
            }
        }
    }
    
}

export function folderStructureOnCreateFile(plugin: TagsPlus, file: TFile): void {
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureOnCreate(file: "${file.basename}")\n>> TagsPlus: TagFolderManager`);
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

    console.groupEnd();
}

export function folderStructureOnDeleteFile(plugin: Plugin, file: TFile): void {
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureOnDelete(file: ${file.basename})\n>> TagsPlus: TagFolderManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.log(`Called from: main()`)
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Doing a local clean up if necessary`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Getting the parent, wich is not directly accesable,`,
            `\nbecause the parent info was set to null`,
            `\nChecking if the parent of the deleted File is now empty,`,
            `\nif so delete Folder.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    
    console.groupCollapsed(`to be deleted file`)
    let { basename, path} = file
    console.info({ basename, path });
    console.groupEnd();

    let parentName = path.split("/")[0];
    console.log(`path.split("/") = ["${path.split("/").join(`", "`)}"]`);
    if(path.split("/").length == 1) {
        console.log(`"${file.basename}" has no parent.`)
        console.groupEnd();
        return;
    }
    console.log(`parent name = ${parentName}`);

    let parent: TFolder = plugin.app.vault.getFolderByPath(parentName) as TFolder //Since the name exists, the folder must exist too.
    let siblings = parent.children;
    console.log(`sibling = ["${siblings.join(`", "`)}"]`);

    let folderDeletePromise: Promise<void>;
    if(siblings.length == 0) {
        console.log(`%cFolder: "${parentName}" should be deleted`, `color: red`);
        folderDeletePromise = plugin.app.vault.delete(parent, true).then(folderDeletePromiseThenHandler)
        console.log(`%cWaiting for: "folder delete promise"...`, `color: orange`);
    }
    else console.log(`Folder: "${parentName}" still has other files, no delete`);

    console.groupEnd(); //Group End: folderStructureOnDeleteFile

    //Promise Handlers:
    function folderDeletePromiseThenHandler() {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderDeletePromiseThenHandler()`, `color: green`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: folderStructureOnDeleteFile()`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving Feedback and error handling`); //Error Handling is not existend right now
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Logging the promise`);
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`folder delete promise`)
        console.log(folderDeletePromise)
        console.groupEnd();

        console.groupEnd() //End Group: folderDeletePromiseHandler()
    }
}

//Utility

export function getTagsThroughMetadata(plugin: TagsPlus, file: TFile): string[] {
    //Console Metadata
    {
        console.groupCollapsed(`getTagsThroughMetadata(file: "${file.basename}")`);
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
    }

    let fileMetadata = plugin.app.metadataCache.getFileCache(file);
    if(!fileMetadata) {
        console.log(`%cError: No filemetadata was found!`, `color: red`)
        console.timeLog();
        return [];
    }

    let frontmatterTags: string[] = [];

    let fileFrontmatter = fileMetadata.frontmatter;
    if(fileFrontmatter && fileFrontmatter["tags"]) frontmatterTags = (fileFrontmatter["tags"])
    
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

    console.groupEnd();
    return tags;
    
}

export function getTagsThroughContent(content: string): string[] {
    //Console Metadata
    {
        console.groupCollapsed(`getTagsThroughContent(...)`);
        console.groupCollapsed(`...`)
        console.group(`content:`)
        console.log(content)
        console.groupEnd();
        console.groupEnd()
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Extracting the tags out of the file-content`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`First matching the tags out of the yaml frontmatter,`,
            `\nThen matching out of the rest.`
        );
        console.groupEnd();
        console.groupEnd();
    }

    const yamlFrontmatterTagBlockRegEx: RegExp = /(?<=tags:\n)(?:(?:  - )(?:[ßüöäÜÖÄa-zA-z0-9_\-\/]+)(?:\n))+(?=---|\w+:)/g;
    const yamlFrontMatterTagRegEx: RegExp = /(?<=  - )[ßüöäÜÖÄa-zA-z0-9_\-\/]+(?=\n)/g
    const inlineTagRegEx: RegExp = /(?<=#)[ßüöäÜÖÄa-zA-z0-9_\-\/]+/g;

    //Getting yamlFrontMatterTags
    let yamlFrontMatterTags: string[] = [];
    {
        console.groupCollapsed(`Getting yamlFrontMatterTags`)

        let yamlFrontmatterTagBlockMatch: RegExpMatchArray | null = content.match(yamlFrontmatterTagBlockRegEx);
        if(!yamlFrontmatterTagBlockMatch) {
            console.log(`yamlFrontMatter not found.`)
        }
        else {
            let yamlFrontMatterTagBlock: string = yamlFrontmatterTagBlockMatch[0];
            console.groupCollapsed(`yamlFrontMatterTagBlock`)
            console.log(yamlFrontMatterTagBlock)
            console.groupEnd();

            yamlFrontMatterTags = yamlFrontMatterTagBlock.match(yamlFrontMatterTagRegEx) as string[];
        }

        console.groupEnd();
    }
    console.groupCollapsed(`yamlFrontMatterTags`)
    console.log(yamlFrontMatterTags)
    console.groupEnd()

    //Getting inlineTags
    let inlineTags: string[] = [];
    { 
        console.groupCollapsed(`Getting inlineTags`);
        let inlineTagsMatch: RegExpMatchArray | null = content.match(inlineTagRegEx);
        if(!inlineTagsMatch) {
            console.log(`No inline Tags found.`)
        }
        else {
            console.log(`Inline tags matched.`)
            inlineTags = inlineTagsMatch;
        }

        console.groupEnd();
    }
    console.groupCollapsed(`inlineTags`)
    console.log(inlineTags)
    console.groupEnd();

    let combinedTags: string[] = yamlFrontMatterTags.concat(inlineTags).unique();
    console.groupCollapsed(`combinedTags`)
    console.log(combinedTags)
    console.groupEnd();

    console.groupEnd();
    return combinedTags;
}

export function tagsToFolderName(tags: string[]): string {
    //Console Metadata
    {
        console.groupCollapsed(`tagsToFolderName(tags: ["${tags.join(`", "`)}"])\n>> TagsPlus: TagFolderManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Getting the unique tag folder name from`,
            `\n  ["${tags.join(`", "`)}"]`
        );
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Sorting the Tags, so that the folder name is the same,`,
            `\nfor notes with the same tags.`,
            `\nJoining the tags to one string with "_".`,
            `\nReplacing "/" from subtag chains with something that is okay for folders: "§".`
        );
        console.groupEnd();
        console.groupEnd();
    }

    let sortedTags: string[] = tags.sort();
    console.groupCollapsed(`sorted tags`);
    console.info(sortedTags);
    console.groupEnd();

    let folderName: string = sortedTags.join("_").replaceAll("/", "§");
    console.log(`folder name = ${folderName}`);

    console.groupEnd();
    return folderName;
}

export function folderNameToHashedFolderName(plugin: TagsPlus, folderName: string): string {
    //Console Metadata
    {
        console.groupCollapsed(`tagsToFolderName(folderName: "${folderName}")\n>> TagsPlus: TagFolderManager`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Getting the unique hashfoldername, and registering it into the folderNameToHashMap`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`hashing it using createHash, checking if the map has an entry when i get(hash), then updating map if not.`)
        console.groupEnd();
        console.groupEnd();
    }

    let hashedFolderName: string = createHash("MD5").update(folderName).digest("hex");
    console.log(`hashedFolderName = "${hashedFolderName}"`)

    /*if(!plugin.hashToFolderNameMap.get(hashedFolderName)) {
        console.log(`folderName was not registered yet into the map.`)
        plugin.hashToFolderNameMap.set(hashedFolderName, folderName)
    }
    else {
        console.log(`already inside the map`)
    }
    */
    console.groupEnd()
    return hashedFolderName;
}

