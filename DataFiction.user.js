// ==UserScript==
// @name         DataFiction
// @namespace    https://github.com/ReluctusB
// @version      1.2.6
// @description  DataFiction.net is a set of userscripts that provides useful (and more esoteric) information to users of Fimfiction.net at a glance.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// @downloadURL  https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// ==/UserScript==

//General Functions
function kConvert(inStr) {
    inStr = inStr.replace(/,/g,"");
    return !inStr.includes("k")?parseInt(inStr):parseFloat(inStr)*1000;
}

function timeConvert(inMinutes) {
    return inMinutes >= 525600 ? (inMinutes/525600).toFixed(2) + " years"
        : inMinutes >= 10080 ? (inMinutes/10080).toFixed(2) + " weeks"
        : inMinutes >= 1440 ? (inMinutes/1440).toFixed(2) + " days"
        : inMinutes >= 60 ? (inMinutes/60).toFixed(2) + " hours"
        : inMinutes.toFixed(2) + " minutes";
}

function eleBuilder(eleStr, propObj) {
    let ele = document.createElement(eleStr);
    if (propObj.class) {ele.className = propObj.class;}
    if (propObj.HTML) {ele.innerHTML = propObj.HTML;}
    if (propObj.text) {ele.innerText = propObj.text;}
    if (propObj.id) {ele.id = propObj.id;}
    if (propObj.type) {ele.type = propObj.type;}
    return ele;
}

//Follow/Fic
function cardFicFollow(card) {
    let links = card.getElementsByClassName("user-links")[0];
    let fics = kConvert(links.childNodes[0].firstChild.textContent);
    let followers = kConvert(links.childNodes[2].firstChild.textContent);
    let ratio = (followers/fics).toFixed(1);
    if (!isNaN(ratio) && isFinite(ratio)) {
        links.childNodes[2].firstChild.innerText = followers + " (" + ratio + ")";
        card.getElementsByClassName("sub-info")[0].innerHTML = "<b>"+followers+"</b> followers · <b>"+fics+"</b> stories · <b>"+ratio+"</b> f/f ratio";
    }
}

function ficFollow() {
    if (document.getElementsByClassName("tabs")[0]) {
        let fics = kConvert(document.querySelector(".tab-stories span.number").textContent);
        let followers = kConvert(document.querySelector(".tab-followers span.number").textContent);
        let ratio = (followers/fics).toFixed(2);
        if (!isNaN(ratio) && isFinite(ratio)) {
            let info = document.getElementsByClassName("tab-following")[0];
            info.parentNode.insertBefore(eleBuilder("LI", {HTML:"<a><span class='number'>"+ratio+"</span> Follow/Fic</a>"}), info);
            let dropdown = document.querySelector(".mobile-header .drop-down > ul");
            dropdown.style.overflow = "hidden";
            dropdown.appendChild(eleBuilder("LI", {class:"divider"}));
            dropdown.appendChild(eleBuilder("LI", {HTML:"<a><i class='fa fa-fw fa-eye'></i> Follow/Fic: "+ratio+"</a>"}));
        }
    }
    let authorLinks = document.querySelectorAll("a[href*='/user/']");
    //Starting at 11 gets us past the links in the header - RB
    for (let i=11;i<authorLinks.length;i++) {
        authorLinks[i].addEventListener("mouseover",() => setTimeout(() => {
            let curCards = document.getElementsByClassName("user-card");
            cardFicFollow(curCards[curCards.length-1]);
        },400));
    }
    let cards = document.getElementsByClassName("user-card");
    for (let i=0;i<cards.length;i++) {
        cardFicFollow(cards[i]);
    }
}

//Votes/Views
function voteViews() {
    let bars = document.querySelectorAll(".rating-bar, div.featured_story>.info");
    let ups, views, ratio, appendEle, outSpan, appBefore, fragment, fragBefore, approx, parentClasses;
    let barGreen = localStorage.getItem("stylesheet") === "dark" ? "#72ce72" : "#75a83f";
    const threshold = datafic_settings["datafic-VVT"]?datafic_settings["datafic-VVT"]:10;
    for (let i=0;i<bars.length;i++) {
        parentClasses = bars[i].parentNode.classList;
        fragment = new DocumentFragment();
        if (parentClasses.contains("story-card__info")) {
            ups = kConvert(bars[i].previousSibling.textContent);
            views = kConvert(bars[i].parentNode.childNodes[14].textContent.replace("views",""));
            approx = bars[i].parentNode.childNodes[14].textContent.includes("k")?"~":"";
            appendEle = bars[i].parentNode;
            appBefore = fragBefore = null;
            fragment.appendChild(eleBuilder("B", {text:"· "}));
        } else if (parentClasses.contains("featured_story")) {
            ups = kConvert(bars[i].childNodes[9].textContent);
            views = kConvert(bars[i].childNodes[5].textContent.replace("views",""));
            approx = bars[i].childNodes[5].textContent.includes("k")?"~":"";
            appendEle = bars[i];
            appBefore = fragBefore = null;
            fragment.appendChild(eleBuilder("B", {text:"· "}));
        } else if (parentClasses.contains("rating_container") && !document.querySelector(".chapter_content_box")) {
            ups = kConvert(bars[i].previousSibling.textContent);
            views = kConvert(bars[i].parentNode.querySelector("[title~='views']").title);
            approx = "";
            appendEle = bars[i].parentNode;
            appBefore = bars[i].parentNode.querySelector("[title~='comments']");
            fragment.appendChild(eleBuilder("DIV", {class:"divider"}));
            fragBefore = fragment.firstChild;
        }
        ratio = ((ups/views)*100).toFixed(2);
        if (!isNaN(ratio) && isFinite(ratio)) {
            outSpan = eleBuilder("SPAN", {text:approx + ratio + "%"});
            if (ratio >= threshold) {outSpan.style.color = barGreen;}
            fragment.insertBefore(outSpan,fragBefore);
            appendEle.insertBefore(fragment,appBefore);
        }
    }
}

//Reading Time
function readingTime() {
    const userWMP = datafic_settings["datafic-WPM"]?datafic_settings["datafic-WPM"]:250;
    let wordCount = document.querySelectorAll(".word_count > b");
    if (wordCount.length !== 0) {
        let sheet = document.head.appendChild(document.createElement("style")).sheet;
        sheet.insertRule('.word_count {text-align:right; width:25%}',sheet.cssRules.length);
        for (let i=0;i<wordCount.length;i++) {
            wordCount[i].parentNode.insertAdjacentHTML('beforeend'," ·&nbsp;" + timeConvert(kConvert(wordCount[i].textContent)/userWMP));
        }
    }
    let wordCountList = document.querySelector("div.content_box i.fa-font + b");
    if (wordCountList !== null) {
        document.querySelector("div.content_box > span,div.content_box > p > span").title = "Based on your average reading speed of " + userWMP + " wpm";
        document.querySelector("div.content_box i.fa-clock-o + b").nextSibling.textContent = " " + timeConvert(kConvert(wordCountList.nextSibling.textContent)/userWMP);
    }
}

//Average Chapter Post Rate
function averagePost() {
    let chapterLists = document.querySelectorAll("ul.chapters");
    for (let i=0;i<chapterLists.length;i++) {
        let chapters = chapterLists[i].getElementsByClassName("title-box");
        let footer = chapterLists[i].nextSibling.nextSibling;
        if (footer.getElementsByTagName("SPAN")[0].title.match(/(Incomplete|Hiatus)/g)|| datafic_settings["datafic-APD"] === 1) {
            let postDates = [];
            for (let i=0;i<chapters.length;i++) {
                if (chapters[i].getElementsByClassName("date")[0]) {
                    postDates.push(Date.parse(chapters[i].getElementsByClassName("date")[0].childNodes[1].textContent.replace(/(th|nd|rd|st|)/g,"")));
                }
            }
            let diffSum = 0;
            for (let i=postDates.length-1;i>0;i--) {
                if (postDates[i-1]) {diffSum += Math.abs(postDates[i] - postDates[i-1]);}
            }
            let lastUpdate = postDates[postDates.length - 1];
            let fragment = new DocumentFragment();
            fragment.appendChild(document.createElement("BR"));
            if (diffSum > 0 && (footer.getElementsByTagName("SPAN")[0].title !== "On Hiatus" || datafic_settings["datafic-APD"] === 1)) {
                let postSpan = eleBuilder("SPAN", {class:"approved-date",text:"Updates on average every " + timeConvert((diffSum/postDates.length)/60000)});
                let expectedUpdate = new Date(lastUpdate + diffSum/postDates.length);
                let timeTo = (expectedUpdate - Date.now())/60000;
                postSpan.title = "Expected to update on " + expectedUpdate.toDateString() + (timeTo > 0?" (" + timeConvert(timeTo) + ")":"");
                fragment.appendChild(postSpan);
            }
            let lastUp = (Date.now() - lastUpdate)/60000;
            fragment.appendChild(eleBuilder("SPAN", {class:"approved-date",text:"Last update: " + (lastUp > 1440?timeConvert(lastUp) + " ago":"today")}));
            footer.append(fragment);
        }
    }
}

//Settings Manager
function row(label, setting) {
    this.element = document.createElement("TR");
    this.element.style.gridTemplateColumns = "35% 65%";
    let lab = eleBuilder("TD", {class:"label",text:label + " "});
    let infoLink = eleBuilder("A", {HTML:"<i class='fa fa-question-circle'></i>"});
    infoLink.href = "https://github.com/ReluctusB/DataFiction.net/blob/Dev-compiled/features.md#"+label.toLowerCase().replace(/\//g,"").replace(/ /g,"-");
    infoLink.target="_blank";
    lab.appendChild(infoLink);
    this.element.appendChild(lab);
    let opt = document.createElement("TD");
    opt.appendChild(toggleIn(setting));
    this.element.appendChild(opt);
    return this.element;
}

function toggleIn(localVar) {
    this.element = eleBuilder("LABEL",{class:"toggleable-switch"});
    let optBox = eleBuilder("INPUT",{id:localVar, type:"checkbox"});
    this.element.appendChild(optBox);
    this.element.appendChild(document.createElement("A"));
    optBox.addEventListener("change",function(){toggleSetting(localVar);});
    return this.element;
}

function textIn(localVar, defaultVar) {
    this.element = eleBuilder("INPUT",{type:"text"});
    this.element.value = datafic_settings[localVar]?datafic_settings[localVar]:defaultVar;
    this.element.addEventListener("change", function(){datafic_settings[localVar] = verify(this.value,this);
    localStorage["datafic-settings"] = JSON.stringify(datafic_settings);});
    return this.element;
}

function settingDisplay() {
    for(let i = 0; i < setList.length; i++) {
        document.getElementById(setList[i]).checked = datafic_settings[setList[i]] == 1?true:false;
    }
}

function toggleSetting(setting) {
    datafic_settings[setting] = datafic_settings[setting] == 1?0:1;
    localStorage["datafic-settings"] = JSON.stringify(datafic_settings);
}

function verify(inVal, ele) {
    ele.style.color = "black";
    inVal = parseInt(inVal);
    return isNaN(inVal)?(ele.style.backgroundColor = "#b97e6e",null):(ele.style.backgroundColor = "#86b75c",inVal);
}

function setUpManager() {
    let fragment = new DocumentFragment();
    let dataSettingsRowHeader = eleBuilder("TR", {class:"section_header",HTML:"<td colspan='2'><b>DataFiction.net Settings</b></td>"});
    fragment.appendChild(dataSettingsRowHeader);
    let dataSettingsVV = new row("Votes/Views Percentage", "datafic-VV");
    dataSettingsVV.lastChild.appendChild(document.createElement("BR"));
    dataSettingsVV.lastChild.appendChild(document.createTextNode("Highlight percentages above: (make blank to disable)"));
    dataSettingsVV.lastChild.appendChild(new textIn("datafic-VVT", 10));
    fragment.appendChild(dataSettingsVV);
    fragment.appendChild(new row("Followers/Fic Ratio","datafic-FF"));
    let dataSettingsRT = new row("Personalized Reading Times","datafic-RT");
    dataSettingsRT.lastChild.appendChild(document.createElement("BR"));
    dataSettingsRT.lastChild.appendChild(document.createTextNode("Your reading speed, in words per minute:"));
    dataSettingsRT.lastChild.appendChild(new textIn("datafic-WPM", 250));
    fragment.appendChild(dataSettingsRT);
    let dataSettingsAP = new row("Average Post Schedule","datafic-AP");
    dataSettingsAP.lastChild.appendChild(document.createElement("BR"));
    dataSettingsAP.lastChild.appendChild(new toggleIn("datafic-APD"));
    dataSettingsAP.lastChild.appendChild(document.createTextNode("Display regardless of completion"));
    fragment.appendChild(dataSettingsAP);
    document.querySelector("table.properties > tbody").appendChild(fragment);
    settingDisplay();
}

function settingSetup() {
    let settings = {};
    if (localStorage["datafic-settings"]) {
        settings = JSON.parse(localStorage["datafic-settings"]);
        for(let i = 0; i < setList.length; i++) {
            if (!settings[setList[i]]) {settings[setList[i]] = 0;}
        }
    } else {
        settings = {"datafic-VV":1,"datafic-FF":1,"datafic-RT":0,"datafic-AP":1};
    }
    localStorage["datafic-settings"] = JSON.stringify(settings);
}

//Main
const version = GM_info.script.version;
const setList = ["datafic-VV","datafic-FF","datafic-RT","datafic-AP","datafic-APD"];

if (localStorage.getItem("datafic-version") !== version || !localStorage["datafic-settings"]) {
    settingSetup();
    localStorage.setItem("datafic-version", version);
}
var datafic_settings = JSON.parse(localStorage["datafic-settings"]);
if (datafic_settings["datafic-VV"] === 1) {voteViews();}
if (datafic_settings["datafic-FF"] === 1 && !window.location.href.includes("manage")) {ficFollow();}
if (datafic_settings["datafic-RT"] === 1) {readingTime();}
if (datafic_settings["datafic-AP"] === 1) {averagePost();}
if (window.location.href.includes("manage/local-settings")) {setUpManager();}
