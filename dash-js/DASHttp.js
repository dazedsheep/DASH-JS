/*
 * DASHttp.js
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
 
 var _timeID = 0;
 var _tmpvideo;
 var _cacheControl;
 
function DASHttp()
{
	
	
}


 function _fetch_segment(presentation, url, video, range)
{
	console.log('DASH JS Client fetching segment: ' + url);
	var xhr = new XMLHttpRequest();
	xhr.timeID = _timeID;
	xhr.open('GET', url, true);
	xhr.setRequestHeader('Cache-Control', _cacheControl);
	if(range != -1)
	{
		xhr.setRequestHeader('Range', 'bytes='+range);
		console.log('DASH JS Client fetching byte range: ' + range);
	}

	xhr.responseType = 'arraybuffer';
			
	//_tmpvideo = video;
	xhr.onload = function(e)
		{
				
			data = new Uint8Array(this.response);
			mybps = endBitrateMeasurementByID(this.timeID,data.length);
			myBandwidth.calcWeightedBandwidth(parseInt(mybps));
			adaptation.switchRepresentation();
			dashPlayer.videoTag.webkitSourceAppend(data);
			if(presentation.curSegment >= presentation.segmentList.segments-1) video.webkitSourceEndOfStream(HTMLMediaElement.EOS_NO_ERROR);
				
		};
	
	beginBitrateMeasurementByID(this._timeID);
	_timeID++;
	xhr.send();
}

function _push_segment_to_medie_source_api(segment)
{
	 adaptation.mediaElement.webkitSourceAppend(segment);
}

function _fetch_segment_for_buffer(presentation, url, video, range, buffer, callback)
{
	console.log('DASH JS Client fetching segment: ' + url);
	var xhr = new XMLHttpRequest();
	xhr.timeID = _timeID;
	xhr.open('GET', url, true);
	xhr.setRequestHeader('Cache-Control', _cacheControl);
	if(range != -1)
	{
		xhr.setRequestHeader('Range', 'bytes='+range);
		console.log('DASH JS Client fetching byte range: ' + range);
	}
	
	xhr.responseType = 'arraybuffer';
	xhr.callback = callback;
	xhr.buffer = buffer;
	//_tmpvideo = video;
	xhr.onload = function(e)
	{
		
		data = new Uint8Array(this.response);
		mybps = endBitrateMeasurementByID(this.timeID,data.length);
		myBandwidth.calcWeightedBandwidth(parseInt(mybps));
		adaptation.switchRepresentation();
		video.webkitSourceAppend(data);
        if(callback != 0) callback(2);
		if(presentation.curSegment >= presentation.segmentList.segments-1) video.webkitSourceEndOfStream(HTMLMediaElement.EOS_NO_ERROR);
	
		
	};
	
	beginBitrateMeasurementByID(this._timeID);
	_timeID++;
	xhr.send();
	
}


				
function _dashSourceOpen(presentation, video)
{
	// check the parsed mpd
	// fetch a representation and check whether selfinitialized or ...
		
	video.width = presentation.width;
	video.height = presentation.height;
	if(presentation.hasInitialSegment == false)
	{
			
		_fetch_segment(presentation, presentation.baseURL + adaptation._getNextChunkP(presentation, presentation.curSegment).src, video, adaptation._getNextChunk(presentation.curSegment).range);
	
		if(presentation.curSegment > 0 ) presentation.curSegment = 1;
		presentation.curSegment++;
				
	}else{
		
		_fetch_segment(presentation, presentation.baseURL + adaptation.getInitialChunk(presentation).src, video, adaptation.getInitialChunk(presentation).range);
		//presentation.curSegment++;

	}
			
}
		
function _dashFetchSegment(presentation, video)
{
			
	_fetch_segment(presentation, presentation.baseURL + adaptation._getNextChunkP(presentation, presentation.curSegment).src, video, adaptation._getNextChunk(presentation.curSegment).range);
	presentation.curSegment++;

}

function _dashFetchSegmentBuffer(presentation, video, buffer, callback)
{
	
	_fetch_segment_for_buffer(presentation, presentation.baseURL + adaptation._getNextChunkP(presentation, presentation.curSegment).src, video, adaptation._getNextChunk(presentation.curSegment).range, buffer, callback);
	presentation.curSegment++;
	
}
		
function _dashFetchSegment_sync(presentation, video, buffer, callback)
{
			
	_fetch_segment_sync(presentation, presentation.baseURL + adaptation._getNextChunkP(presentation, presentation.curSegment).src, video, adaptation._getNextChunk(presentation.curSegment).range);
	presentation.curSegment++;

}

function _dashFetchSegmentSynchronized()
{
	_dashFetchSegment_sync(adaptation.currentRepresentation, adaptation.mediaElement);
}

function _dashFetchSegmentAsynchron(buffer, callback)
{
	_dashFetchSegmentBuffer(adaptation.currentRepresentation, adaptation.mediaElement, buffer, callback);
}
 
 
function initDASHttp(cacheControl)
{
	_timeID = 0;
	_cacheControl = cacheControl;
	
}