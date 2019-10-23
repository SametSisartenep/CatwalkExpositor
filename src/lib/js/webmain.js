const DEG = 0.0174532925199;

var source, viewport;
var dctx;
var expoconfig;

source = document.getElementById("source");
viewport = document.getElementById("viewport");
viewport.width = document.body.clientWidth;
viewport.height = document.body.clientHeight;
dctx = viewport.getContext("2d");

function
Dx(rect)
{
	return rect.maxx-rect.minx;
}

function
Dy(rect)
{
	return rect.maxy-rect.miny;
}

function
processframe()
{
	const depth = 4;
	var frame;
	var npixel;
	var i;

	dctx.drawImage(source, expoconfig.clipr.minx, expoconfig.clipr.miny, Dx(expoconfig.clipr), Dy(expoconfig.clipr), 0, 0, viewport.width, viewport.height);
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
	if(source.paused || source.ended || !expoconfig)
		return;
	processframe();
	setTimeout(play, 0);
}

source.addEventListener("play", play, false);

ipcRenderer.on("new-config", (e, data) => {
	expoconfig = data;
	source.src = data.video;
	if(expoconfig.rotation !== 0){
		dctx.resetTransform();
		dctx.translate(viewport.width/2, viewport.height/2);
		dctx.rotate(expoconfig.rotation*DEG);
		dctx.translate(-viewport.width/2, -viewport.height/2);
	}
});
