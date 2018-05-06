// ==UserScript==
// @name         Vote/View Display
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Displays percentage of readers who have upvoted a story on that story's card. Highlights green if over 10%.
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

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
        if (isNaN(ratio)) {
            continue;
        } else {
            outSpan = document.createElement("SPAN");
            outSpan.appendChild(document.createTextNode(approx + ratio + "%"));
            if (ratio >= 10) {
                outSpan.style.color = "#72ce72";
            }
        }
        fragment.insertBefore(outSpan,fragBefore);
        appendEle.insertBefore(fragment,appBefore);
    }
}
