// ==UserScript==
// @name         DataFiction
// @namespace    https://github.com/ReluctusB
// @version      1.1.2
// @description  DataFiction.net is a set of userscripts that provides useful (and more esoteric) information to users of Fimfiction.net at a glance.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// @downloadURL  https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// ==/UserScript==

//Follow/Fic
function cardFicFollow() {
    let cards = document.getElementsByClassName("user-card");
    for (let i=0;i<cards.length;i++) {
        let links = cards[i].getElementsByClassName("user-links")[0];
        let fics = parseInt(links.childNodes[0].firstChild.textContent.replace(",",""));
        let followers = parseInt(links.childNodes[2].firstChild.textContent.replace(",",""));
        let ratio = (followers/fics).toFixed(1);
        if (!isNaN(ratio) && isFinite(ratio)) {
            links.childNodes[2].firstChild.innerHTML = followers + " (" + ratio + ")";
            cards[i].getElementsByClassName("sub-info")[0].innerHTML = "<b>"+followers+"</b> followers · <b>"+fics+"</b> stories · <b>"+ratio+"</b> f/f ratio";
        }
    }
}

function ficFollow() {
    if (document.getElementsByClassName("tabs")[0]) {
        let fics = parseInt(document.querySelector(".tab-stories span.number").textContent.replace(",",""));
        let followers = parseInt(document.querySelector(".tab-followers span.number").textContent.replace(",",""));
        let ratio = (followers/fics).toFixed(2);
        if (!isNaN(ratio) && isFinite(ratio)) {
            let info = document.querySelector("li.tab-following");
            let newTab = document.createElement("LI");
            newTab.innerHTML = "<a><span class='number'>"+ratio+"</span> Follow/Fic</a>";
            info.parentNode.insertBefore(newTab, info);
        }
    }
    var authorLinks = document.querySelectorAll("a[href*='/user/']");
    //Starting at 11 gets us past the links in the header - RB
    for (let i=11;i<authorLinks.length;i++) {
        authorLinks[i].addEventListener("mouseover",function(){
            setTimeout(cardFicFollow,500);
        });
    }
    cardFicFollow();
}

//View/Vote
function kConvert(inStr) {
    if (!inStr.includes("k")) {
	return parseInt(inStr);
    } else {
	return parseFloat(inStr)*1000;
    }
}

function viewVote() {
    let bars = document.querySelectorAll(".rating-bar, div.featured_story>.info");
    let ups, views, ratio, appendEle, prec, outSpan, appBefore, fragment, fragBefore, approx, parentClasses;
    let barGreen = localStorage.getItem("stylesheet") === "dark" ? "#72ce72" : "#75a83f";
    for (let i=0;i<bars.length;i++) {
        parentClasses = bars[i].parentNode.classList;
        fragment = new DocumentFragment();
        approx = "";
        if (parentClasses.contains("story-card__info")) {
            ups = kConvert(bars[i].previousSibling.textContent.replace(",",""));
            views = kConvert(bars[i].parentNode.childNodes[14].textContent.replace("views",""));
            if (bars[i].parentNode.childNodes[14].textContent.includes("k")) {
                approx = "~";
            }
            appendEle = bars[i].parentNode;
            appBefore = fragBefore = null;
            prec = document.createElement("B");
            prec.appendChild(document.createTextNode("· "));
            fragment.appendChild(prec);
        } else if (parentClasses.contains("featured_story")) {
            ups = kConvert(bars[i].childNodes[9].textContent.replace(",",""));
            views = kConvert(bars[i].childNodes[5].textContent.replace("views",""));
            if (bars[i].childNodes[5].textContent.includes("k")) {
                approx = "~";
            }
            appendEle = bars[i];
            appBefore = fragBefore = null;
            prec = document.createElement("B");
            prec.appendChild(document.createTextNode("· "));
            fragment.appendChild(prec);
        } else if (parentClasses.contains("rating_container") && !document.querySelector(".chapter_content_box")) {
            ups = kConvert(bars[i].previousSibling.textContent.replace(",",""));
            views = parseInt(bars[i].parentNode.querySelector("[title~='views']").title.replace(",",""));
            appendEle = bars[i].parentNode;
            appBefore = bars[i].parentNode.querySelector("[title~='comments']");
            prec = document.createElement("DIV");
            prec.className = "divider";
            fragment = new DocumentFragment();
            fragment.appendChild(prec);
            fragment.appendChild(prec);
            fragBefore = fragment.firstChild;
        }
        ratio = ((ups/views)*100).toFixed(2);
        if (isNaN(ratio) || !isFinite(ratio)) {
            continue;
        } else {
            outSpan = document.createElement("SPAN");
            outSpan.appendChild(document.createTextNode(approx + ratio + "%"));
            if (ratio >= 10) {
                outSpan.style.color = barGreen;
            }
        }
        fragment.insertBefore(outSpan,fragBefore);
        appendEle.insertBefore(fragment,appBefore);
    }
}

//Reading Time
function timeConvert(inMinutes) {
    if (inMinutes >= 525600) {
        return (inMinutes/525600).toFixed(2) + " years";
    } else if (inMinutes >= 10080) {
        return (inMinutes/10080).toFixed(2) + " weeks";
    } else if (inMinutes >= 1440) {
        return (inMinutes/1440).toFixed(2) + " days";
    } else if (inMinutes >= 60) {
        return (inMinutes/60).toFixed(2) + " hours";
    } else {
        return inMinutes.toFixed(2) + " minutes";
    }
}

function readingTime() {
    const userWMP = localStorage.getItem("datafic-WPM");
    let wordCount = document.querySelectorAll(".word_count > b");
    if (wordCount.length !== 0) {
        let sheet = document.head.appendChild(document.createElement("style")).sheet;
        sheet.insertRule('.word_count {text-align:right; width:25%}',sheet.cssRules.length);
        for (let i=0;i<wordCount.length;i++) {
            let storyWCount = parseInt(wordCount[i].textContent.replace(/,/g,""));
            wordCount[i].parentNode.innerHTML += " ·&nbsp;" + timeConvert(storyWCount/userWMP);
        }
    }
    let wordCountList = document.querySelector("div.content_box i.fa-font + b");
    if (wordCountList !== null) {
        let queryWordCount = parseInt(wordCountList.nextSibling.textContent.replace(/,/g,""));
        document.querySelector("div.content_box > span,div.content_box > p > span").title = "Based on your average reading speed of " + userWMP + " wpm";
        document.querySelector("div.content_box i.fa-clock-o + b").nextSibling.textContent = " " + timeConvert(queryWordCount/userWMP);
    }
}

//Settings Manager

function row(label, setting) {
    this.element = document.createElement("TR");
    let lab = document.createElement("TD");
    lab.className = "label";
    lab.appendChild(document.createTextNode(label));
    let infoLink = document.createElement("A");
    infoLink.href = "https://github.com/ReluctusB/DataFiction.net/blob/Dev-compiled/features.md#"+label.toLowerCase().replace(/\//g,"").replace(/ /g,"-");
    infoLink.target="_blank";
    infoLink.innerHTML = " <i class='fa fa-question-circle'></i>";
    lab.appendChild(infoLink);
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
    optBox.addEventListener("change",function(){toggleSetting(setting);});
    this.element.appendChild(opt);
    return this.element;
}

function settingDisplay() {
    for(let i = 0; i < setList.length; i++) {
        if (datafic_settings[setList[i]] == 1) {
            document.getElementById(setList[i]).checked = true;
        }
    }
}

function toggleSetting(setting) {
    if (datafic_settings[setting] == 0){
        datafic_settings[setting] = 1;
    } else {
        datafic_settings[setting] = 0;
    }
    localStorage["datafic-settings"] = JSON.stringify(datafic_settings);
}

function verify(inVal, ele) {
    let outVal = parseInt(inVal);
    if (isNaN(outVal)) {
        ele.style.backgroundColor = "#b97e6e";
	return null;
    } else {
        ele.style.backgroundColor = "";
        return outVal;
    }
}

function setUpManager() {
    var fragment = new DocumentFragment();
    var dataSettingsRowHeader = document.createElement("tr");
    dataSettingsRowHeader.className = "section_header";
    dataSettingsRowHeader.innerHTML = "<td colspan='2'><b>DataFiction.net Settings</b></td>";
    var dataSettingsVV = new row("Views/Vote", "datafic-VV");
    var dataSettingsFF = new row("Followers/Fic","datafic-FF");
    var dataSettingsRT = new row("Personalized Reading Times","datafic-RT");
    var WPMInput = document.createElement("INPUT");
    WPMInput.type = "text";
    WPMInput.value = localStorage.getItem("datafic-WPM")?localStorage.getItem("datafic-WPM"):250;
    WPMInput.addEventListener("change", function(){localStorage.setItem("datafic-WPM",verify(this.value,this));});
    WPMInput.style.marginTop = "1rem";
    dataSettingsRT.lastChild.firstChild.appendChild(document.createTextNode("Your reading speed, in words per minute:"));
    dataSettingsRT.lastChild.appendChild(WPMInput);
    fragment.appendChild(dataSettingsRowHeader);
    fragment.appendChild(dataSettingsVV);
    fragment.appendChild(dataSettingsFF);
    fragment.appendChild(dataSettingsRT);
    document.querySelector("table.properties > tbody").appendChild(fragment);
    document.getElementById("datafic-RT").addEventListener("change",function(){localStorage.setItem("datafic-WPM",WPMInput.value);});
    settingDisplay();
}

function settingSetup() {
    let settings = {};
    if (localStorage["datafic-settings"]) {
        settings = JSON.parse(localStorage["datafic-settings"]);
        for(let i = 0; i < setList.length; i++) {
            if (!settings[setList[i]]) {
                settings[setList[i]] = 1;
            }
        }
    } else {
        settings = {"datafic-VV":1,"datafic-FF":1,"datafic-RT":0};
    }
    localStorage["datafic-settings"] = JSON.stringify(settings);
}

//Main
const version = GM_info.script.version;
const setList = ["datafic-VV","datafic-FF","datafic-RT"];

if (localStorage.getItem("datafic-version") !== version || !localStorage["datafic-settings"]) {
    settingSetup();
    localStorage.setItem("datafic-version", version);
}
var datafic_settings = JSON.parse(localStorage["datafic-settings"]);
if (datafic_settings["datafic-VV"] == 1) {
    viewVote();
}
if (datafic_settings["datafic-FF"] == 1 && !window.location.href.includes("manage")) {
    ficFollow();
}
if (datafic_settings["datafic-RT"] == 1) {
    readingTime();
}
if (window.location.href.includes("manage/local-settings")) {
    setUpManager();
}
