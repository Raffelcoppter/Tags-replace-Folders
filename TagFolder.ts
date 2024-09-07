import { rename } from "fs";
import { FrontMatterCache, Plugin, TAbstractFile, TFile, TFolder } from "obsidian";

export async function folderStructureCreate(plugin: Plugin): Promise<void> {
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureCreate()`);
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
    let folderNames: string[] = [];
    console.groupCollapsed(`Folder-name computation`)
    const notes = plugin.app.vault.getMarkdownFiles().filter((note) => !note.path.includes("Plugin Ordner"));
    console.groupCollapsed(`notes`)
    notes.forEach((note, index) => console.log(`notes[${index}] = "${note.basename}"`))
    console.groupEnd()
    notes.forEach((note, index) => {
        console.groupCollapsed(`note = "${note.basename}"`, 
            `\nindex = ${index}`
        )
          
        let noteMetaData = plugin.app.metadataCache.getFileCache(note);
        //No need to check for different cases, because layout is loaded
        if(noteMetaData && (noteMetaData.tags || (noteMetaData.frontmatter && noteMetaData.frontmatter["tags"]))) {	
            let tags: string[];
            if(noteMetaData.tags) tags = noteMetaData.tags.map(tag => tag.tag.slice(1, tag.tag.length));
            else tags = (noteMetaData.frontmatter as FrontMatterCache).tags; 

            folderNames.push(tagsToFolderName(tags));

            console.log(`note = "${note.basename}", folderNames[${index}] = "${folderNames[index]}"`)
            folderPromises.push(plugin.app.vault.createFolder(folderNames.last()as string));
        }
        else {
            console.log(`File has no tags.`)
            folderNames.push("");
        }      
        console.groupEnd(); //End Group: "Note: ${note.basename}"
    })
    console.groupCollapsed(`folderNames`)
    console.log(folderNames)
    console.groupEnd();
    console.groupEnd(); //End Group: "Folder-name computation"

    //Promise settled: "folder promises"
    Promise.allSettled(folderPromises).then(settledFolderPromises => folderPromisesHandler(settledFolderPromises));
    console.log(`%cWaiting for: "folder promises"...`, `color: orange`)
    
    console.groupEnd();//End Group: folderStructureCreate()


    function folderPromisesHandler(settledFolderPromises: PromiseSettledResult<TFolder>[]) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderPromisesHandler()`, `color: orange`)
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
        console.groupCollapsed(`Folder feedback`)

        console.groupCollapsed(`Settled Folder Promises`)
        console.log(settledFolderPromises);
        console.groupEnd();

        console.groupCollapsed(`%cCreated Folders`, `color: green`)
        settledFolderPromises
        .filter(promise => promise.status == "fulfilled")
        .filter((promise, index, resolvedFolderPromises) => index == resolvedFolderPromises.map(promise => promise.value).indexOf(promise.value))
        .forEach((resolvedFolderPromise) => console.log(`%c${resolvedFolderPromise.value.name}`, `color: green`));
        console.groupEnd();
        console.groupEnd();

        console.groupCollapsed(`Renaming requests`)
        console.groupCollapsed(`folderNames`)
        folderNames.forEach((folderName, index) => console.log(`folderNames[${index}] = "${folderName}"`))
        console.groupEnd() //End Group: folderNames
        console.groupCollapsed(`notes`)
        notes.forEach((note, index) => console.log(`notes[${index}] = "${note.basename}"`))
        console.groupEnd()
        let renamePromises: Promise<void>[] = [];
        notes.forEach((note, index) => {
            
            renamePromises.push(plugin.app.vault.rename(note, `${folderNames[index]}/${note.name}`));
            console.log(`Move "${note.basename}" into "${folderNames[index]}"`);
        })
        console.groupEnd(); //End Group: `Renaming requests`


        Promise.allSettled(renamePromises).then(settledRenamePromises => renamePromisesHandler(settledRenamePromises));
        console.log(`%cWaiting for: "rename promises"...`, `color: orange`)

        console.groupEnd(); //End Group: `Promise settled: "folder promises"`


        function renamePromisesHandler(settledRenamePromises: PromiseSettledResult<void>[]) {
            //Console Metadata
            {
                console.groupCollapsed(`%crenamePromisesHandler()`, `color: orange`)
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
        console.groupCollapsed(`folderStructureCleanUp()`);
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
            console.groupCollapsed(`%cdeleteFolderPromisesHandler()"`, `color: orange`)
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

export function folderStructureOnModifyFile(plugin: Plugin, file: TFile): void {
    //Console Metadata
    {
    console.groupCollapsed(`folderStructureOnModify(file: "${file.basename}")`);
    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
    console.trace();
    console.groupEnd();
    console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
    console.groupCollapsed(`Goal`)
    console.log(`Registering tag change, moving file accordingly and deleting old folder if no siblings`);
    console.groupEnd();
    console.groupCollapsed(`Process`);
    console.log(`Reading Content of file`,
        `\nChecking if file has tags,`, 
        `\nseeing if these tags have changed.`,
        `\nIf they did, try to create Tag Folder,`,
        `\nthen move file into folder.`,
        `\nIf empty delete old folder. `,
        `\nLast three steps, are nested promises.`
    );
    console.groupEnd();
    console.groupEnd();
    }

    const contentPromise = plugin.app.vault.cachedRead(file).then((content) => contentPromiseThenHandler(content));
    console.log(`%cWaiting for: "content promise"...`, `color: orange`)

    console.groupEnd(); //End Group:

    //Promise Handler
    function contentPromiseThenHandler(newContent: string) {
        //Console Metadata
        {
            console.groupCollapsed(`%ccontentPromiseThenHandler()`, `color: orange`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: `)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Testing the given content on tag change and based on that, create folder`, )
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Logging the new Content as overview,`,
                `\nextracting the new tag folder name from the new content through regexp.`,
                `\nGetting the old tag folder name and comparing both`,
                `\nWhen tags are different, request new folder and call folderPromiseHandler()`
            );
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`new content`)
        console.log(newContent)
        console.groupEnd();
        

        console.groupCollapsed(`Getting new tag folder name`)
        let newTagFolderName: string = "";
        let newTagsMatch = newContent.match(/(?<=#)[üöäÜÖÄa-zA-z0-9_\-\/]+/g)    //Matching tags in content
        let newTagsYamlMatch: RegExpMatchArray | null = newContent.match(/(?<=tags:\n)((?:  - )([üöäÜÖÄa-zA-z0-9_\-\/]+)(?:\n))+(?=(---)|(\w+:)|)/g)

        if(newTagsYamlMatch || newTagsMatch) {
            let newTags: string[] = [];
            if(newTagsYamlMatch) {
                console.log(`Matched tag structure in frontmatter`);
                console.groupCollapsed(`new tags yaml match`)
                console.dir(newTagsYamlMatch);
                console.groupEnd();
    
                let newTagsYaml: string = newTagsYamlMatch[0];
                console.groupCollapsed(`newtags yaml`)
                console.log(newTagsYaml);
                console.groupEnd();

                newTags = newTagsYaml.match(/(?<=  - )[üöäÜÖÄa-zA-z0-9_\-\/]+/g) as string[]; // it cant be null
            }
            if(newTagsMatch) {
                console.log(`Matched tags in content`);
                console.groupCollapsed(`new tags match`) 
                console.log(newTagsMatch);
                console.groupEnd();

                newTags = newTags.concat((newTagsMatch as RegExpMatchArray).map(regTag => regTag.toString()));
           }

            console.groupCollapsed(`new tags`)
            console.log(newTags)
            console.groupEnd();

            newTagFolderName = tagsToFolderName(newTags); 

        }
        else console.log(`%cCouldnt match any tags in "${file.name}"`, `color: red`)

        console.groupEnd();

        console.log(`new tag folder name = ${newTagFolderName}`)
        
        let oldTagFolder: TFolder | null = null;    //Needed later.
        let oldTagFolderName: string = "";
        if(file.parent) {
            oldTagFolder = file.parent;
            oldTagFolderName = file.parent.name;
        }
        
        console.log(`old tag folder name = ${oldTagFolderName}`);

        let folderPromise: Promise<TFolder>
        if(oldTagFolderName == newTagFolderName) console.log(`%cTags of ${file.name} have not changed`, `color: red`);
        else {
            console.log(`%cTags of ${file.name} have changed`, `color: green`);
            plugin.app.vault.createFolder(newTagFolderName)
            .then(folderPromiseThenHandler)
            .catch(folderPromiseCatchHandler)
            .finally(folderPromiseFinallyHandler)
            console.log(`%cWaiting for: "folder promise"...`, `color: orange`);
        }
        
        console.groupEnd() //End Group: contentPromiseHandler()

        //Promise Handlers
        function folderPromiseThenHandler(newTagFolder: TFolder) {
            //Console Metadata
            {
                console.groupCollapsed(`%cfolderPromiseThenHandler()`, `color: green`)
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

            console.info(newTagFolder);

            console.groupEnd()//Group End: folderPromiseThenHandler()
        }
        function folderPromiseCatchHandler(reason: any) { 
             //Console Metadata
            {
                console.groupCollapsed(`%cfolderPromiseCatchHandler()`, `color: red`)
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
                console.groupCollapsed(`%cfolderPromiseFinallyHandler()`, `color: orange`)
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

            plugin.app.vault.rename(file, `${newTagFolderName}/${file.name}`)
            .then(renamePromiseThenHandler)
            console.log(`%cWaiting for: "rename promise"...`, `color: orange`)

            console.groupEnd() //End Group: folderPromiseFinallyHandler()

            //Promise Handlers
            function renamePromiseThenHandler() {
                //Console Metadata
                {
                    console.groupCollapsed(`%crenamePromiseThenHandler()`, `color: green`)
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
                    console.log(`${oldTagFolderName} is empty, request delete`)
                    plugin.app.vault.delete(oldTagFolder, true)
                    .then(deleteFolderPromiseThenHandler)
                    console.log(`%cWaiting for: "delete folder promise"...`, `color: orange`)
                }

                console.groupEnd() //End Group: renamePromiseThenHandler()

                //Promise Handlers
                function deleteFolderPromiseThenHandler() {
                    //Console Metadata
                    {
                        console.groupCollapsed(`%cdeleteFolderPromiseThenHandler()`, `color: green`)
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
}

export function folderStructureOnCreateFile(): void {
    //Console Metadata
    {
        console.groupCollapsed(`folderStructureOnCreate()`);
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
        console.groupCollapsed(`folderStructureOnDelete(abstractFile: ${file.basename})`);
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

function tagsToFolderName(tags: string[]): string {
    //Console Metadata
    {
        console.groupCollapsed(`tagsToFolderName(tags: ["${tags.join(`", "`)}"])`);
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

