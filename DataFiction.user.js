// ==UserScript==
// @name         DataFiction
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  DataFiction.net is a set of userscripts that provides useful (and more esoteric) information to users of Fimfiction.net at a glance.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// @require      https://github.com/ReluctusB/DataFiction.net/raw/master/fic_follower.core.js
// @require      https://github.com/ReluctusB/DataFiction.net/raw/master/view_vote.core.js
// @require      https://github.com/ReluctusB/DataFiction.net/raw/master/settings_manager.user.js
// @require      https://github.com/ReluctusB/DataFiction.net/raw/master/settings.core.js
// @updateURL    https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// @downloadURL  https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// ==/UserScript==

if (localStorage.getItem("datafic-initialized") !== "true") {
    settingSetup();
    localStorage.setItem("datafic-initialized", "true");
}

if (localStorage.getItem("datafic-VV") === "true") {
    viewVote();
}

if (localStorage.getItem("datafic-VV") === "true") {
    ficFollow();
}
