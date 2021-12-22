/**
 * @name QuickDictionary
 * @authorLink https://twitter.com/BluAxolotl
 * @source https://github.com/BluAxolotl/betterdiscordquickdictionary/
 * 
 */

function getSelectionText() {
    var text = "";
    if (window.getSelection) {
        text = window.getSelection().toString();
    } else if (document.selection && document.selection.type != "Control") {
        text = document.selection.createRange().text;
    }
    return text;
}

function main_func(main_query) {
	fetch(`https://www.dictionaryapi.com/api/v3/references/collegiate/json/${main_query}?key=da581a63-3029-4d35-8502-497335c8b143`)
	 .then(response => {
	 	response.json().then(json => {
	 		console.log(json)
	 		if (json[0].meta != null) {
		 		var defs = json.map(i => {
		 			let hw = i.hwi.hw.replaceAll("*", "")
		 			let fl = (i.fl ? i.fl.replaceAll("*", "\\*") : `${i.cxs[0].cxl} ${i.cxs[0].cxtis[0].cxt}`)
		 			let shortdefs = i.shortdef.join("; ").replaceAll("*", "\\*")
		 			return `**${hw}:** *(${fl})* ${shortdefs}`
		 		})
		 		BdApi.alert("Definitions", defs)
	 		} else {
	 			var alts = ["# Similar words..."]
		 		json.forEach(i => {
		 			alts.push(BdApi.React.createElement("p", {style: {color: "#b9bbbe", textDecorationLine: 'underline'}, onClick: () => { main_func(i) }}, i))
		 			alts.push("\n")
		 		})
		 		BdApi.alert(`No definition for word "${main_query}"`, alts)
	 		}
	 	})
	 })
}

module.exports = (_ => {
	const config = {
		"info": {
			"name": "Quick Dictionary",
			"author": "BluAxolotl",
			"version": "0.1.0",
			"description": "Quick definitions for when talking to people who use big words."
		}
	};

	return !window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started) ? class {
		getName () {return config.info.name;}
		getAuthor () {return config.info.author;}
		getVersion () {return config.info.version;}
		getDescription () {return `The Library Plugin needed for ${config.info.name} is missing. Open the Plugin Settings to download it.\n\n${config.info.description}`;}
		
		load () {
			if (!window.BDFDB_Global || !Array.isArray(window.BDFDB_Global.pluginQueue)) window.BDFDB_Global = Object.assign({}, window.BDFDB_Global, {pluginQueue: []});
			if (!window.BDFDB_Global.downloadModal) {
				window.BDFDB_Global.downloadModal = true;
				BdApi.showConfirmationModal("Library Missing", `The Library Plugin needed for ${config.info.name} is missing. Please click "Download Now" to install it.`, {
					confirmText: "Download Now",
					cancelText: "Cancel",
					onCancel: _ => {delete window.BDFDB_Global.downloadModal;},
					onConfirm: _ => {
						delete window.BDFDB_Global.downloadModal;
						require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
							if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
							else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
						});
					}
				});
			}
			if (!window.BDFDB_Global.pluginQueue.includes(config.info.name)) window.BDFDB_Global.pluginQueue.push(config.info.name);
		}
		start () {this.load();}
		stop () {}
		getSettingsPanel () {
			let template = document.createElement("template");
			template.innerHTML = `<div style="color: var(--header-primary); font-size: 16px; font-weight: 300; white-space: pre; line-height: 22px;">The Library Plugin needed for ${config.info.name} is missing.\nPlease click <a style="font-weight: 500;">Download Now</a> to install it.</div>`;
			template.content.firstElementChild.querySelector("a").addEventListener("click", _ => {
				require("request").get("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js", (e, r, b) => {
					if (!e && b && b.indexOf(`* @name BDFDB`) > -1) require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"), b, _ => {});
					else BdApi.alert("Error", "Could not download BDFDB Library Plugin, try again later or download it manually from GitHub: https://github.com/mwittrien/BetterDiscordAddons/tree/master/Library/");
				});
			});
			return template.content.firstElementChild;
		}
	} : (([Plugin, BDFDB]) => {
		var settings = {};
	
		return class QuickDictionary extends Plugin {
			onLoad () {
				this.defaults = {
					settings: {
						copyOnlySelected: {
							value: true,
							description: "Only copy selected text of a message"
						},
						suckMyNuts: {
							value: true,
							description: "Sucks my nuts (PLEASE ENABLE)"
						}
					}
				};
			}
			
			onStart () {
				this.forceUpdateAll();
			}
			
			onStop () {
				this.forceUpdateAll();
			}

			getSettingsPanel (collapseStates = {}) {
				let settingsPanel, settingsItems = [];
				
				for (let key in settings) settingsItems.push(BDFDB.ReactUtils.createElement(BDFDB.LibraryComponents.SettingsSaveItem, {
					type: "Switch",
					plugin: this,
					keys: ["settings", key],
					label: this.defaults.settings[key].description,
					value: settings[key]
				}));
				
				return settingsPanel = BDFDB.PluginUtils.createSettingsPanel(this, settingsItems);
			}

			onSettingsClosed () {
				if (this.SettingsUpdated) {
					delete this.SettingsUpdated;
					this.forceUpdateAll();
				}
			}
		
			forceUpdateAll () {
				settings = BDFDB.DataUtils.get(this, "settings");
			}

			onMessageContextMenu (e) {
				if (e.instance.props.message && getSelectionText().trim() != "") {
					var main_query = getSelectionText().trim().split(" ")[0].toLowerCase()
					let content = e.instance.props.message.content;
					let messageString = [e.instance.props.message.content, BDFDB.ArrayUtils.is(e.instance.props.message.attachments) && e.instance.props.message.attachments.map(n => n.url)].flat(10).filter(n => n).join("\n");
					let selectedText = settings.copyOnlySelected && document.getSelection().toString().trim();
					if (selectedText) messageString = BDFDB.StringUtils.extractSelection(messageString, selectedText);
					let embed = BDFDB.DOMUtils.getParent(BDFDB.dotCN.embedwrapper, e.instance.props.target);
					let embedData = e.instance.props.message.embeds[embed ? Array.from(embed.parentElement.querySelectorAll(BDFDB.dotCN.embedwrapper)).indexOf(embed) : -1];
					let embedString = embedData && [embedData.rawTitle, embedData.rawDescription, BDFDB.ArrayUtils.is(embedData.fields) && embedData.fields.map(n => [n.rawName, n.rawValue]), BDFDB.ObjectUtils.is(embedData.image) && embedData.image.url, BDFDB.ObjectUtils.is(embedData.footer) && embedData.footer.text].flat(10).filter(n => n).join("\n");
					if (selectedText) embedString = BDFDB.StringUtils.extractSelection(embedString, selectedText);
					let entries = [
						messageString && BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuItem, {
							label: `Define "${main_query}"`,
							id: BDFDB.ContextMenuUtils.createItemId(this.name, "test"),
							action: () => {main_func(main_query)}
						})
					]
					if (entries.length) {
						let [children, index] = BDFDB.ContextMenuUtils.findItem(e.returnvalue, {id: "devmode-copy-id", group: true});
						children.splice(0, 0, BDFDB.ContextMenuUtils.createItem(BDFDB.LibraryComponents.MenuItems.MenuGroup, {
							children: entries
						}));
					}
				}
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin(config));
})();
