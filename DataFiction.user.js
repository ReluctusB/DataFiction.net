// ==UserScript==
// @name         DataFiction
// @namespace    https://github.com/ReluctusB
// @version      1.2.3
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

//Follow/Fic
function cardFicFollow() {
    let cards = document.getElementsByClassName("user-card");
    for (let i=0;i<cards.length;i++) {
        let links = cards[i].getElementsByClassName("user-links")[0];
        let fics = kConvert(links.childNodes[0].firstChild.textContent);
        let followers = kConvert(links.childNodes[2].firstChild.textContent);
        let ratio = (followers/fics).toFixed(1);
        if (!isNaN(ratio) && isFinite(ratio)) {
            links.childNodes[2].firstChild.innerHTML = followers + " (" + ratio + ")";
            cards[i].getElementsByClassName("sub-info")[0].innerHTML = "<b>"+followers+"</b> followers · <b>"+fics+"</b> stories · <b>"+ratio+"</b> f/f ratio";
        }
    }
}

function ficFollow() {
    if (document.getElementsByClassName("tabs")[0]) {
        let fics = kConvert(document.querySelector(".tab-stories span.number").textContent);
        let followers = kConvert(document.querySelector(".tab-followers span.number").textContent);
        let ratio = (followers/fics).toFixed(2);
        if (!isNaN(ratio) && isFinite(ratio)) {
            let info = document.getElementsByClassName("tab-following")[0];
            let newTab = document.createElement("LI");
            newTab.innerHTML = "<a><span class='number'>"+ratio+"</span> Follow/Fic</a>";
            info.parentNode.insertBefore(newTab, info);
            let newDropdownItem = document.createElement("LI");
            let newDropdownDivider = document.createElement("LI");
            newDropdownItem.innerHTML = "<a><i class='fa fa-fw fa-eye'></i> Follow/Fic: "+ratio+"</a>";
            newDropdownDivider.className = "divider";
            let dropdown = document.querySelector(".mobile-header .drop-down > ul");
            dropdown.style.overflow = "hidden";
            dropdown.appendChild(newDropdownDivider);
            dropdown.appendChild(newDropdownItem);
        }
    }
    let authorLinks = document.querySelectorAll("a[href*='/user/']");
    //Starting at 11 gets us past the links in the header - RB
    for (let i=11;i<authorLinks.length;i++) {
        authorLinks[i].addEventListener("mouseover",function(){
            setTimeout(cardFicFollow,500);
        });
    }
    cardFicFollow();
}

//Votes/Views
function voteViews() {
    let bars = document.querySelectorAll(".rating-bar, div.featured_story>.info");
    let ups, views, ratio, appendEle, prec, outSpan, appBefore, fragment, fragBefore, approx, parentClasses;
    let barGreen = localStorage.getItem("stylesheet") === "dark" ? "#72ce72" : "#75a83f";
    const threshold = localStorage.getItem("datafic-VVT")?parseInt(localStorage.getItem("datafic-VVT")):10;
    for (let i=0;i<bars.length;i++) {
        parentClasses = bars[i].parentNode.classList;
        fragment = new DocumentFragment();
        if (parentClasses.contains("story-card__info")) {
            ups = kConvert(bars[i].previousSibling.textContent);
            views = kConvert(bars[i].parentNode.childNodes[14].textContent.replace("views",""));
            approx = bars[i].parentNode.childNodes[14].textContent.includes("k")?"~":"";
            appendEle = bars[i].parentNode;
            appBefore = fragBefore = null;
            prec = document.createElement("B");
            prec.appendChild(document.createTextNode("· "));
            fragment.appendChild(prec);
        } else if (parentClasses.contains("featured_story")) {
            ups = kConvert(bars[i].childNodes[9].textContent);
            views = kConvert(bars[i].childNodes[5].textContent.replace("views",""));
            approx = bars[i].childNodes[5].textContent.includes("k")?"~":"";
            appendEle = bars[i];
            appBefore = fragBefore = null;
            prec = document.createElement("B");
            prec.appendChild(document.createTextNode("· "));
            fragment.appendChild(prec);
        } else if (parentClasses.contains("rating_container") && !document.querySelector(".chapter_content_box")) {
            ups = kConvert(bars[i].previousSibling.textContent);
            views = kConvert(bars[i].parentNode.querySelector("[title~='views']").title);
            approx = "";
            appendEle = bars[i].parentNode;
            appBefore = bars[i].parentNode.querySelector("[title~='comments']");
            prec = document.createElement("DIV");
            prec.className = "divider";
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
            if (ratio >= threshold) {
                outSpan.style.color = barGreen;
            }
        }
        fragment.insertBefore(outSpan,fragBefore);
        appendEle.insertBefore(fragment,appBefore);
    }
}

//Reading Time
function readingTime() {
    const userWMP = localStorage.getItem("datafic-WPM")?parseInt(localStorage.getItem("datafic-WPM")):250;
    let wordCount = document.querySelectorAll(".word_count > b");
    if (wordCount.length !== 0) {
        let sheet = document.head.appendChild(document.createElement("style")).sheet;
        sheet.insertRule('.word_count {text-align:right; width:25%}',sheet.cssRules.length);
        for (let i=0;i<wordCount.length;i++) {
            let storyWCount = kConvert(wordCount[i].textContent);
            wordCount[i].parentNode.innerHTML += " ·&nbsp;" + timeConvert(storyWCount/userWMP);
        }
    }
    let wordCountList = document.querySelector("div.content_box i.fa-font + b");
    if (wordCountList !== null) {
        let queryWordCount = kConvert(wordCountList.nextSibling.textContent);
        document.querySelector("div.content_box > span,div.content_box > p > span").title = "Based on your average reading speed of " + userWMP + " wpm";
        document.querySelector("div.content_box i.fa-clock-o + b").nextSibling.textContent = " " + timeConvert(queryWordCount/userWMP);
    }
}

//Average Chapter Post Rate
function averagePost() {
    let chapterLists = document.querySelectorAll("ul.chapters");
    for (let i=0;i<chapterLists.length;i++) {
        let chapters = chapterLists[i].getElementsByClassName("title-box");
        let footer = chapterLists[i].nextSibling.nextSibling;
        if (true && (footer.getElementsByTagName("SPAN")[0].title.match(/(Incomplete|Hiatus)/g)|| datafic_settings["datafic-APD"] === 1)) {
            let postDates = [];
            for (let i=0;i<chapters.length;i++) {
                if (!chapters[i].getElementsByClassName("date")[0]) {continue;}
                postDates.push(Date.parse(chapters[i].getElementsByClassName("date")[0].childNodes[1].textContent.replace(/(th|nd|rd|st|)/g,"")));
            }
            let diffSum = 0;
            for (let i=postDates.length-1;i>0;i--) {
                if (!postDates[i-1]) {break;}
                diffSum += Math.abs(postDates[i] - postDates[i-1]);
            }
            let lastUpdate = postDates[postDates.length - 1];
            let fragment = new DocumentFragment();
            fragment.appendChild(document.createElement("BR"));
            if (diffSum > 0 && (footer.getElementsByTagName("SPAN")[0].title !== "On Hiatus" || datafic_settings["datafic-APD"] === 1)) {
                let postSpan = document.createElement("SPAN");
                postSpan.className = "approved-date";
                postSpan.innerText = "Updates on average every " + timeConvert((diffSum/postDates.length)/60000);
                let expectedUpdate = new Date(lastUpdate + diffSum/postDates.length);
                postSpan.title = "Expected to update on " + expectedUpdate.toDateString();
                fragment.appendChild(postSpan);
            }
            let lastSpan = document.createElement("SPAN");
            lastSpan.className = "approved-date";
            lastSpan.innerText = "Last update: " + timeConvert((Date.now() - lastUpdate)/60000) + " ago";
            fragment.appendChild(lastSpan);
            footer.append(fragment);
        }
    }
}

//Settings Manager
function row(label, setting) {
    this.element = document.createElement("TR");
    this.element.style.gridTemplateColumns = "35% 65%";
    let lab = document.createElement("TD");
    lab.className = "label";
    lab.appendChild(document.createTextNode(label + " "));
    let infoLink = document.createElement("A");
    infoLink.href = "https://github.com/ReluctusB/DataFiction.net/blob/Dev-compiled/features.md#"+label.toLowerCase().replace(/\//g,"").replace(/ /g,"-");
    infoLink.target="_blank";
    infoLink.innerHTML = "<i class='fa fa-question-circle'></i>";
    lab.appendChild(infoLink);
    this.element.appendChild(lab);
    let opt = document.createElement("TD");
    opt.appendChild(toggleIn(setting));
    this.element.appendChild(opt);
    return this.element;
}

function toggleIn(localVar) {
    this.element = document.createElement("LABEL");
    this.element.className = "toggleable-switch";
    let optBox = document.createElement("INPUT");
    optBox.type = "checkbox";
    optBox.id = localVar;
    this.element.appendChild(optBox);
    this.element.appendChild(document.createElement("A"));
    optBox.addEventListener("change",function(){toggleSetting(localVar);});
    return this.element;
}

function textIn(localVar, defaultVar) {
    this.element = document.createElement("INPUT");
    this.element.type = "text";
    this.element.value = localStorage.getItem(localVar)?localStorage.getItem(localVar):defaultVar;
    this.element.addEventListener("change", function(){localStorage.setItem(localVar,verify(this.value,this));});
    this.element.style.marginTop = "1rem";
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
    if (isNaN(parseInt(inVal))) {
        ele.style.backgroundColor = "#b97e6e";
        return null;
    } else {
        ele.style.backgroundColor = "#86b75c";
        return inVal;
    }
}

function setUpManager() {
    let fragment = new DocumentFragment();
    let dataSettingsRowHeader = document.createElement("tr");
    dataSettingsRowHeader.className = "section_header";
    dataSettingsRowHeader.innerHTML = "<td colspan='2'><b>DataFiction.net Settings</b></td>";
    fragment.appendChild(dataSettingsRowHeader);
    let dataSettingsVV = new row("Votes/Views Percentage", "datafic-VV");
    dataSettingsVV.lastChild.appendChild(document.createTextNode("Highlight percentages above: (make blank to disable)"));
    dataSettingsVV.lastChild.appendChild(new textIn("datafic-VVT", 10));
    fragment.appendChild(dataSettingsVV);
    fragment.appendChild(new row("Followers/Fic Ratio","datafic-FF"));
    let dataSettingsRT = new row("Personalized Reading Times","datafic-RT");
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
            if (!settings[setList[i]]) {
                settings[setList[i]] = 0;
            }
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
if (datafic_settings["datafic-VV"] === 1) {
    voteViews();
}
if (datafic_settings["datafic-FF"] === 1 && !window.location.href.includes("manage")) {
    ficFollow();
}
if (datafic_settings["datafic-RT"] === 1) {
    readingTime();
}
if (datafic_settings["datafic-AP"] === 1) {
    averagePost();
}
if (window.location.href.includes("manage/local-settings")) {
    setUpManager();
}
