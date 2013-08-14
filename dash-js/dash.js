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
	
   	if(dashInstance.mpdLoader.mpdparser.pmpd.mediaPresentationDuration) myFplot = new fPlot(document.getElementById("graph").getContext("2d"),parsePT(dashInstance.mpdLoader.mpdparser.pmpd.mediaPresentationDuration),document.getElementById("graph").width,document.getElementById("graph").height);
        else
            myFplot = new fPlot(document.getElementById("graph").getContext("2d"), 0, document.getElementById("graph").width, document.getElementById("graph").height);

 	myFplot.initNewFunction(0);
	myFplot.initNewFunction(1);
    	myFplot.initNewFunction(2); // the current playback time
    	playbackTimePlot = myFplot;
	myBandwidth.addObserver(myFplot);
	
	adaptation.addObserver(myFplot);
	adaptation.switchRepresentation(); // try to get a better representation at the beginning
	
	overlayBuffer = init_mediaSourceBuffer("0", 2,4,0,dashInstance.videoTag);
	dashInstance.overlayBuffer = overlayBuffer;
 	
    /* new MSE ... */
    var URL = window.URL || window.wekitURL;
    if(window.WebKitMediaSource != null){
        window.MediaSource = window.WebKitMediaSource;
    }
    var MSE = new window.MediaSource();
    dashInstance.MSE = MSE;
    dashInstance.videoTag.src = URL.createObjectURL(MSE);

	

    dashInstance.MSE.addEventListener('webkitsourceopen', onOpenSource, false);
	dashInstance.MSE.addEventListener('sourceopen', onOpenSource, false);

	dashInstance.MSE.addEventListener('webkitsourceended', onSourceEnded);
	dashInstance.MSE.addEventListener('sourceended', onOpenSource, false);
     
	
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

