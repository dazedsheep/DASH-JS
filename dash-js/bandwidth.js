/*
 * bandwidth.js
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
 
var maxBandwidth = 8 * 1024 * 1024;        // 4 Mbps

function bandwidth(initial_bps, weight_f, weight_s)
{
	this.identifier = 0;
	this.bps = initial_bps;
	this.weight_f = weight_f;
	this.weight_s = weight_s;
	this.observers = new Array();
	this.observer_num = 0;
}

bandwidth.prototype.addObserver = function (_obj){
	this.observers[this.observer_num++] = _obj;
	
}

bandwidth.prototype.notify = function(){
	if(this.observers.length > 0){
		
		for(var i=0;i< this.observers.length; i++)
		{
			this.observers[i].update(this.bps, this.identifier);
		}
	}
}

bandwidth.prototype.calcWeightedBandwidth = function(_bps) {
	
	// check whether the bitrate has changed dramatically otherwise we won't search a new representation
	console.log("Bitrate measured with last segment: " + _bps + " bps");
	this.bps = parseInt(((this.weight_f * this.bps) + (this.weight_s * _bps)) / 2) * 0.9;  // the weights are used to mimic optmistic or pessimistic behavior
	// check if we exceed the set bandwidth ..
    if( this.bps > maxBandwidth && maxBandwidth > 0) this.bps = maxBandwidth;
    
    console.log("Cummulative bitrate: " + this.bps + " bps");
	
    
    
	// inform the observers
	this.notify();
	return this.bps;
}

bandwidth.prototype.adjustWeights = function(weight_f, weight_s) {

	this.weight_f = weight_f;
	this.weight_s = weight_s;
	
}

bandwidth.prototype.getBps = function () {

	return this.bps;

}