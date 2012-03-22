/*
 * rate_measurement.js
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

measurement = new Object();
measurement.startTimeMeasure = 0;
measurement.endTimeMeasure = 0;
var __id = new Array();

function beginBitrateMeasurement(){
	
	measurement.startTimeMeasure =new Date().getTime();	
	
}

function endBitrateMeasurement(lengthInBytes){

	measurement.endTimeMeasure =new Date().getTime();
	
	// return bps
	return ((lengthInBytes*8)/(measurement.endTimeMeasure - measurement.startTimeMeasure))*1000;
}

function beginBitrateMeasurementByID(id){

	__id[id]=new Date().getTime();	

}

function endBitrateMeasurementByID(id, lengthInBytes){

	
	end = new Date().getTime();
	
	// return bps
	//console.log("END id: " + id + " time: " +end);
	//console.log("Start: " + __id[id]);
	return ((lengthInBytes*8)/(end - __id[id]))*1000;
}