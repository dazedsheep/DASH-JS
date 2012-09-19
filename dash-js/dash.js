var DASHJS_VERSION = "0.5a";
var dashInstance;
var playbackTimePlot;

function updatePlaybackTime()
{
    playbackTimePlot.update(dashInstance.videoTag.currentTime, 2);
    window.setTimeout(function () { updatePlaybackTime(); },100);
    
}

function DASH_MPD_loaded()
{

	


	myBandwidth = new bandwidth(bps, 1.1, 0.9);
   
	adaptation = init_rateBasedAdaptation(dashInstance.mpdLoader.mpdparser.pmpd, dashInstance.videoTag, myBandwidth);
	
   	myFplot = new fPlot(document.getElementById("graph").getContext("2d"),parsePT(dashInstance.mpdLoader.mpdparser.pmpd.mediaPresentationDuration),document.getElementById("graph").width,document.getElementById("graph").height);
 	myFplot.initNewFunction(0);
	myFplot.initNewFunction(1);
    	myFplot.initNewFunction(2); // the current playback time
    	playbackTimePlot = myFplot;
	myBandwidth.addObserver(myFplot);
	
	adaptation.addObserver(myFplot);
	adaptation.switchRepresentation(); // try to get a better representation at the beginning
	
	overlayBuffer = init_mediaSourceBuffer("0", 20,30,0,dashInstance.videoTag);
	dashInstance.overlayBuffer = overlayBuffer;
 	
	if (dashInstance.videoTag.mediaSourceURL != null) {
   		dashInstance.videoTag.src = video.mediaSourceURL;
		console.log("DASH-JS: attached Media Source");
 	 } else if (dashInstance.videoTag.webkitMediaSourceURL != null) {
   		dashInstance.videoTag.src = video.webkitMediaSourceURL;
		console.log("DASH-JS: attached Media Source");
  	 } else {
    		console.log("MediaSource API could not be found!");
	 }

	checkSourceError(dashInstance.videoTag);

        dashInstance.videoTag.addEventListener('webkitsourceopen', onOpenSource, false);
	dashInstance.videoTag.addEventListener('sourceopen', onOpenSource, false);

	dashInstance.videoTag.addEventListener('webkitsourceended', onSourceEnded);
	dashInstance.videoTag.addEventListener('sourceended', onOpenSource, false);
     
	
	overlayBuffer.addEventHandler(function(fillpercent, fillinsecs, max){ console.log("Event got called from overlay buffer, fillstate(%) = " + fillpercent + ", fillstate(s) = " + fillinsecs + ", max(s) = " + max); });
    

   	window.setTimeout(function () { updatePlaybackTime(); },100);

    
}

function DASHPlayer(videoTag, URLtoMPD)
{
	console.log("DASH-JS Version: " + DASHJS_VERSION);
	dashInstance = this;
	this.videoTag = videoTag;
	initDASHttp('no-cache');
	this.mpdLoader = new MPDLoader(DASH_MPD_loaded);
	this.mpdLoader.loadMPD(URLtoMPD);
	//myBuffer = init_timeBuffer(2,10,0,video);
	//video.addEventListener('progress', , false);
}

