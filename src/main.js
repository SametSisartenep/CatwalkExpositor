const path = require("path");
const fs = require("fs");
const net = require("net");
const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");

const DBPATH = path.join(__dirname, "db/");
const CFGFILE = path.join(DBPATH, "config.json");

let mainwindow;
let cmdsock;

function
isemptyjson(json)
{
	return Object.getOwnPropertyNames(json).length <= 0;
}

function
createwindow()
{
	var cfg0;

	mainwindow = new BrowserWindow({
		autoHideMenuBar: true,
		show: false,
		kiosk: true,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		}
	});
	mainwindow.on("closed", () => {
		mainwindow = null;
	});
	mainwindow.on("show", () => {
		fs.readFile(CFGFILE, (err, data) => {
			if(err == null){
				try{
					cfg0 = JSON.parse(data.toString());
				}catch(err){
					return;
				}
				mainwindow.webContents.send("new-config", cfg0);
			}
		});
	});
	mainwindow.once("ready-to-show", () => {
		mainwindow.show();
	});
	mainwindow.loadURL(`file://${__dirname}/index.html`);
}

app.on("ready", createwindow);

app.on("window-all-closed", () => {
	if(process.platform !== "darwin"){
		if(cmdsock)
			cmdsock.close();
		app.quit();
	}
});

app.on("activate", () => {
	if(mainwindow === null)
		createwindow();
});

cmdsock = net.createServer((stream) => {
	stream.on("data", (data) => {
		var newcfg;

		try{
			newcfg = JSON.parse(data.toString());
		}catch(err){
			return;	/* not a JSON */
		}
		fs.writeFileSync(CFGFILE, JSON.stringify(newcfg, null, "	"));
		mainwindow.webContents.send("new-config", newcfg);
	});
});
cmdsock.listen("/tmp/catwalk.sock");
