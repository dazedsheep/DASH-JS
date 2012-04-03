var dashInstance;

function DASH_MPD_loaded()
{
	myBandwidth = new bandwidth(bps, 1.1, 0.9);
	adaptation = init_rateBasedAdaptation(dashInstance.mpdLoader.mpdparser.pmpd, dashInstance.videoTag, myBandwidth);
	myFplot = new fPlot(document.getElementById("graph").getContext("2d"),parsePT(dashInstance.mpdLoader.mpdparser.pmpd.mediaPresentationDuration),document.getElementById("graph").width,document.getElementById("graph").height);
	myBandwidth.addObserver(myFplot);
	myFplot.initNewFunction(0);
	myFplot.initNewFunction(1);
	adaptation.addObserver(myFplot);
	adaptation.switchRepresentation(); // try to get a better representation at the beginning
				
	dashInstance.videoTag.src = dashInstance.videoTag.webkitMediaSourceURL;
	//dashInstance.videoTag.addEventListener('progress', onProgress, false); - not needed anymore, due to the changes to the Media Source API
	dashInstance.videoTag.addEventListener('webkitsourceopen', onOpenSource, false);
	dashInstance.videoTag.addEventListener('webkitsourceended', onSourceEnded);
	overlayBuffer = init_mediaSourceBuffer(20,30,0,dashInstance.videoTag);
	overlayBuffer.addEventHandler(function(fillpercent, fillinsecs, max){ console.log("Event got called from overlay buffer, fillstate(%) = " + fillpercent + ", fillstate(s) = " + fillinsecs + ", max(s) = " + max); });
}

function DASHPlayer(videoTag, URLtoMPD)
{
	dashInstance = this;
	this.videoTag = videoTag;
	initDASHttp('no-cache');
	this.mpdLoader = new MPDLoader(DASH_MPD_loaded);
	this.mpdLoader.loadMPD(URLtoMPD);
	//myBuffer = init_timeBuffer(2,10,0,video);
	//video.addEventListener('progress', , false);
}

