// ==UserScript==
// @name         DataFiction
// @namespace    https://github.com/ReluctusB
// @version      1.4.0
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
    const ele = document.createElement(eleStr);
    if (propObj.class) {ele.className = propObj.class;}
    if (propObj.HTML) {ele.innerHTML = propObj.HTML;}
    if (propObj.text) {ele.innerText = propObj.text;}
    if (propObj.id) {ele.id = propObj.id;}
    if (propObj.type) {ele.type = propObj.type;}
    if (propObj.event) {ele.addEventListener(propObj.event[0], propObj.event[1], false);}
    return ele;
}

function popUp(header, width, dim, id) {
    if (document.getElementById(id)) {win.fQuery.removeElement(document.getElementById(id));}
    const upPop = new win.PopUpMenu(id,header);
    upPop.SetWidth(width)
    upPop.SetFixed(true);
    upPop.SetSoftClose(false);
    upPop.SetDimmerEnabled(dim);
    return upPop;
}

//Follow/Fic
function cardFicFollow(card) {
    const links = card.getElementsByClassName("user-links")[0];
    const fics = kConvert(links.childNodes[0].firstChild.textContent);
    const followers = kConvert(links.childNodes[2].firstChild.textContent);
    const ratio = (followers/fics).toFixed(1);
    if (!isNaN(ratio) && isFinite(ratio)) {
        links.childNodes[2].firstChild.innerText = followers + " (" + ratio + ")";
        card.getElementsByClassName("sub-info")[0].innerHTML = `<b>${followers}</b> followers · <b>${fics}</b> stories · <b>${ratio}</b> f/f ratio`;
    }
}

function ficFollow() {
    if (document.getElementsByClassName("tabs")[0]) {
        const fics = kConvert(document.querySelector(".tab-stories span.number").textContent);
        const followers = kConvert(document.querySelector(".tab-followers span.number").textContent);
        const ratio = (followers/fics).toFixed(2);
        if (!isNaN(ratio) && isFinite(ratio)) {
            const info = document.getElementsByClassName("tab-following")[0];
            info.parentNode.insertBefore(eleBuilder("LI", {HTML:`<a><span class='number'>${ratio}</span> Follow/Fic</a>`}), info);
            const dropdown = document.querySelector(".mobile-header .drop-down > ul");
            dropdown.style.overflow = "hidden";
            dropdown.appendChild(eleBuilder("LI", {class:"divider"}));
            dropdown.appendChild(eleBuilder("LI", {HTML:`<a><i class='fa fa-fw fa-eye'></i> Follow/Fic: ${ratio}</a>`}));
        }
    }
    const authorLinks = document.querySelectorAll("a[href*='/user/']");
    for (let i=11;i<authorLinks.length;i++) { //Starting at 11 gets us past the links in the header - RB
        authorLinks[i].addEventListener("mouseover",() => setTimeout(() => {
            const curCards = document.getElementsByClassName("user-card");
            if (curCards.length > 0) {cardFicFollow(curCards[curCards.length-1]);} //fimfic doesn't always load the card generator faster than the user can hover. -RB
        },500));
    }
    [...document.getElementsByClassName("user-card")].forEach(card => cardFicFollow(card));
}

//Votes/Views
function voteViews() {
    const bars = document.querySelectorAll(".rating-bar, div.featured_story>.info");
    const threshold = datafic_settings["datafic-VVT"]?datafic_settings["datafic-VVT"]:10;
    const barGreen = localStorage.getItem("stylesheet") === "dark" ? "#72ce72" : "#75a83f";
    let ups, views, ratio, appendEle, outSpan, appBefore, fragment, fragBefore, approx, parentClasses;
    for (let i=0;i<bars.length;i++) {
        parentClasses = bars[i].parentNode.classList;
        fragment = document.createDocumentFragment();
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
    const wordCount = document.querySelectorAll(".word_count > b");
    if (wordCount.length !== 0) {
        document.head.appendChild(eleBuilder("STYLE",{text:".word_count {text-align:right; width:25%}"}));
        wordCount.forEach(w => w.parentNode.insertAdjacentHTML('beforeend'," ·&nbsp;" + timeConvert(kConvert(w.textContent)/userWMP)))
    }
    let wordCountList = document.querySelector("div.content_box i.fa-font + b");
    if (wordCountList !== null) {
        document.querySelector("div.content_box > span,div.content_box > p > span").title = `Based on your average reading speed of ${userWMP} wpm`;
        document.querySelector("div.content_box i.fa-clock-o + b").nextSibling.textContent = " " + timeConvert(kConvert(wordCountList.nextSibling.textContent)/userWMP);
    }
}

//Average Chapter Post Rate
function averagePost() {
    const chapterLists = document.querySelectorAll("ul.chapters");
    for (let i=0;i<chapterLists.length;i++) {
        const chapters = chapterLists[i].getElementsByClassName("title-box");
        const footer = chapterLists[i].nextSibling.nextSibling;
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
            const lastUpdate = postDates[postDates.length - 1];
            const fragment = document.createDocumentFragment();
            fragment.appendChild(document.createElement("BR"));
            if (diffSum > 0 && (footer.getElementsByTagName("SPAN")[0].title !== "On Hiatus" || datafic_settings["datafic-APD"] === 1)) {
                const postSpan = eleBuilder("SPAN", {class:"approved-date",text:`Updates on average every ${timeConvert((diffSum/postDates.length)/60000)}`});
                const expectedUpdate = new Date(lastUpdate + diffSum/postDates.length);
                const timeTo = (expectedUpdate - Date.now())/60000;
                postSpan.title = "Expected to update on " + expectedUpdate.toDateString() + (timeTo > 0?" (" + timeConvert(timeTo) + ")":"");
                fragment.appendChild(postSpan);
            }
            const lastUp = (Date.now() - lastUpdate)/60000;
            fragment.appendChild(eleBuilder("SPAN", {class:"approved-date",text:"Last update: " + (lastUp > 1440?timeConvert(lastUp) + " ago":"today")}));
            footer.appendChild(fragment);
        }
    }
}

function averageChapterLength() {
    const chapterBoxes = document.querySelectorAll("div.chapters-header + form");
    chapterBoxes.forEach(chapterBox => {
        const chapterLengths = chapterBox.querySelectorAll("span.word-count-number");
        if (chapterLengths.length !== 0) {
            let totalLength = 0;
            chapterLengths.forEach(chapter => {
                totalLength += parseInt(chapter.innerText.replace(/\D/g, ""));
            });
            let avgLength = Math.floor(totalLength/chapterLengths.length);
            const wordCount = chapterBox.querySelectorAll(".word_count > b");
            if (wordCount.length !== 0) {
                document.head.appendChild(eleBuilder("STYLE",{text:".word_count {text-align:right; width:25%}"}));
                wordCount.forEach(w => w.parentNode.insertAdjacentHTML('beforeend'," ·&nbsp;" + avgLength + "&nbsp;w/c"))
            }
        }
    });
}

//Chapter Analyzer
function chapterAnalyze() {
    function getChapter() {
        let chapter = document.querySelector("div#chapter-body > div.bbcode").innerHTML.replace(/<br>|<\/(p|ul|ol)>/g,"\n").replace(/<\/li>/g," ");
        let doc = new DOMParser().parseFromString(chapter, 'text/html');
        [...doc.getElementsByClassName("math_container")].forEach(mathBlock => (mathBlock.textContent=""));
        return(doc.body.textContent);
    }

    function countWords(wordArray) {
        let totalWordList = [[wordArray[0].toLowerCase(),0]];
        for (let i=0;i<wordArray.length;i++){
            let inVal = wordArray[i].toLowerCase(), len = totalWordList.length;
            for (let j=0;j<len;j++) {
                if (totalWordList[j][0] === inVal) {
                    totalWordList[j][1]++;
                    break;
                } else if (j+1 === totalWordList.length) {
                    totalWordList.push([inVal, 1])
                }
            }
        }
        return totalWordList.sort((a,b)=> b[1] - a[1]);
    }

    function generateWcTable(title, list) {
        let wcTable = `<table style='margin:0 auto;'><th colspan='2'><b>${title}</b><th>`;
        list.forEach((item, i) => {
            wcTable += `<tr style='display:grid;grid-template-columns:115px 35px;'title='#${(i+1)}'>
                            <td style='overflow:hidden;'>${item[0]}</td>
                            <td style='text-align:right;'>${item[1]}</td>
                        </tr>`;
        });
        return (wcTable += "</table>");
    }

    function fRResult(score) {
        return score >= 90 ? "Very Easy"
            : score >= 80 ? "Easy"
            : score >= 70 ? "Fairly Easy"
            : score >= 60 ? "Standard"
            : score >= 50 ? "Fairly Difficult"
            : score >= 30 ? "Difficult"
            : "Very confusing";
    }

    //countSyllablesAndPolys taken from Syllabificate: https://github.com/EndaHallahan/syllabificate
    function countSyllablesAndPolys (wordList) {
        let syllablesTotal = 0, polysTotal = 0;
        wordList.forEach((word) => {
            if (word === "'"||word==="’") {return;} //bandaid solution.
            if (word.length <= 2) {syllablesTotal += 1; return;} //quick return on short words
            let syllables = 0;
            if (word.endsWith("s'")||word.endsWith("s’")) {word.slice(-1);} //ending with s'
            if (word.endsWith("s's")||word.endsWith("s’s")) {word.slice(-1,-3);} //ending with s's
            const cEndings = word.match(/(?<=\w{3})(side|\wess|(?<!ed)ly|ment|ship|board|ground|(?<![^u]de)ville|port|ful(ly)?|berry|box|nesse?|such|m[ae]n|wom[ae]n|horse|anne)s?$/mi);
            if (cEndings) {word = word.replace(cEndings[0],"\n" + cEndings[0]);} //Splits into two words and evaluates them as such
            const cBeginnings = word.match(/^(ware|side|p?re(?!ach|agan|al|au))/mi);
            if (cBeginnings) {word = word.replace(cBeginnings[0],""); syllables++;}
            const esylp = word.match(/ie($|l|t|rg)|([cb]|tt|pp)le$|phe$|kle(s|$)|[^n]scien|sue|aybe$|[^aeiou]shed|[^lsoai]les$|([^e]r|g)ge$|(gg|ck|yw|etch)ed$|(sc|o)he$|seer|^re[eiuy]/gmi);
            if (esylp) {syllables += esylp.length;} //E clustered positive
            const esylm = word.match(/every|some([^aeiouyr]|$)|[^trb]ere(?!d|$|o|r|t|a[^v]|n|s|x)|[^g]eous|niet/gmi);
            if (esylm) {syllables -= esylm.length;} //E clustered negative
            const isylp = word.match(/rie[^sndfvtl]|(?<=^|[^tcs]|st)ia|siai|[^ct]ious|quie|[lk]ier|settli|[^cn]ien[^d]|[aeio]ing$|dei[tf]|isms?$/gmi);
            if (isylp) {syllables += isylp.length;} //I clustered positive
            const osylp = word.match(/nyo|osm(s$|$)|oinc|ored(?!$)|(^|[^ts])io|oale|[aeiou]yoe|^m[ia]cro([aiouy]|e)|roe(v|$)|ouel|^proa|oolog/gmi);
            if (osylp) {syllables += osylp.length;} //O clustered positive
            const osylm = word.match(/[^f]ore(?!$|[vcaot]|d$|tte)|fore|llio/gmi);
            if (osylm) {syllables -= osylm.length;} //O clustered negative
            const asylp = word.match(/asm(s$|$)|ausea|oa$|anti[aeiou]|raor|intra[ou]|iae|ahe$|dais|(?<!p)ea(l(?!m)|$)|(?<!j)ean|(?<!il)eage/gmi);
            if (asylp) {syllables += asylp.length;} //A clustered positive
            const asylm = word.match(/aste(?!$|ful|s$|r)|[^r]ared$/gmi);
            if (asylm) {syllables -= asylm.length;} //A clustered negative
            const usylp = word.match(/uo[^y]|[^gq]ua(?!r)|uen|[^g]iu|uis(?![aeiou]|se)|ou(et|ille)|eu(ing|er)|uye[dh]|nuine|ucle[aeiuy]/gmi);
            if (usylp) {syllables += usylp.length;} //U clustered positive
            const usylm = word.match(/geous|busi|logu(?!e|i)/gmi);
            if (usylm) {syllables -= usylm.length;} //U clustered negative
            const ysylp = word.match(/[ibcmrluhp]ya|nyac|[^e]yo|[aiou]y[aiou]|[aoruhm]ye(tt|l|n|v|z)|dy[ae]|oye[exu]|lye[nlrs]|(ol|i|p)ye|aye(k|r|$|u[xr]|da)|saye\w|wy[ae]|[^aiou]ying/gmi);
            if (ysylp) {syllables += ysylp.length;} //Y clustered positive
            const ysylm = word.match(/arley|key|ney$/gmi);
            if (ysylm) {syllables -= ysylm.length;}
            const essuffix = word.match(/((?<!c[hrl]|sh|[iszxgej]|[niauery]c|do)es$)/gmi);
            if (essuffix) {syllables--;}//es suffix
            const edsuffix = word.match(/([aeiouy][^aeiouyrdt]|[^aeiouy][^laeiouyrdtbm]|ll|bb|ield|[ou]rb)ed$|[^cbda]red$/gmi);
            if (edsuffix) {syllables--}
            const csylp = word.match(/chn[^eai]|mc|thm/gmi);
            if (csylp) {syllables += csylp.length;} //Consonant clustered negative
            const eVowels = word.match(/[aiouy](?![aeiouy])|ee|e(?!$|-|[iua])/gmi);
            if (eVowels) {syllables += eVowels.length;} //Applicable vowel count (all but e at end of word)
            if (syllables <= 0) {syllables = 1;} //catch-all
            if (word.match(/[^aeiou]n['’]t$/i)) {syllables ++;} //ending in n't, but not en't
            if (word.match(/en['’]t$/i)) {syllables --;} //ending in en't
            if (syllables >= 3) {polysTotal++;}
            syllablesTotal += syllables;
        });
        return [syllablesTotal, polysTotal];
    };

    const start = new Date().getTime();
    const chapterText = getChapter();
    const wordList = chapterText.split(/[^\wÀ-ÿ&][s]?[^\wÀ-ÿ&_]*[^\wÀ-ÿ&]|[^\wÀ-ÿ'&.(’-]/g).filter(x => x);
    const wordCount = wordList.length;
    const wordCountArray = countWords(wordList);
    const charCount = chapterText.match(/[\wÀ-ÿ]/g).length;
    const sentenceCount = chapterText.match(/[.!?—-][”"'’)]?[ \n]*[“"'‘(]?[A-ZÀ-Þ]|[^\s]$/gm).length;
    const paragraphCount = chapterText.match(/\n/g).length;
    let [syllableCount, polysCount] = countSyllablesAndPolys(wordList);
    const functionWords = ["a","about","above","across","after","afterwards","again","against","all","almost","alone","along","already","also","although","always","am","among",
                         "amongst","amoungst","an","and","another","any","anyhow","anyone","anything","anyway","anywhere","are","around","as","at","be","became","because","been",
                         "before","beforehand","behind","being","below","beside","besides","between","beyond","both","but","by","can","cannot","could","dare","despite","did","do",
                         "does","done","down","during","each","eg","either","else","elsewhere","enough","etc","even","ever","every","everyone","everything","everywhere","except","few",
                         "first","for","former","formerly","from","further","furthermore","had","has","have","he","hence","her","here","hereabouts","hereafter","hereby","herein",
                         "hereinafter","heretofore","hereunder","hereupon","herewith","hers","herself","him","himself","his","how","however","i","ie","if","in","indeed","inside",
                         "instead","into","is","it","its","itself","last","latter","latterly","least","less","lot","lots","many","may","me","meanwhile","might","mine","more",
                         "moreover","most","mostly","much","must","my","myself","namely","near","need","neither","never","nevertheless","next","no","nobody","none","noone","nor","not",
                         "nothing","now","nowhere","of","off","often","oftentimes","on","once","one","only","onto","or","other","others","otherwise","ought","our","ours","ourselves","out",
                         "outside","over","per","perhaps","rather","re","same","second","several","shall","she","should","since","so", "some","somehow","someone","something","sometime",
                         "sometimes","somewhat","somewhere","still","such","than","that","the","their","theirs","them","themselves","then","thence","there","thereabouts","thereafter",
                         "thereby","therefore","therein","thereof","thereon","thereupon","these","they","third","this","those","though","through","throughout","thru","thus","to","together","too",
                         "top","toward","towards","under","until","up","upon","us","used","very","via","was","we","well","were","what","whatever","when","whence","whenever","where","whereafter",
                         "whereas","whereby","wherein","whereupon","wherever","whether","which","while","whither","who","whoever","whole","whom","whose","why","whyever","will","with",
                         "within","without","would","yes","yet","you","your","yours","yourself","yourselves","said"];
    let topUncommon = [];
    for (let i = 0;topUncommon.length < 10 && i < wordCountArray.length;i++) {
        if (!functionWords.includes(wordCountArray[i][0])) {topUncommon.push(wordCountArray[i]);}
    }
    const ARI = (4.71*(charCount/wordCount)+.5*(wordCount/sentenceCount)-21.43);
    const FRE = 206.835-1.015*(wordCount/sentenceCount)-84.6*(syllableCount/wordCount);
    const FKGL = .39*(wordCount/sentenceCount)+11.8*(syllableCount/wordCount)-15.59;
    const SMOG = 1.0430*Math.sqrt(polysCount*(30/sentenceCount))+3.1291;
    let HTMLString = `
                    <label>
                        <p><b><u>Statistics</u></b></p>
                        <p>Words: <b>${wordList.length}</b></p>
                        <p>Paragraphs: <b>${paragraphCount}</b></p>
                        <p>Sentences: <b>${sentenceCount}</b></p>
                    </label>
                    <label>
                        <p><b><u>Readability Metrics</b></u></p>
                        <p>ARI: <b>${ARI.toFixed(1)}</b> (Ages ${ARI>=15?"18-22":(Math.round(ARI)+4) + "-" + (Math.round(ARI)+5)})</p>
                        <p>Flesch Ease: <b>${FRE.toFixed(1)}</b> (${fRResult(FRE)})</p>
                        <p>Flesch–Kincaid: <b>${FKGL.toFixed(1)}</b> (Grade ${FKGL>=12?"12+":Math.round(FKGL)})</p>
                        <p>SMOG: <b>${sentenceCount >= 30 ?SMOG.toFixed(1)+"</b> (Grade "+(SMOG>=12?"12+":Math.round(SMOG))+")":"Too Short!</b>"}</p>
                    </label>
                    <label>
                        ${generateWcTable("Top Uncommon",topUncommon)}
                    </label>
                    `;
    const chapterInfo = popUp("<i class='fa fa-info'></i> Chapter Data",250,0,"CI")
    chapterInfo.content.insertAdjacentHTML('beforeend',"<div class='std'>" + HTMLString + "</div>");
    const uWcList = eleBuilder("LABEL",{HTML:"<a>Show All Words<i class='fa fa-angle-down'></i></a>"})
    uWcList.addEventListener("click",function(){this.innerHTML=`<div style='height:13.2rem;overflow-y:scroll;'>${generateWcTable("All Words",wordCountArray)}</div>`;});
    chapterInfo.content.firstChild.appendChild(uWcList);
    chapterInfo.SetFooter("<i>Generated in " + (((new Date()).getTime() - start)/1000) + " seconds</i>");
    chapterInfo.Show();
}

function addAnalyzer () {
    document.querySelector("a[data-click='toggleFormatPopup']").innerHTML = "<i class='fa fa-font'></i>";
    document.getElementsByClassName("chapter_download_links")[0].appendChild(eleBuilder("LI",{HTML:"<a><i class='fa fa-info'></i></a>",event:["click",chapterAnalyze]}));
}

//Settings Manager
function setUpManager() {
    function row(label, setting) {
        const ele = document.createElement("TR");
        ele.style.gridTemplateColumns = "35% 65%";
        const lab = eleBuilder("TD", {class:"label",text:label + " "});
        const infoLink = eleBuilder("A", {HTML:"<i class='fa fa-question-circle'></i>"});
        infoLink.href = "https://github.com/ReluctusB/DataFiction.net/blob/Dev-compiled/features.md#"+label.toLowerCase().replace(/\//g,"").replace(/ /g,"-");
        infoLink.target="_blank";
        lab.appendChild(infoLink);
        ele.appendChild(lab);
        const opt = document.createElement("TD");
        opt.appendChild(toggleIn(setting));
        ele.appendChild(opt);
        return ele;
    }

    function toggleIn(localVar) {
        const ele = eleBuilder("LABEL",{class:"toggleable-switch"});
        const optBox = eleBuilder("INPUT",{id:localVar, type:"checkbox",event:["change",() => toggleSetting(localVar)]});
        ele.appendChild(optBox);
        ele.appendChild(document.createElement("A"));
        return ele;
    }

    function textIn(localVar, defaultVar) {
        const ele = eleBuilder("INPUT",{type:"text",event:["change",function(){
            datafic_settings[localVar]=verify(this.value,this);
            localStorage["datafic-settings"]=JSON.stringify(datafic_settings);
        }]});
        ele.value = datafic_settings[localVar]?datafic_settings[localVar]:defaultVar;
        return ele;
    }

    function label(description, br=0) {
        return eleBuilder("SPAN",{HTML:(br?"<br>":"")+description});
    }

    function settingDisplay() {
        setList.forEach(set=>{document.getElementById(set).checked=datafic_settings[set]===1?true:false;});
    }

    function toggleSetting(setting) {
        datafic_settings[setting] = datafic_settings[setting] === 1?0:1;
        localStorage["datafic-settings"] = JSON.stringify(datafic_settings);
    }

    function verify(inVal, ele) {
        ele.style.color = "black";
        inVal = parseInt(inVal);
        return (isNaN(inVal)?(ele.style.backgroundColor = "#b97e6e",null):(ele.style.backgroundColor = "#86b75c",inVal));
    }

    const fragment = document.createDocumentFragment();
    const dataSettingsRowHeader = eleBuilder("TR", {class:"section_header", HTML:"<td colspan='2'><b>DataFiction.net Settings</b></td>"});
    fragment.appendChild(dataSettingsRowHeader);
    const dataSettingsVV = row("Votes/Views Percentage", "datafic-VV");
    dataSettingsVV.lastChild.appendChild(label("Highlight percentages above: (make blank to disable)",1));
    dataSettingsVV.lastChild.appendChild(textIn("datafic-VVT", 10));
    fragment.appendChild(dataSettingsVV);
    fragment.appendChild(row("Followers/Fic Ratio","datafic-FF"));
    const dataSettingsRT = row("Personalized Reading Times","datafic-RT");
    dataSettingsRT.lastChild.appendChild(label("Your reading speed, in words per minute:",1));
    dataSettingsRT.lastChild.appendChild(textIn("datafic-WPM", 250));
    fragment.appendChild(dataSettingsRT);
    const dataSettingsAP = row("Average Post Schedule","datafic-AP");
    dataSettingsAP.lastChild.appendChild(document.createElement("BR"));
    dataSettingsAP.lastChild.appendChild(toggleIn("datafic-APD"));
    dataSettingsAP.lastChild.appendChild(label("Display regardless of completion"));
    fragment.appendChild(dataSettingsAP);
    fragment.appendChild(row("Avg. Chapter Length", "datafic-CL"));
    fragment.appendChild(row("Chapter Analysis", "datafic-CA"));
    document.querySelector("table.properties > tbody").appendChild(fragment);
    settingDisplay();
}

function settingSetup() {
    let settings = {};
    if (localStorage["datafic-settings"]) {
        settings = JSON.parse(localStorage["datafic-settings"]);
        setList.forEach(set => {if (settings[set]===undefined) {settings[set] = 1;}});
    } else {
        settings = {"datafic-VV":1,"datafic-FF":1,"datafic-RT":0,"datafic-AP":1,"datafic-CL":1,"datafic-CA":1};
    }
    localStorage["datafic-settings"] = JSON.stringify(settings);
}

//Main
const start = new Date().getTime();
const win = this.unsafeWindow || window.unsafeWindow || window;
const version = GM_info.script.version;
const setList = ["datafic-VV","datafic-FF","datafic-RT","datafic-AP","datafic-APD","datafic-CL","datafic-CA"];

if (localStorage.getItem("datafic-version") !== version || !localStorage["datafic-settings"]) {
    settingSetup();
    localStorage.setItem("datafic-version", version);
}

var datafic_settings = JSON.parse(localStorage["datafic-settings"]);

if (datafic_settings["datafic-VV"] === 1) {voteViews();}
if (datafic_settings["datafic-FF"] === 1 && !window.location.href.includes("manage")) {ficFollow();}
if (datafic_settings["datafic-RT"] === 1) {readingTime();}
if (datafic_settings["datafic-AP"] === 1) {averagePost();}
if (datafic_settings["datafic-CL"] === 1) {averageChapterLength();}
if (datafic_settings["datafic-CA"] === 1 && document.getElementById("chapter_toolbar_container")) {addAnalyzer();}
if (window.location.href.includes("manage/local-settings")) {setUpManager();}

document.getElementsByClassName("block")[0].insertAdjacentHTML("beforeend",`<br>DataFiction.net applied in <a>${((new Date()).getTime() - start)/1000} seconds</a>`);
