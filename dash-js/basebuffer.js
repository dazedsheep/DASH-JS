/*
 * basebuffer.js
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
 

// base class for buffer implementations

function baseBuffer()
{

	this.fillState = new Object();	// will hold the fill state of the buffer, in time and in bytes
	this.fillState.bytes = 0;
	this.fillState.seconds = 0;		// only seconds are used in the time domain, feel free to use fractions
	this.bufferSize = new Object(); // holds the size of the buffer
	this.bufferSize.maxseconds = 0;
	this.bufferSize.maxbytes = 0;
	this.criticalState = new Object(); // used for signaling that we may run out of buffered data
	this.criticalState.seconds = 0;
	this.criticalState.bytes = 0;
	
	
	this.eventHandlers = new Object();
	this.eventHandlers.handler = new Array();
	this.eventHandlers.cntHandlers = 0;
	
	
	// buffer array, ring buffer ...
	this.buffer = new Object;
	this.buffer.array = new Array();
	this.buffer.first = 0;
	this.buffer.last = 0;
	this.buffer.size = 0;
	this.streamEnded = false;
	this.isOverlayBuffer = false;		// Overlay buffers are only used to mimic the behaviour of an HTML element or a video player where we have no access to the buffer of the unit
}

baseBuffer.prototype.initBufferArray = function(dimension,seglength)
{
	this.buffer.size = this.bufferSize.maxseconds / seglength;
	console.log("Buffer size: " + this.buffer.size);
	
	for(i = 0; i < (this.bufferSize.maxseconds / seglength); i++)
	{
		this.buffer.array[i] = new Object();
	}
	
}

baseBuffer.prototype.registerEventHandler = function(event, handler)
{
	this.eventHandlers.handler[this.eventHandlers.cntHandlers] = new Object();
	this.eventHandlers.handler[this.eventHandlers.cntHandlers].fn = handler;
	this.eventHandlers.handler[this.eventHandlers.cntHandlers++].event = event;
}

baseBuffer.prototype.callEvent = function(event,data)
{
	for(i=0;i<this.eventHandlers.handler.length;i++)
	{
		if(this.eventHandlers.handler[i].event == event) this.eventHandlers.handler[i].fn(data);
	}
}


baseBuffer.prototype.drain = function(dimension,amount)
{
	//console.log("Draining buffer: " + object);
	if(dimension == "bytes")
	{
		if(this.fillState.bytes == 0 && this.streamEnded) return -1;
		if(this.fillState.bytes <= this.criticalState.bytes && !this.streamEnded)
        {
            this.callEvent("minimumLevel");
            return 0;
        }else{
            this.fillState.bytes -= amount;
            return this.get();
            
        }
    }
	
	if(dimension == "seconds")
	{
		
		if(this.fillState.seconds == 0 && this.streamEnded) return -1;
        if(this.fillState.seconds <= this.criticalState.seconds && !this.streamEnded) 
        {
            this.callEvent("minimumLevel");
            return 0;
        }else{
           
            this.fillState.seconds -= amount;
            return this.get();
            
        }
    }	    
    return 0;
}

baseBuffer.prototype.state = function(dimension) {	//return buffer fill level in percent

	if(dimension == "bytes")
	{
	
		return (this.fillState.bytes / this.bufferSize.maxbytes)*100;
		
	}
	
	if(dimension == "seconds")
	{
		
		return (this.fillState.seconds / this.bufferSize.maxseconds)*100;
	}
	
	return -1;
	
}

baseBuffer.prototype.add = function(data)
{
	console.log("Adding chunk: " + this.buffer.last % this.buffer.size);
	console.log("Fill state: " + this.fillState.seconds);
	this.buffer.array[this.buffer.last++ % this.buffer.size] = data
}

baseBuffer.prototype.get = function()
{
	console.log("Getting chunk: " + this.buffer.first % this.buffer.size);
	console.log("Fill state: " + this.fillState.seconds);
	return this.buffer.array[this.buffer.first++ % this.buffer.size];
}
