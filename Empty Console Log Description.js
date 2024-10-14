//Console Metadata
{
    console.groupCollapsed(``);
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

//Console Metadata
{
    console.groupCollapsed(`%c`, `color: orange`)
    console.groupCollapsed(`%cTrace`, `color: #a0a0a0`);
    console.log(`Promise from: `)
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

//Warning Log
{
    console.groupCollapsed(`%cWarning:`, `color: red`);
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
return