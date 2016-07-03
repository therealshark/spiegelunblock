// ==UserScript==
// @name         Unlock spiegel.de articles
// @namespace    theshark
// @version      0.1
// @description  Unblocks articles on spiegel.de
// @author       theshark
// @match        http://www.spiegel.de/*
// @grant        none
// @updateURL    https://github.com/therealshark/spiegelunblock/raw/master/spiegel-unblock.user.js
// @downloadURL  https://github.com/therealshark/spiegelunblock/raw/master/spiegel-unblock.user.js
// ==/UserScript==

(function() {
    'use strict';

    function isTextNode(node){
        return node.nodeType == node.TEXT_NODE;
    }

    // "Decodes" the Text. Caesarchiffre with an offset of one?, cooooome oooon
    function decode(text){
        return text.split(' ').map(word => {
            return word.split('').map(char => {
                return String.fromCharCode(char.charCodeAt(0) - 1);
            }).join('');
        }).join(' ');
    }

    // Walkes through nodes and decodes the text
    function nodeWalker(nodes){
        nodes.forEach(node => {
            if(isTextNode(node)){
                node.data = decode(node.data);
            }else if(node.nodeName !== 'A'){ // <- links aren't encoded, so no need to decode them
                nodeWalker(node.childNodes);
            }
        });
    }

    function start(){
        // Find the div
        var blurDiv = document.querySelector('.lp_mwi_svg-filter-blur');

        // remove the crap overlays
        while(blurDiv.nextSibling !== null){
            blurDiv.nextSibling.remove();
        }
        while(blurDiv.previousSibling !== null){
            blurDiv.previousSibling.remove();
        }

        // remove the blurring
        for(var x = 0; x<2; x++){
            blurDiv.classList.forEach(cssclass => {
                blurDiv.classList.remove(cssclass);
            });
        }

        // decode the text
        nodeWalker(document.querySelectorAll('.obfuscated-content .obfuscated'));
    }

    // wait for everythign to be initialized
    function waitForStart(){
        if(document.querySelector('.lp_mwi_svg-filter-blur')){
            start();
        }else{
            setTimeout(waitForStart, 250);
        }
    }

    // Is it a paid article?
    if(document.querySelector('h2.article-title a.laterpay-icon')){
        waitForStart();
    }
})();
