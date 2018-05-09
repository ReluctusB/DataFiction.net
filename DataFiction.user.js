// ==UserScript==
// @name         DataFiction-min
// @namespace    https://github.com/ReluctusB
// @version      1.0
// @description  DataFiction.net is a set of userscripts that provides useful (and more esoteric) information to users of Fimfiction.net at a glance.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// @updateURL    https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// @downloadURL  https://github.com/ReluctusB/DataFiction.net/raw/master/DataFiction.user.js
// ==/UserScript==

//Fic/Follow
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
    var bars = document.querySelectorAll(".rating-bar, div.featured_story>.info");
    var ups, views, ratio, appendEle, prec, outSpan, appBefore, fragment, fragBefore, approx, parentClasses;
    var barGreen = localStorage.getItem("stylesheet") === "dark" ? "#72ce72" : "#75a83f";
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
        } else if (parentClasses.contains("rating_container")) {
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

//Settings Manager
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

//Main
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
