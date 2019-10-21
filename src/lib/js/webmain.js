var source, viewport;
var dctx;

source = document.getElementById("source");
viewport = document.getElementById("viewport");
viewport.width = document.body.clientWidth;
viewport.height = document.body.clientHeight;
dctx = viewport.getContext("2d");

function
processframe()
{
	const depth = 4;
	var frame;
	var npixel;
	var i;

	dctx.drawImage(source, 0, 0, viewport.width, viewport.height);
	frame = dctx.getImageData(0, 0, viewport.width, viewport.height);
	npixel = frame.data.length / depth;
	for(i = 0; i < npixel; i++){
		frame.data[i*depth + 0] *= 0.5;
		frame.data[i*depth + 1] *= 0.5;
		frame.data[i*depth + 2] *= 0.5;
	}
	dctx.putImageData(frame, 0, 0);
}

function
play()
{
	if(source.paused || source.ended)
		return;
	processframe();
	setTimeout(play, 0);
}

source.addEventListener("play", play, false);

ipcRenderer.on("new-config", (e, data) => {
	console.log("new config: ", data);
});
