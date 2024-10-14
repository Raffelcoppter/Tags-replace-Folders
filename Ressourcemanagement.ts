import { Notice, Plugin, TFile, TFolder } from "obsidian";

export function resOnCreateFile(plugin: Plugin, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`resOnCreateFile(file: "${file.name})\n>> TagsPlus: Ressourcemanager"`);
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.log(`Gets called whenever a new ressource was added.`)
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Embedding every type of ressource into a markdown File with tags`);
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`First checking whether file was directly added into a specific folder.`,
            `\nWhen not, get the extension, then create or find existing folder under "Ressourcen"`,
            `\nthat has the same name as the extension.`,
            `\nCall: folderPromiseHandlers`
        );
        console.groupEnd();
        console.groupEnd();
    }


    let newFolderName = `Plugin Ordner/Ressourcen/${file.extension}`
    console.log(`newFolderName = "${newFolderName}"`)

    plugin.app.vault.createFolder(newFolderName)
    .then(folderPromiseThenHandler)
    .catch(folderPromiseCatchHandler)
    .finally(folderPromiseFinallyHandler);
    console.log(`%cWaiting for: "folder Promise"...`, `color: orange`)
 

    //Getting referenceContent
    let referenceContent: string;
    {
        console.groupCollapsed(`Getting referenceContent`)
        let tags: string[] = ['Eintragsart/Referenz'];
        tags.push(`Dateityp/${file.extension}`);



        console.groupEnd();
    }




    console.groupEnd(); //End Group: resOnCreateFile()


    //Promise Handlers
    function folderPromiseThenHandler(folder: TFolder) {
        //Console Metadata
        {
            console.groupCollapsed(`%cresOnCreateFile(file: "${file.basename}")`, `color: green`, `folderPromiseThenHandler(folder: ...)\n>> TagsPlus: Ressourcemanager`)
            console.groupCollapsed(`...`)
            console.groupCollapsed(`folder`)
            console.log(folder)
            console.groupEnd()
            console.groupEnd();
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.log(`Giving Feedback`); 
            console.groupEnd();
        }

        console.log(`Folder was created`)
        new Notice(`New Ressource-folder was created: "${newFolderName}"`)

        console.groupEnd();
    }
    function folderPromiseCatchHandler(reason: any) { 
        //Console Metadata
       {
        console.groupCollapsed(`%cresOnCreateFile(file: "${file.basename}")`, `color: red`, `folderPromiseCatchHandler(reason: ...)\n>> TagsPlus: Ressourcemanager`)
        console.groupCollapsed(`...`)
        console.groupCollapsed(`reason`)
        console.log(reason)
        console.groupEnd()
        console.groupEnd();
        console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
        console.log(`Promise from: resOnCreateFile(file: ${file.name})`)
        console.trace();
        console.groupEnd();
        console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
        console.groupCollapsed(`Goal`)
        console.log(`Giving Error Feedback`); 
        console.groupEnd();
        console.groupCollapsed(`Process`);
        console.log(`Logging error and calming down.`);
        console.groupEnd();
        console.groupEnd();
       }

       console.log(`folder was not created`)
       console.log(reason)

       console.groupEnd() //End Group: folderPromiseCatchHandler();
    }
    function folderPromiseFinallyHandler() {
        //Console Metadata
        {
            console.groupCollapsed(`%cresOnCreateFile(file: "${file.basename}")`, `color: orange`, `folderPromiseFinallyHandler()\n>> TagsPlus: Ressourcemanager`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Moving ressource into the now existing folder.`); 
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Request move and call: renamePromiseThenHandler()`);
            console.groupEnd();
            console.groupEnd();
        }

        plugin.app.vault.rename(file, `${newFolderName}/${file.name}`)
        .then(renamePromiseThenHandler)
        console.log(`%cWaiting for: "rename Promise"...`, `color: orange`)

        console.groupEnd();
        //Promise Handlers
        function renamePromiseThenHandler() {
            //Console Metadata
            {
                console.groupCollapsed(`%cresOnCreateFile(file: "${file.basename}")`, `color: green`, `renamePromiseThenHandler()\n>> TagsPlus: Ressourcemanager`)
                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                console.log(`Promise from: folderPromiseFinallyHandler()`)
                console.trace();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.log(`Giving Feedback`);
                console.groupEnd();
            }

            console.log(`Move was succesfull`);
            new Notice(`Ressource file was moved into new folder.`)

            console.groupEnd();
        }
    }
    function filePromiseThenHandler(file: TFile) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfilePromiseThenHandler()`, `color: green`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: resOnCreateFile(file: ${file.name})`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving Feedback`); //Error Handling is not existend right now
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Logging the created file`);
            console.groupEnd();
            console.groupEnd();
        }

        console.groupCollapsed(`created file`)
        let {name, parent, path} = file
        console.log({name, parent, path})
        console.groupEnd()

        console.groupEnd()//End Group: filePromiseThenHandler()
    }
}