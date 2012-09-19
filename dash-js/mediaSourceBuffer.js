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



function mediaSourceBuffer(id)
{
	this._eventHandlers = new Object();
	this._eventHandlers.cnt = 0;
	this._eventHandlers.handlers = new Array();
    	this.mediaElementBuffered = 0;
   	this.lastTime = 0;
    	this.fill = false;
    	this.doRefill = false;
	this.id = id;
}


function init_mediaSourceBuffer(bufferId, criticalLevel,buffersize, mediaAPI, videoElement, playbackTimePlot)
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
		
        object.mediaElementBuffered -= dashPlayer.videoTag.currentTime - object.lastTime;
        
        
        if(object.mediaElementBuffered < 2) {
           
            rc = object.drain("seconds",2);
            
            if (rc == -1)
            {
                // signal that we are done!
                
                dashPlayer.videoTag.webkitSourceEndOfStream(HTMLMediaElement.EOS_NO_ERROR);
                return;
            }
            
            if (rc != 0)
            {
              
                _push_segment_to_media_source_api(_mediaSourceBuffer, rc);		// the new MediaAPI allows to have more than one source buffer for the separate decoding chains (really nice) so we may support resolution switching in the future
                this.mediaElementBuffered += 2;

            }
            
            
            
            
        } 
        object.lastTime = dashPlayer.videoTag.currentTime;
      
        window.setTimeout(function () {_mediaSourceBuffer.bufferStateListener(_mediaSourceBuffer);},100);
			
	}
    
    // this is the callback method, called by the AJAX xmlhttp call
   	mediaSourceBuffer.prototype.callback = function(){
        
        	window.setTimeout(function () {_mediaSourceBuffer.refill(_mediaSourceBuffer);},0,true);
        
        
    	}
    
	mediaSourceBuffer.prototype.signalRefill = function()
	{
        
		if(_mediaSourceBuffer.doRefill == false)
        {   
            console.log("signaling refill");
            _mediaSourceBuffer.doRefill = true;
            _mediaSourceBuffer.refill(_mediaSourceBuffer);  // asynch ... we will only dive once into this method
        }
	}
	
	mediaSourceBuffer.prototype.getFillLevel = function()
	{
		return this.state("seconds");
	}
	
	mediaSourceBuffer.prototype.push = function(data,segmentDuration)
	{
		
       		_mediaSourceBuffer.fillState.seconds += segmentDuration;
        	_mediaSourceBuffer.add(data);
	
	}	
	
    
	
	mediaSourceBuffer.prototype.refill = function(object){
		
        if(object.doRefill == true){
        
            if(object.fillState.seconds < object.bufferSize.maxseconds){
        
                console.log("Overlay buffer...");
                console.log(object);
                console.log("Fill state of overlay buffer: " + object.fillState.seconds);
		
		
                _dashFetchSegmentAsynchron(object);	
		
                object.callEventHandlers();
            }else{
                object.doRefill = false;
            }
		}
	}
	
	
	
	
	_mediaSourceBuffer = new mediaSourceBuffer(bufferId);
	_mediaSourceBuffer.isOverlayBuffer = true;
	_mediaSourceBuffer.criticalState.seconds = criticalLevel;
	_mediaSourceBuffer.bufferSize.maxseconds = buffersize;
   	_mediaSourceBuffer.initBufferArray("seconds",2);
	_mediaSourceBuffer.mediaAPI = mediaAPI;
	_mediaSourceBuffer.videoElement = videoElement;
	_mediaSourceBuffer.lastTime = 0;
	_mediaSourceBuffer.id = bufferId;
   	_mediaSourceBuffer.playbackTimePlot = playbackTimePlot;
	_mediaSourceBuffer.registerEventHandler("minimumLevel", _mediaSourceBuffer.signalRefill);

		
	
	return _mediaSourceBuffer;
}

