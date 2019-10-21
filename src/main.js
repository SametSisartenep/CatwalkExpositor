const path = require("path");
const fs = require("fs");
const net = require("net");
const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");

let mainwindow;
let cmdpipe;

function
createwindow()
{
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
	mainwindow.once("ready-to-show", () => {
		mainwindow.show();
	});
	mainwindow.loadURL(`file://${__dirname}/index.html`);
}

app.on("ready", createwindow);

app.on("window-all-closed", () => {
	if(process.platform !== "darwin"){
		if(cmdpipe)
			cmdpipe.close();
		app.quit();
	}
});

app.on("activate", () => {
	if(mainwindow === null)
		createwindow();
});

cmdpipe = net.createServer((stream) => {
	stream.on("data", (data) => {
		var newcfg;

		try{
			newcfg = JSON.parse(data.toString());
		}catch(e){
			return;
		}
		mainwindow.webContents.send("new-config", newcfg);
	});
});
cmdpipe.listen("/tmp/catwalk.pipe");
