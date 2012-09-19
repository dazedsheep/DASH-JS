/*
 * timeBuffer.js
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
var _timeBuffer;
function timeBuffer()
{
  
}

function init_timeBuffer(criticalLevel,buffersize,mediaAPI, videoElement)
{
	timeBuffer.prototype = new baseBuffer();
		// set up the listeners for the video element to get the acutal level of the buffer
	timeBuffer.prototype.bufferStateListener = function(object){
			
			// this is called by the progress event of the media source api, drain the buffer and check whether whe have to fetch some segments
		
			console.log("checking playback state, passed time: " + (_timeBuffer.videoElement.currentTime - _timeBuffer.lastTime));
			console.log("buffer fill state on call: " + _timeBuffer.fillState.seconds);
			
			
			_timeBuffer.drain("seconds",_timeBuffer.videoElement.currentTime - _timeBuffer.lastTime,object); // this will go down the sink and will call the refill through the eventHandler
			_timeBuffer.lastTime = _timeBuffer.videoElement.currentTime;
			//setTimeout(function(){_timeBuffer.bufferStateListener(object)},100);	
		}
	
    timeBuffer.prototype.getFillLevel = function()
    {
        return this.state("seconds");
    }

    timeBuffer.prototype.push = function(segment, segmentDuration)
    {
 		this.add(segment);
		this.fillState.seconds += segmentDuration;
    }	

		
	timeBuffer.prototype.refill = function(object){
        console.log(object);
		console.log(object.predictFillLevel(2));
		console.log(object.fillState.seconds);
		if(object.predictFillLevel(2) == 0)
		{
			_dashFetchSegmentAsynchron(object, object.refill);
		}
		/*if(object.fillState.seconds >= 2) 
		{
			object.fillState.seconds -= 2;
			_push_segment_to_medie_source_api(object.get());
		}*/
	}
    
	_timeBuffer = new timeBuffer();
	_timeBuffer.criticalState.seconds = criticalLevel;
	_timeBuffer.bufferSize.maxseconds = buffersize;
	_timeBuffer.mediaAPI = mediaAPI;
	_timeBuffer.videoElement = videoElement;
	_timeBuffer.lastTime = 0;
	_timeBuffer.initBufferArray("seconds", 2);
	
//	setTimeout(function(){_timeBuffer.bufferStateListener(_timeBuffer)},100);	// check every 100ms how much of the buffer was drained
	_timeBuffer.registerEventHandler("minimumLevel", _timeBuffer.refill);
	
	return _timeBuffer;
}

