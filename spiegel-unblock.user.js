// ==UserScript==
// @name         Unlock spiegel.de articles
// @namespace    theshark
// @version      0.3
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
        var blurDiv = document.querySelector('.lp_mwi_svg-filter-blur');

        // remove the crap overlays
        while(blurDiv.nextSibling !== null){
            blurDiv.nextSibling.remove();
        }
        while(blurDiv.previousSibling !== null){
            blurDiv.previousSibling.remove();
        }

        // remove the blurring
        blurDiv.className = '';

        // decode the text
        nodeWalker(document.querySelectorAll('.obfuscated-content .obfuscated'));
    }

    // lets wait for everything to be initialized
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
