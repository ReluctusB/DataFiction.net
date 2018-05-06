// ==UserScript==
// @name         Fic/Follower Display
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Displays an author's follower/fic ratio
// @author       RB
// @match        https://www.fimfiction.net/*
// @grant        none
// @run-at       document-end
// ==/UserScript==

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
