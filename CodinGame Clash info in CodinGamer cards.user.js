// ==UserScript==
// @name         CodinGame Clash info in CodinGamer cards
// @namespace    https://lopidav.com/
// @version      0.1
// @description  Adds Clash of Code rank, games count, and skill thiccness to user info card.
// @author       Allis, lopidav, and TheCrucial
// @match        https://www.codingame.com/*
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

(function(XHR) {
    var myCache = new Map();
    var requestsMap = new WeakMap();
    const {open, send} = XHR;
    XHR.send = function(body) {
        const url = requestsMap.get(this);
        if(url) {
            if (url.includes('findCodingamerFollowCard')) {
                const [userId] = JSON.parse(body);
                if(!myCache.has(userId)) {
                    const query = fetch('services/Leaderboards/getCodinGamerClashRanking', {method: 'POST', body: `[${userId},"global",null]`})
                        .then(r => r.json());
                    myCache.set(userId, query);
                }
            }
        }
        send.apply(this, arguments);
    }
    XHR.open = function(method, url) {
        requestsMap.set(this, url); // no good way to get url in send.
        this.addEventListener('readystatechange', () => {
            if(this.readyState == 4 && this.responseURL.includes('findCodingamerFollowCard')) {
                let data = JSON.parse(this.response);
                myCache.get(data.userId).then(resp => {
                    let cocCard = $('.codingamer-card-coc');
                    if (!cocCard.length) {
                        let card = $('#codingamer-card').append(`<div class="codingamer-card-coc" style="font-size: 14px;margin-left:12px;margin-right:12px;height:15px;width:auto;font-weight:600;"></div>`);
                        card.css('height', 297)
                        cocCard = $('.codingamer-card-coc');
                    }
                    if (resp !== null) {
                        cocCard.html(`<span style="display: inline-block;font-size: 18px;">⚔</span><span class="clash-rank" style="margin-left:4px"> ${resp.rank}</span>${resp.inProgress?`<span class="clash-status" style="margin-left:10px">be clashin'</span>`:''}<span class="clash-count" style="margin-left:30px"> num'o'gams: ${resp.clashesCount}</span><span class="clash-score" style="margin-left:10px"> Score: ${resp.score.toFixed(2)}</span>`);
                        cocCard.css('color', resp.rank>2000?resp.rank>7000?resp.rank>15000?'#7cc576':'#b6a28b':'#849aa4':resp.rank>200?'#f4ae3d':resp.rank>20?'#f96249':'#55B0FF')
                    } else {
                        cocCard.html(`<span style="display: inline-block;font-size: 18px;">⚔</span><span class="clash-rank" margin-left:4px"> Not played </span>`)
                        cocCard.css('color', '#000');
                    }

                });
            }
        });
        open.apply(this, arguments);
    }
})(XMLHttpRequest.prototype);