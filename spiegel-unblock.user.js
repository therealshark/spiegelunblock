// ==UserScript==
// @name         Unlock spiegel.de articles
// @namespace    theshark
// @version      0.7
// @description  Unblocks articles on spiegel.de
// @author       theshark
// @match        http://www.spiegel.de/*
// @grant        none
// @updateURL    https://github.com/therealshark/spiegelunblock/raw/master/spiegel-unblock.user.js
// @downloadURL  https://github.com/therealshark/spiegelunblock/raw/master/spiegel-unblock.user.js
// ==/UserScript==

(function() {
    'use strict';

    function log(txt){
        console.log('[SPIEGEL-Unblock]: ' + txt);
    }

    function isTextNode(node){
        return node.nodeType == node.TEXT_NODE;
    }

    var decodableClasses = ['text-link-int', 'text-link-ext', 'lp-text-link-int', 'lp-text-link-ext', 'spCelink'];
    function isDecodableNode(node){
        return node.nodeType == node.ELEMENT_NODE && decodableClasses.every(function(cssclass){
            return node.className.indexOf(cssclass) == -1;
        });
    }

    // "Decodes" the Text. Caesarchiffre with an offset of one?, cooooome oooon
    var decodeTable = {
        177: '&',
        178: '!',
        180: ';',
        181: '=',
        32: ' '
    };
    function decode(text){
        return text.split('').map(function(char){
            var charCode = char.charCodeAt(0);
            return decodeTable[charCode] || String.fromCharCode(charCode - 1);
        }).join('');
    }

    // Walks through nodes and decodes the text
    function nodeWalker(nodes){
        for(var i = 0; i < nodes.length; i++){
            var node = nodes[i];
            if(isTextNode(node)){
                node.data = decode(node.data);
            }else if(isDecodableNode(node)){ // <- links aren't encoded, so no need to decode them
                nodeWalker(node.childNodes);
            }
        }
    }

    function start(){
        // Find the div
        var blurDiv = document.querySelector('.obfuscated-content').parentElement;
        log('found blur div');
        // remove the crap overlays
        while(blurDiv.nextSibling !== null){
            blurDiv.nextSibling.remove();
        }
        while(blurDiv.previousSibling !== null){
            blurDiv.previousSibling.remove();
        }
        log('removed overlays');
        // remove the blurring
        blurDiv.className = '';
        log('removed blurring');
        log('starting to "decode" text');
        // decode the text
        nodeWalker(document.querySelectorAll('.obfuscated-content .obfuscated'));
        log('decoded the text');
        document.querySelector('p.js-spiegelplus-obfuscated-intro').remove();
        log('removed buy-text');
        log('done');
    }

    // lets wait for everything to be initialized
    function waitForStart(){
        if(document.querySelector('[data-lp="mwi-purchase-form"]')){
            log("Initialized");
            start();
        }else{
            setTimeout(waitForStart, 250);
            log("waiting for initialization");
        }
    }

    // Is it a paid article?
    if(document.querySelector('h2.article-title .spiegelplus')){
        log("paid article");
        waitForStart();
    }

    // remove adblock blocker
    const style = document.createElement("style");
    style.innerHTML = `
        #wrapper-content {
            opacity: 1 !important;
            filter: unset !important;
            pointer-events: all !important;
        }

        .ua-detected {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

})();
