import { PluginSettingTab, App, Setting, Notice, ExtraButtonComponent } from "obsidian";
import TagsPlus from "./main"; // dein Plugin importieren

export class CombinedPluginSettingsTab extends PluginSettingTab {
  plugin: TagsPlus;

  purple: string = "#9873f7"
  white: string = "#ffffff"
  lavendel: string = "#E7DDFF"
  grey: string = "#747474"

  constructor(app: App, plugin: TagsPlus) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {

    //Console Metadata
    {
        console.groupCollapsed(`display()\n >> Settings`);
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
    
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Custom Functions" });

    let customFuncDiv = containerEl.createDiv()
    
    console.groupCollapsed("Loaded Settings")
    console.log(this.plugin.combinedPluginSettings)
    console.groupEnd()

    this.plugin.combinedPluginSettings.customFuncStringsList.forEach((code, funcName) => {
      this.renderFunctionEditior(customFuncDiv, funcName, code)
    });



    new Setting(containerEl)
    .addButton((btn) =>
      btn
        .setButtonText("Create custom function")
        .setCta()
        .onClick(() => {
          this.renderFunctionEditior(customFuncDiv, "", "")
        })
    )
    console.groupEnd()

    
  }

  renderFunctionEditior(customFuncDiv: HTMLDivElement, oldName: string, oldCode: string) {

    //Console Metadata
    {
      console.groupCollapsed(`renderFunctionEditior(customFuncDiv: -, oldName: ${oldName}, oldCode: ...`);
      console.groupCollapsed("...")
      console.log(oldCode)
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
    
    let lastName: string = oldName
    let name: string = oldName
    let code: string = oldName

    let saveBtn: ExtraButtonComponent
    let deleteBtn: ExtraButtonComponent

    let nameChanged: boolean = false
    let codeChanged: boolean = false

    let thisSetting = new Setting(customFuncDiv)
    .addText((text) => {
      text.setValue(oldName)
      text.onChange((val)=> {
        saveBtn.setDisabled(false)
        saveBtn.extraSettingsEl.style.backgroundColor = this.purple
        saveBtn.extraSettingsEl.style.color = this.lavendel


        nameChanged = true;
        name = val
      })
    })
    .addTextArea((text)=> {
      text.setValue(oldCode)
      text.onChange((val)=> {
        saveBtn.setDisabled(false)
        saveBtn.extraSettingsEl.style.backgroundColor = this.purple
        saveBtn.extraSettingsEl.style.color = this.lavendel

        codeChanged = true
        code = val
      })
    })
    .addExtraButton(extraBtn => {
      saveBtn = extraBtn
      saveBtn.setDisabled(true)
      saveBtn.setIcon("save")
      saveBtn.setTooltip("Save")
      saveBtn.onClick(()=>{
        saveBtn.setDisabled(true)
        saveBtn.extraSettingsEl.style.backgroundColor = this.white
        saveBtn.extraSettingsEl.style.color = this.grey

        if(nameChanged) {
          this.plugin.combinedPluginSettings.customFuncList.delete(lastName)
          this.plugin.combinedPluginSettings.customFuncStringsList.delete(lastName)
        }
        this.plugin.combinedPluginSettings.customFuncStringsList.set(name, code)
        this.plugin.combinedPluginSettings.customFuncList.set(name, createFunction(code))
        this.plugin.saveSettings()

        lastName = name;
        nameChanged = false;

        new Notice("10/10 Would save")
      })
    })
    .addExtraButton((extraBtn)=> {
      deleteBtn = extraBtn
      deleteBtn.setIcon("trash")
      deleteBtn.setTooltip("delete")
      deleteBtn.onClick(()=>{
        this.plugin.combinedPluginSettings.customFuncList.delete(lastName)
        this.plugin.combinedPluginSettings.customFuncStringsList.delete(lastName)
        thisSetting.controlEl.detach()
        this.plugin.saveSettings()
      })
    })

    console.groupEnd()
  }

  /*renderNewFunctionEditor(customFuncDiv: HTMLDivElement) {

    //Console Metadata
    {
      console.groupCollapsed(`renderNewFunctionEditor(customFuncDiv: -)`);
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
    
    let name: string
    let code: string

    new Setting(customFuncDiv) 
    .addText((text) => {
      text.onChange((val)=> name = val)
    })
    .addTextArea((text)=> {
      text.onChange((val)=> code = val)
    })
    .addExtraButton(extraBtn => {

      extraBtn.setTooltip("Save")
      extraBtn.setIcon("save")
      
      extraBtn.onClick(()=>{

        console.groupCollapsed("onClick()\n>> saveButton")
        this.plugin.combinedPluginSettings.customFuncStringsList.set(name, code)
        this.plugin.combinedPluginSettings.customFuncList.set(name, createFunction(code))

        console.log(this.plugin.combinedPluginSettings.customFuncStringsList)
        this.plugin.saveSettings()

        console.groupEnd()
      })
    })

    console.log("added stuff")

    console.groupEnd()
  }

  */
}

export function createFunction(rawString: string): (inputString: string, ...args: any[]) => string {
  return new Function(
    "inputString",
    "...args",
    `return (${rawString})(inputString, ...args);`
  ) as (inputString: string, ...args: any[]) => string;
}
/*
export class CustomFunction {

  plugin: TagsPlus

  funcName: string
  funcRawString: string = ""
  func: (input: string, ...args: any[])=> string


  constructor(plugin: TagsPlus, funcName: string, rawString: string | HTMLDivElement) {
    this.plugin = plugin

    this.funcName = funcName

    if(rawString instanceof HTMLDivElement) {
      this.render(rawString)
    }

    else {
      this.funcRawString = rawString
      this.func = new Function(
        "inputString",
        "...args",
        `return (${rawString})(inputString, ...args);`
      ) as (inputString: string, ...args: any[]) => any;
    }

  }


  render(containerEl: HTMLDivElement) {

    let name = this.funcName
    let code = this.funcRawString
    let extraBtn: ExtraButtonComponent

    new Setting(containerEl)
    .addText(text=> {
      text.setValue(this.funcName)
      text.onChange((val)=>{
        extraBtn.disabled = false
        name = val
      })
    })
    .addTextArea((text) => {
      text.setValue(this.funcRawString)
      text.onChange((val)=>{
        extraBtn.disabled = false
        code = val
      })
    })
    .addExtraButton((button) => {
      extraBtn = button
      extraBtn.disabled = true
      extraBtn.setIcon("save")
      extraBtn.onClick(()=>{
        this.plugin.combinedPluginSettings.customFuncStringsList.set()
      })
    })
  }
}
*/
/*
(test) => {
  return test
}*/