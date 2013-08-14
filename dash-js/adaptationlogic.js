/*
 * adaptationlogic.js
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


function adaptationLogic(_mpd, video)
{
	this.mpd = _mpd;
	this.identifier = 1;
	var i=0,n=parseInt(_mpd.period[0].group[0].representation[0].bandwidth),m=0;
	this.mpd.period[0].group[0].representation.forEach(function(_rel){
			
			if(parseInt(_rel.bandwidth) < n)
			{
				m=i;
				n = parseInt(_rel.bandwidth);
			}
			i++;
		
	});
	console.log("DASH JS prototype [basic] adaptation selecting representation " + m + " with bandwidth: " + n);
	
	this.representationID = m;
	this.lowestRepresentation = _mpd.period[0].group[0].representation[m];
	this.currentRepresentation = _mpd.period[0].group[0].representation[m];
	if(this.currentRepresentation.baseURL == false) this.currentRepresentation.baseURL = _mpd.baseURL;
	if(this.lowestRepresentation.baseURL == false) this.lowestRepresentation.baseURL = _mpd.baseURL;
	if(_mpd.type == "dynamic")
    {
        this.currentRepresentation.curSegment = _mpd.period[0].group[0].segmentTemplates[0].startNumber;
    }else
    {
        this.currentRepresentation.curSegment = 0;
	}
    this.resolutionSwitch = 0;
	this.mediaElement = video;
	
	this.observers = new Array();
	this.observer_num = 0;
}

function rateBasedAdaptation(bandwidth)
{
	
	this.bandwidth = bandwidth;
	console.log("DASH JS using adaptation: Rate Based Adaptation");
		
}

adaptationLogic.prototype.addObserver = function(_obj){
	this.observers[this.observer_num++] = _obj;
	
}

adaptationLogic.prototype.notify = function() {
	if(this.observers.length > 0){
		
		for(var i=0;i< this.observers.length; i++)
		{
			this.observers[i].update(parseInt(this.currentRepresentation.bandwidth), this.identifier);
		}
	}
}

adaptationLogic.prototype._getNextChunk = function (count){
    if(this.currentRepresentation.type == "dynamic")
    {
        return this.currentRepresentation.getSegment(this.currentRepresentation);
    }
    return this.currentRepresentation.segmentList.segment[count];
}

adaptationLogic.prototype.getInitialChunk = function(presentation)
{
	return presentation.initializationSegment;
}

adaptationLogic.prototype._getNextChunkP = function (presentation, count){

    if(presentation.type == "dynamic")
    {
        return presentation.getSegment(presentation);
    }
	return presentation.segmentList.segment[count];
}

function init_rateBasedAdaptation(_mpd, video, bandwidth)
{
	rateBasedAdaptation.prototype = new adaptationLogic(_mpd, video);
	rateBasedAdaptation.prototype.switchRepresentation = function (){
	
			
			
			
			// select a matching bandwidth ...
			var i=0, n=parseInt(this.lowestRepresentation.bandwidth), m=this.representationID, _mybps = this.bandwidth.getBps();
			
			this.mpd.period[0].group[0].representation.forEach(function(_rel){
				if(parseInt(_rel.bandwidth) < _mybps && n <= parseInt(_rel.bandwidth))
				{
					console.log("n: " + n + ", m:" + m);
					n = parseInt(_rel.bandwidth);
					m = i;
				}
				i++;
		
			});
			
			// return the segment	
			if( m != this.representationID) 
			{
				// check if we should perform a resolution switch
				if (parseInt(this.currentRepresentation.width) != parseInt(this.mpd.period[0].group[0].representation[m].width) || parseInt(this.currentRepresentation.height) != parseInt(this.mpd.period[0].group[0].representation[m].height))
				{
					if(this.resolutionSwitch != 0) console.log("Doing nothing because a resolution switch is already ongoing");
						else
						{
							console.log("Resolution switch NYI");
							// force a new media source with the new resolution but don't hook it in, wait until enough data has been downloaded
							// only swith the bitrate within the given resolution
							
						}
				}else{		
					// well, switching the bitrate is not that problem ...
					console.log("DASH rate based adaptation: SWITCHING STREAM TO BITRATE = " + this.mpd.period[0].group[0].representation[m].bandwidth);
					this.representationID = m;
					this.mpd.period[0].group[0].representation[m].curSegment = this.currentRepresentation.curSegment;
					this.currentRepresentation = this.mpd.period[0].group[0].representation[m];
					if(this.currentRepresentation.baseURL == false) this.currentRepresentation.baseURL = _mpd.baseURL;
					
				}
			}
			this.notify();
		}

	ratebased = new rateBasedAdaptation(bandwidth);
	
	return ratebased;
}
