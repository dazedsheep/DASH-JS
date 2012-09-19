/*
 * fPlot.js
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

var steppingY = 200; // 200 kbit steps for the Y-axis
var steppingX = 15; // 15 second steps
function fPlot(_canvas, period, width, height) // period will give us the max period length of the function to plot ...
{
	
	
	this.canvas = _canvas;
	// we will have to check the time!
	this.startTime = new Date().getTime();
	this.f = new Array();
	this.width = width;
	this.height = height;
	this.graphwidth = width - 50;
	this.graphheight = height - 25;
	this.canvas.translate(50, height-25); //translate the origin to the bottom left
	this.canvas.scale(1, -1);

/*	this.canvas.strokeStyle = "rgba(0,0,0,.5)";
	this.canvas.lineWidth = 0.8;
	this.canvas.beginPath();
	this.canvas.moveTo(0,0);
	this.canvas.lineTo(500000, 0);
	this.canvas.moveTo(0,0);
	this.canvas.lineTo(0,5000000);
	this.canvas.stroke();
	this.canvas.closePath();*/

}

fPlot.prototype.initNewFunction = function (type) {

	this.f[type] = new Object();
	this.f[type].cnt = 0
	this.f[type].values = new Array();
	this.f[type].timeStamps = new Array();

}

fPlot.prototype.updateOnlyPlaybackTime = function(value, type)
{
    
    
    
}

fPlot.prototype.update = function(value, type)
{
	this.f[type].values[this.f[type].cnt] = value;	
	this.f[type].timeStamps[this.f[type].cnt] = new Date().getTime();
	this.f[type].cnt++;
	this.plot();
}

fPlot.prototype.plot = function()
{
	// clear the canvas
	
	this.canvas.translate(-50, -(this.height));
	this.canvas.setTransform(1,0,0,1,0,0);
	this.canvas.clearRect(0,0,this.width,this.height);
	this.canvas.translate(50, this.height-25); //translate the origin to the bottom left
	this.canvas.scale(1, -1);
	// find the maximum for Y scaling
	var maxY = 0, maxX = 0;
	for(var n = 0; n < this.f.length; n++)
	{
	
	
		for(var i=0;i<this.f[n].values.length;i++)
		{
            if(n!= 2)
            {
                if((this.f[n].values[i]/1024) > maxY) maxY = (this.f[n].values[i])/1024;
                if((this.f[n].timeStamps[i] - this.startTime)/60 > maxX) maxX = (this.f[n].timeStamps[i] - this.startTime)/60;		
            }
		}
	

	}
	
	
	this.canvas.strokeStyle = "rgba(0,0,0,.5)";
	this.canvas.lineWidth = 0.8;
	this.canvas.beginPath();
	this.canvas.moveTo(0,0);
	this.canvas.lineTo(500000, 0);
	this.canvas.moveTo(0,0);
	this.canvas.lineTo(0,5000000);
	this.canvas.stroke();
	this.canvas.closePath();
	
	//plot axis description
	this.canvas.save();
	this.canvas.translate(-50,-(this.height));
//	this.canvas.scale(1, -1);
	this.canvas.setTransform(1,0,0,1,0,0);

	for(var n=0; n < maxY/steppingY;n++)
	{
		this.canvas.fillStyle    = '#00f';
		this.canvas.font         = '10px sans-serif';
		this.canvas.textBaseline = 'top';
		var metrics = this.canvas.measureText(n*steppingY);
		this.canvas.fillText(n*steppingY, 50 - metrics.width, this.graphheight - ((((n*steppingY)/maxY) * this.graphheight)+10));
	}
	
	steppingX = maxX / 4;
	/*for(var n=0; n < maxX/steppingX;n++)
	{
		this.canvas.fillStyle    = '#00f';
		this.canvas.font         = '10px sans-serif';
		this.canvas.textBaseline = 'top';
		var metrics = this.canvas.measureText(parseInt(n*steppingX));
	
		this.canvas.fillText(parseInt(n*steppingX), 50 + (((n*steppingX)/maxX) * this.graphwidth) - metrics.width/2, this.height - 25);
	}*/
        this.canvas.fillStyle    = '#00f';
        this.canvas.font         = '10px sans-serif';
        this.canvas.textBaseline = 'top';
        var metrics = this.canvas.measureText("t");
        this.canvas.fillText("t", this.graphwidth - metrics.width, this.height - 25);
    
	
		this.canvas.fillStyle    = '#ff0000';
		this.canvas.font         = '10px sans-serif';
		this.canvas.textBaseline = 'top';
		var metrics = this.canvas.measureText("Estimated Bandwidth");
	
		this.canvas.fillText("Estimated Bandwidth", 10 + metrics.width/2, this.height - 15);
		
		this.canvas.fillStyle    = '#0000ff';
		this.canvas.font         = '10px sans-serif';
		this.canvas.textBaseline = 'top';
	//	var metrics = this.canvas.measureText("Representation Bandwidth");
	
		this.canvas.fillText("Representation Bandwidth", 10 + metrics.width*2, this.height - 15);
	this.canvas.restore();
	

	
	
	
	// plot all tracked functions
	for(var n = 0; n < this.f.length; n++)
	{
        if(n==2)
        {
            this.canvas.strokeStyle = "rgba(0,0,0,1)";
            // draw the playback time line 
            this.canvas.beginPath();
            // move the line within the segment ..
            // first get the right segment, we know each is about 2 seconds ...
            segment_time = 2;
            m = 0;
            for(i=0; i < this.f[0].timeStamps.length; i++)
            {
                if(this.f[n].values[this.f[n].cnt-1] < segment_time){
                    m = i;
                    break;                    
                }
                
                segment_time += 2;
                m = i;
            }
            // estimate the movement of our bar ...
            
            
           // console.log(( (this.f[0].timeStamps[m+1] - this.startTime) - (this.f[0].timeStamps[m] - this.startTime) ) - ( ( (this.f[0].timeStamps[m+1] - this.startTime) - (this.f[0].timeStamps[m] - this.startTime) ) ) /  ( ( ( ( 2000 ) ) ) ) * ( ( (segment_time - this.f[n].values[this.f[n].cnt-1]) *1000) )); 
            move = ( (this.f[0].timeStamps[m+1] - this.startTime) - (this.f[0].timeStamps[m] - this.startTime) ) -  ( ( (this.f[0].timeStamps[m+1] - this.startTime) - (this.f[0].timeStamps[m] - this.startTime) ) ) /  ( ( ( ( 2000 ) ) ) ) * ( ( (segment_time - this.f[n].values[this.f[n].cnt-1]) *1000) );
           // console.log(((this.f[0].timeStamps[m] - this.startTime) + (this.f[n].values[this.f[n].cnt-1] - segment_time) )/60);
            
            this.canvas.moveTo(((((this.f[0].timeStamps[m] - this.startTime) + move )/60)/maxX)*this.graphwidth, 0);
            this.canvas.lineTo(((((this.f[0].timeStamps[m] - this.startTime)  + move )/60)/maxX)*this.graphwidth, this.graphheight);
            this.canvas.stroke();
            this.canvas.closePath();
           // console.log("m: " + m + "f:" + (((this.f[0].timeStamps[m] - this.startTime)/60)/maxX)*this.graphwidth + "segment_t:" + segment_time);
           // console.log("X: "+ ((((this.f[n].values[this.f[n].cnt-1])/60))/maxX)*this.graphwidth + "Y: " + this.graphheight + "MaxX:" + maxX);
            continue;
        }
        
        
		if(n==0) this.canvas.strokeStyle = "rgba(255,0,0,1)";
		if(n==1) this.canvas.strokeStyle = "rgba(0,0,255,1)";
	//	this.canvas.strokeStyle = "rgba(0,0,0,1)";
		this.canvas.beginPath();
		this.canvas.moveTo(0,0);
		for(var i=0;i<this.f[n].values.length;i++)
		{
			if(i>0) this.canvas.lineTo((((this.f[n].timeStamps[i] - this.startTime)/60)/maxX)*this.graphwidth, ((this.f[n].values[i-1]/(1024))/maxY)*this.graphheight);
			this.canvas.lineTo((((this.f[n].timeStamps[i] - this.startTime)/60)/maxX)*this.graphwidth, ((this.f[n].values[i]/(1024))/maxY)*this.graphheight);
		//	console.log("X: "+ (this.f[n].timeStamps[i] - this.startTime) / 60 + "Y: " + this.f[n].values[i] / (1024));
		}
		this.canvas.stroke();
		this.canvas.closePath();

	}
}