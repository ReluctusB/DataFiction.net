// ==UserScript==
// @name         DataFiction_settings-manager
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Manages settings for DataFiction.net
// @author       RB
// @match        https://www.fimfiction.net/manage/local-settings
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/ReluctusB/DataFiction.net/raw/master/settings_manager.core.js
// @downloadURL  https://github.com/ReluctusB/DataFiction.net/raw/master/settings_manager.core.js
// ==/UserScript==

const setList = ["datafic-VV","datafic-FF"];

function row(label, setting) {
    this.element = document.createElement("TR");
    let lab = document.createElement("TD");
    lab.className = "label";
    lab.appendChild(document.createTextNode(label));
    this.element.appendChild(lab);
    let opt = document.createElement("TD");
    let optLabel = document.createElement("LABEL");
    optLabel.className = "toggleable-switch";
    let optBox = document.createElement("INPUT");
    optBox.type = "checkbox";
    optBox.id = setting;
    optLabel.appendChild(optBox);
    optLabel.appendChild(document.createElement("A"));
    opt.appendChild(optLabel);
    optBox.addEventListener("change",function(){applySetting(setting);});
    this.element.appendChild(opt);
    return this.element;
}

function settingDisplay() {
    for(let i = 0; i < setList.length; i++) {
        if (localStorage.getItem(setList[i]) === "true") {
            document.getElementById(setList[i]).checked = true;
        }
    }
}

function applySetting(setting) {
    if (localStorage.getItem(setting) === "true"){
        localStorage.setItem(setting,"false");
    } else {
        localStorage.setItem(setting,"true");
    console.log(localStorage.getItem(setting));
    }
}

function setUpManager() {
    var fragment = new DocumentFragment();
    var dataSettingsRowHeader = document.createElement("tr");
    dataSettingsRowHeader.className = "section_header";
    dataSettingsRowHeader.innerHTML = "<td colspan='2'><b>DataFiction.net Settings</b></td>";

    var dataSettingsVV = new row("Display Views/Vote", "datafic-VV");
    var dataSettingsFF = new row("Display Followers/Fic","datafic-FF");

    fragment.appendChild(dataSettingsRowHeader);
    fragment.appendChild(dataSettingsVV);
    fragment.appendChild(dataSettingsFF);

    document.querySelector("table.properties > tbody").appendChild(fragment);
    settingDisplay();
}
