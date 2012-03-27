/*
 * mediaSourceBuffer.js
 *****************************************************************************
 * Copyright (C) 2012 - 2013 Alpen-Adria-Universität Klagenfurt
 *
 * Created on: Feb 13, 2012
 * Authors: Benjamin Rainer <benjamin.rainer@itec.aau.at>
 *          Stefan Lederer  <stefan.lederer@itec.aau.at>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published
 * by the Free Software Foundation; either version 2.1 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston MA 02110-1301, USA.
 *****************************************************************************/
var _mediaSourceBuffer;


function mediaSourceBuffer()
{
	this._eventHandlers = new Object();
	this._eventHandlers.cnt = 0;
	this._eventHandlers.handlers = new Array();
    this.lastTime = 0;
}


function init_mediaSourceBuffer(criticalLevel,buffersize,mediaAPI, videoElement)
{
	mediaSourceBuffer.prototype = new baseBuffer();
	
	mediaSourceBuffer.prototype.addEventHandler = function (fn)
	{
		// handlers will get the fillstate ...
		
		this._eventHandlers.handlers[this._eventHandlers.cnt] = new Object();
		this._eventHandlers.handlers[this._eventHandlers.cnt++].fn = fn;
	}
	
	
	mediaSourceBuffer.prototype.callEventHandlers = function ()
	{
		
		for(i=0;i<this._eventHandlers.cnt; i++) 
		{
			this._eventHandlers.handlers[i].fn(this.getFillLevel(),this.fillState.seconds, this.bufferSize.maxseconds);
			
		}
	}
	
	mediaSourceBuffer.prototype.bufferStateListener = function(object){
		
		//console.log("checking playback state, passed time: " + (_mediaSourceBuffer.videoElement.currentTime - _mediaSourceBuffer.lastTime));
		_mediaSourceBuffer.drain("seconds",_mediaSourceBuffer.videoElement.currentTime - _mediaSourceBuffer.lastTime,object); 
		_mediaSourceBuffer.lastTime = _mediaSourceBuffer.videoElement.currentTime;
		//	if(object.videoElement.webkitSourceState != HTMLMediaElement.SOURCE_ENDED) setTimeout(function(){_mediaSourceBuffer.bufferStateListener(object)},100);	
	}
	mediaSourceBuffer.prototype.predictFillLevel = function(segmentDuration)
	{
		/*	console.log(this.fillState.seconds);
		 console.log(this.bufferSize.maxseconds);
		 console.log("prediction: " +((this.fillState.seconds + segmentDuration) / this.bufferSize.maxseconds));*/
		if (((this.fillState.seconds + segmentDuration) / this.bufferSize.maxseconds) > 1.0) return -1;
		else
			return 0;
	}
	
	mediaSourceBuffer.prototype.getFillLevel = function()
	{
		return this.state("seconds");
	}
	
	mediaSourceBuffer.prototype.push = function(segmentDuration)
	{
		// before using this function, please check whether the buffer can take the actual segment
		/*if(this.getFillLevel() <= 1.0){
			
			this.fillState.seconds += segmentDuration;
			
		}
		else
			return -1;*/
        
        _mediaSourceBuffer.fillState.seconds = _mediaSourceBuffer.videoElement.buffered.end(0) - _mediaSourceBuffer.videoElement.currentTime;
        
	}	
	
    
	
	mediaSourceBuffer.prototype.refill = function(object){
		console.log("Overlay buffer...");
		console.log("Fill state of overlay buffer: " + object.fillState.seconds);
		console.log(object);
		
		_dashFetchSegmentAsynchron(0,object.push);	
		//object.push(2);	
		object.callEventHandlers();
		
		
	}
	
	
	
	
	_mediaSourceBuffer = new mediaSourceBuffer();
	_mediaSourceBuffer.isOverlayBuffer = true;
	_mediaSourceBuffer.criticalState.seconds = criticalLevel;
	_mediaSourceBuffer.bufferSize.maxseconds = buffersize;
	_mediaSourceBuffer.mediaAPI = mediaAPI;
	_mediaSourceBuffer.videoElement = videoElement;
	_mediaSourceBuffer.lastTime = 0;
	
//	setTimeout(function(){_mediaSourceBuffer.bufferStateListener(_mediaSourceBuffer)},100);	// check every 100ms how much of the buffer was drained
	_mediaSourceBuffer.registerEventHandler("minimumLevel", _mediaSourceBuffer.refill);
	
	return _mediaSourceBuffer;
}

