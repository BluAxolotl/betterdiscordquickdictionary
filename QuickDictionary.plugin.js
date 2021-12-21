/**
 * @name QuickDictionary
 * @author BluAxolotl
 * @description Quick definitions for when talking to people who use big words.
 * @version 0.0.1
 * @authorLink https://twitter.com/BluAxolotl
 */

var Sock = new WebSocket("ws://localhost:8080/")
var printing_queue = []

const print = function (variant) {
	console.log(variant)	
	// if (Sock != 1) {
	// 	printing_queue.push(variant)
	// } else {
	// 	Sock.send(variant)
	// }
}

Sock.onopen = function (e) {

	BdApi.showToast("Socket connected!", {type: "success"})
	printing_queue.forEach( variant => {
		Sock.send(variant)
	})
}

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

Sock.onmessage = function (e) {
	console.log(getSelectionText())
}

function layer_update(changes) {
	if (changes[0].addedNodes.length > 0) { // There was a popup added.... right!?
		if (changes[0].addedNodes[0].classList.contains("layer-v9HyYc") && getSelectionText() != "") {
			var first = changes[0].addedNodes[0].firstChild
			if (first.ariaLabel == "Message Actions") {
				var separators = document.getElementsByClassName('separator-2I32lJ')
				var appending_elemHTML = `<div class="item-1tOPte labelContainer-1BLJti colorDefault-2K3EoJ" role="menuitem" id="message-devmode-copy-id" tabindex="-1" data-menu-item="true"><div class="label-22pbtT">Define</div></div>`
				var appending_elem = document.createElement('div')
				appending_elem.innerHTML = appending_elemHTML
				var separator = separators[0].cloneNode(true)
				var options = first.firstChild
				var last_elem = options[options.length-1]

				appending_elem.onclick = function (e) {
					console.log(getSelectionText())
				}

				options.insertBefore(separator, last_elem)
				options.insertBefore(appending_elem, last_elem)
			}
		}
	}
}

module.exports = class QuickDictionary {
	getName() {return "QuickDictionary";}
	getDescription() {return "Quick definitions for when talking to people who use big words.";}
	getVersion() {return "0.0.1";}
	getAuthor() {return "BluAxolotl";}

    load() {}

    start() {
        if (!global.ZeresPluginLibrary) return window.BdApi.alert("Library Missing",`The library plugin needed for ${this.getName()} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
        ZLibrary.PluginUpdater.checkForUpdate(this.getName(), this.getVersion(), "LINK_TO_RAW_CODE");

        var layer_containers = document.getElementsByClassName('layerContainer-yqaFcK')
        console.log(layer_containers)
        const layer_observer = new MutationObserver(layer_update)
        layer_observer.observe(layer_containers[1], {childList: true})
    }
    stop() {}

    observer(changes) {}
}
