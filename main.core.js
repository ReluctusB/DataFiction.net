// ==UserScript==
// @name         DataFiction
// @namespace    https://github.com/ReluctusB
// @version      1.0
// @description  DataFiction.net is a set of userscripts that provides useful (and more esoteric) information to users of Fimfiction.net at a glance.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

function settingSetup() {
    for(let i = 0; i < setList.length; i++) {
        if (localStorage.getItem(setList[i]) === null) {
            localStorage.setItem(setList[i],"true");
        }
    }
}

if (localStorage.getItem("datafic-initialized") !== "true") {
    settingSetup();
    localStorage.setItem("datafic-initialized", "true");
}

if (localStorage.getItem("datafic-VV") === "true") {
    viewVote();
}

if (localStorage.getItem("datafic-FF") === "true" && !window.location.href.includes("manage")) {
    ficFollow();
}

if (window.location.href.includes("manage/local-settings")) {
    setUpManager();
}
