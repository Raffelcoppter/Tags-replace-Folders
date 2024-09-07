import { Plugin, TFile, TFolder } from "obsidian";

export function resOnCreateFile(plugin: Plugin, file: TFile) {
    //Console Metadata
    {
        console.groupCollapsed(`resOnCreateFile(file: "${file.name})"`);
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

    let extension = file.extension
    console.log(`extenstion = "${extension}"`);
        
    let newFolderName = `Plugin Ordner/Ressourcen/${extension}`
    console.log(`newFolderName = "${newFolderName}"`)


    plugin.app.vault.createFolder(newFolderName)
    .then(folderPromiseThenHandler)
    .catch(folderPromiseCatchHandler)
    .finally(folderPromiseFinallyHandler);
    console.log(`%cWaiting for: "folder Promise"...`, `color: orange`)
 

    let yaml = `---\ntags:\n  - Dateityp/${extension}\n---`;
 
    let extensionMark = ""
    if(extension == "pdf" || extension == "mp3") {
        extensionMark = "!"
        console.log(`File is image or audio, automatically show link, (!)`)
    }

    let content = `${yaml}\n${extensionMark}[${file.basename}](${newFolderName.replaceAll(" ", "%20")}/${file.name.replaceAll(" ", "%20")})`;
    console.groupCollapsed(`content`)
    console.log(content)
    console.groupEnd();

    plugin.app.vault.create(`${file.basename}.md`, content)
    .then(filePromiseThenHandler)
    console.log(`%cWaiting for: "file Promise"...`, `color: orange`);


    console.groupEnd(); //End Group: resOnCreateFile()


    //Promise Handlers
    function folderPromiseThenHandler(folder: TFolder) {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderPromiseThenHandler()`, `color: green`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: resOnCreateFile(file: ${file.name})`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Giving Feedback`); //Error Handling is not existend right now
            console.groupEnd();
            console.groupCollapsed(`Process`);
            console.log(`Logging the new folder`);
            console.groupEnd();
            console.groupEnd();

            console.groupCollapsed(`created folder`)
            let { name, parent, path} = folder
            console.info({name, parent, path})
            console.groupEnd();

            console.groupEnd();
        }
    }
    function folderPromiseCatchHandler(reason: any) { 
        //Console Metadata
       {
           console.groupCollapsed(`%cfolderPromiseCatchHandler()`, `color: red`)
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

       console.log(`As long as, error reason is: "folder already exists", no problem`);
       console.log(reason)

       console.groupEnd() //End Group: folderPromiseCatchHandler();
    }
    function folderPromiseFinallyHandler() {
        //Console Metadata
        {
            console.groupCollapsed(`%cfolderPromiseFinallyHandler()`, `color: orange`)
            console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
            console.log(`Promise from: resOnCreateFile(file: ${file.name})`)
            console.trace();
            console.groupEnd();
            console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
            console.groupCollapsed(`Goal`)
            console.log(`Moving ressource into the now existing folder.`); //Error Handling is not existend right now
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
                console.groupCollapsed(`%crenamePromiseHandler() `, `color: green`)
                console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
                console.log(`Promise from: folderPromiseFinallyHandler()`)
                console.trace();
                console.groupEnd();
                console.groupCollapsed(`%cDescription`, `color: #a0a0a0`);
                console.groupCollapsed(`Goal`)
                console.log(`Giving Feedback`);
                console.groupEnd();
                console.groupEnd();
            }

            console.log(`%cMove was succesfull`);

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