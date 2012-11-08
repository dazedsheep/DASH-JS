/*
 * mediaSourceAPIAdaptation.js
 *****************************************************************************
 * Copyright (C) 2012 - 2013 Alpen-Adria-Universit‰t Klagenfurt
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

function checkSourceError(videoTag)
{
	if(videoTag.error == null) return;

	if(videoTag.error.code == 4) {

		console.log("Media SourceAPI error...");
		throw "ERROR SOURCE NOT SUPPORTED … ";

	}else if(videoTag.error.code == 3) {

		console.log("Decoding error");
		throw "Decoding error";

	}else if(videoTag.error.code == 1) {
		console.log("Aborted…");
		throw "Aborted…";
	}else if(videoTag.error.code == 2) {
		console.log("Network error…");
		throw "Aborted…";
	}
}


function sourceBufferAppend(mediaSource, id, data)
{
    mediaSource.sourceBuffers[id].append(data);
}


function addSourceBuffer(mediaSource, id, type)
{

	mediaSource.addSourceBuffer(type);
}



 
 function createMediaSource(representation)
 {
	// to obtain a new MediaSource we will have to create a new video element but without showing it
	var _video = document.createElement("video");
	_video.id = "TEST";
	// now we can set the event handlers
	_video.src = _video.webkitMediaSourceURL;
	// add the standard handlers...
	_video.addEventListener('progress', onProgress);
			
	_video.addEventListener('webkitsourceopen', onOpenSource, false);
	
	_video.addEventListener('webkitsourceended', onSourceEnded);
	
	return _video;
 }