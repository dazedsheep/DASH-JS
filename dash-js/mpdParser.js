/*
 * mpdParser.js
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
MPD = new Object(); 
MPD.rootElement = new Object();
MPD.rootElement.name = "MPD";
MPD.rootElement.profile = "profiles";
MPD.rootElement.type = "type";
MPD.rootElement.mediaPresentationDuration = "mediaPresentationDuration";
MPD.rootElement.minBufferTime = "minBufferTime";
MPD.baseURL = new Object();
MPD.baseURL.name = "BaseURL";
MPD.period = new Object();
MPD.period.name = "Period";
MPD.period.start = "start";
MPD.group = new Object();
MPD.group.name = "AdaptationSet";
MPD.group.bitstreamSwitchting = "bitstreamSwitching";	// tells wether bitstream switching is allowed or not
MPD.representation = new Object();
MPD.representation.name = "Representation";
MPD.representation.id = "id";
MPD.representation.codecs = "codecs";
MPD.representation.mimeType = "mimeType";
MPD.representation.width = "width";
MPD.representation.height = "height";
MPD.representation.startWithSAP = "startWithSAP";
MPD.representation.bandwidth = "bandwidth";
MPD.segmentBase = new Object();
MPD.segmentBase.name = "SegmentBase";
MPD.initialization = new Object();
MPD.initialization.name = "Initialization";
MPD.initialization.src = "sourceURL";
MPD.initialization.range = "range";
MPD.segmentList = new Object();
MPD.segmentList.name = "SegmentList";
MPD.segmentList.duration = "duration";
MPD.segmentURL = new Object();
MPD.segmentURL.name = "SegmentURL";
MPD.segmentURL.src = "media";
MPD.segmentURL.range = "mediaRange";

function objectSize(obj)
{
	var size=0, key;
	for (key in obj)
	{
		if(obj.hasOwnProperty(key)) size++;
	}
	return size;
}

function getKeyByIndex(obj,idx)
{
	var i=0, key;
	for(key in obj)
	{
		if(i==idx) return key;
		i++;
	}

}
 
function cc(val, type)
{
	if(type == 'S')
	{
		return parseFloat(val);
	}
	
	if(type == 'H') return parseInt(val)*3600;
	if(type == 'M') return parseInt(val)*60;

}

function parsePT(str)
{
	// we will return the duration in seconds... 
	// format PT XX H XX M XX.XX S

	var _tm = 0;
	var n, type;
	var _im = new Array(), _in = "";
	// get rid off the PT

	
	_str = str.substr(2,str.length);
	
	while(_str.length > 0){
	for(i=0;i<_str.length; i++)
	{
		if(_str[i] == 'H' || _str[i] == 'M' || _str[i] == 'S') 
		{
			type = _str[i];
			n = i;
			break;
		}
		_in += _str[i];
	}
	
		_str = _str.substr(n+1, _str.length);
		_tm += cc(_in,type);
		_in = "";
	}
	console.log("Results of parser: " + _tm);
	return _tm;
}


function getXMLParser()
{
	var parseXML;
	if (typeof window.DOMParser != "undefined") {
			parseXml = function(xmlStr) {
				return ( new window.DOMParser() ).parseFromString(xmlStr, "text/xml");
			};
		} else if (typeof window.ActiveXObject != "undefined" &&
			new window.ActiveXObject("Microsoft.XMLDOM")) {
				parseXml = function(xmlStr) {
				var xmlDoc = new window.ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async = "false";
				xmlDoc.loadXML(xmlStr);
				return xmlDoc;
			};
		} else {
			throw new Error("No XML parser found");
		}
		return function(xmlStr){ return (new DOMParser()).parseFromString(xmlStr, "text/xml");};
}	


function MPDParser(__mpd)
{
	this.parser = getXMLParser();
	console.log(this.parser);
	this.pmpd = new Object();
	this.rmpd = new Object();
	__mpd.trim();
	__mpd.replace(/(\r\n)/g, "");
	this.mpd = this.parser(__mpd);		 
}


MPDParser.prototype.parseInitialization = function(representations, periods, groups, node)
{
	
	initNode = node.childNodes;
	
	for(i=0;i<initNode.length;i++)
	{
	
		if(initNode.item(i).nodeName == MPD.initialization.name)
		{
			var attribs = objectSize(MPD.initialization);
			var mnode = initNode.item(i);	
			for(i=1; i<attribs; i++)
			{
				attribValue = eval("MPD.initialization."+getKeyByIndex(MPD.initialization,i).toString());
				if(mnode.hasAttribute(attribValue)) eval("this.pmpd.period[periods].group[groups].representation[representations].initializationSegment." + getKeyByIndex(MPD.initialization,i).toString() + "= mnode.attributes.getNamedItem(attribValue).value");
				//console.log("pmpd.period["+periods+"].group["+groups+"].representation["+representations+"].initializationSegment." + getKeyByIndex(MPD.initialization,i).toString() + "=" + eval("this.pmpd.period[periods].groups[groups].representation[representations].initializationSegment." + getKeyByIndex(MPD.initialization,i).toString()));
			}
		
		}
	
	}

}

MPDParser.prototype.parseSegmentList = function(representations, periods, groups, node)
{
	var attribs = objectSize(MPD.segmentList);
	
	for(i=1; i<attribs; i++)
	{
		attribValue = eval("MPD.segmentList."+getKeyByIndex(MPD.segmentList,i).toString());
		if(node.hasAttribute(attribValue)) eval("this.pmpd.period[periods].group[groups].representation[representations].segmentList." + getKeyByIndex(MPD.segmentList,i).toString() + "= node.attributes.getNamedItem(attribValue).value");
		//console.log("pmpd.period["+periods+"].group["+groups+"].representation["+representations+"].segmentList." + getKeyByIndex(MPD.segmentList,i).toString() + "=" + eval("this.pmpd.period[periods].groups[groups].representation[representations].segmentList." + getKeyByIndex(MPD.segmentList,i).toString()));
	}
	
	segmentListChilds = node.childNodes;
	var segments = 0;
	this.pmpd.period[periods].group[groups].representation[representations].segmentList.segment = new Array();
	for(s=0;s<segmentListChilds.length; s++)
	{
	
		if(segmentListChilds.item(s).nodeName == MPD.segmentURL.name)
		{
			node = segmentListChilds.item(s);
			var attribs = objectSize(MPD.segmentURL);	
			this.pmpd.period[periods].group[groups].representation[representations].segmentList.segment[segments] = new Object();			
			for(i=1; i<attribs; i++)
			{
				attribValue = eval("MPD.segmentURL."+getKeyByIndex(MPD.segmentURL,i).toString());
				if(node.hasAttribute(attribValue)) eval("this.pmpd.period[periods].group[groups].representation[representations].segmentList.segment[segments]." + getKeyByIndex(MPD.segmentURL,i).toString() + "= node.attributes.getNamedItem(attribValue).value");
			//	console.log("pmpd.period["+periods+"].group["+groups+"].representation["+representations+"].segmentList.segment["+segments+"]." + getKeyByIndex(MPD.segmentURL,i).toString() + "=" + eval("this.pmpd.period[periods].groups[groups].representation[representations].segmentList.segment[segments]." + getKeyByIndex(MPD.segmentURL,i).toString()));
			}
			segments++;
		}	
	}
	
	this.pmpd.period[periods].group[groups].representation[representations].segmentList.segments = segments;

}

MPDParser.prototype.parseRepresentation = function(representations, periods, groups, node)
{
	var attribs = objectSize(MPD.representation);
				
	for(i=1; i<attribs; i++)
	{
		attribValue = eval("MPD.representation."+getKeyByIndex(MPD.representation,i).toString());
		if(node.hasAttribute(attribValue)) eval("this.pmpd.period[periods].group[groups].representation[representations]." + getKeyByIndex(MPD.representation,i).toString() + "= node.attributes.getNamedItem(attribValue).value");
		//console.log("pmpd.period["+periods+"].group["+groups+"].representation["+representations+"]." + getKeyByIndex(MPD.representation,i).toString() + "=" + eval("this.pmpd.period[periods].groups[groups].representation[representations]." + getKeyByIndex(MPD.representation,i).toString()));
	}
	
	var representationChilds = node.childNodes;
	this.pmpd.period[periods].group[groups].representation[representations].hasInitialSegment = false;
	this.pmpd.period[periods].group[groups].representation[representations].baseURL = false;
	for(r=0;r<representationChilds.length;r++)
	{
	
		if(representationChilds.item(r).nodeName != "#text")
		{
		
			var repNode = representationChilds.item(r);
			
			if(repNode.nodeName == MPD.segmentBase.name)
			{
				
				// if there is a segmentBase we will have an initialization segment!
				this.pmpd.period[periods].group[groups].representation[representations].hasInitialSegment = true;
				this.pmpd.period[periods].group[groups].representation[representations].initializationSegment = new Object();
				this.parseInitialization(representations, groups, periods, repNode);
			}
			
			if(repNode.nodeName == MPD.segmentList.name)
			{
				this.pmpd.period[periods].group[groups].representation[representations].segmentList = new Object();
				
				this.parseSegmentList(representations,groups,periods, repNode);
			
			}
			
			if(repNode.nodeName == MPD.baseURL.name)
			{
				this.pmpd.period[periods].group[groups].representation[representations].baseURL = node.textContent;
			
			}
		
		}	
	}
}

MPDParser.prototype.parseGroup = function(periods, groups, node)
{
	var attribs = objectSize(MPD.group);
				
	for(i=1; i<attribs; i++)
	{
		attribValue = eval("MPD.group."+getKeyByIndex(MPD.group,i).toString());
		if(node.hasAttribute(attribValue)) eval("this.pmpd.period[periods].group[groups]." + getKeyByIndex(MPD.group,i).toString() + "= node.attributes.getNamedItem(attribValue).value");
		//console.log("pmpd.period["+periods+"].group["+groups+"]." + getKeyByIndex(MPD.group,i).toString() + "=" + eval("this.pmpd.period[periods].groups[groups]" + getKeyByIndex(MPD.group,i).toString()));
	}
	// now the representations ...		
	var groupchilds = node.childNodes;
	var representations = 0;
	this.pmpd.period[periods].group[groups].representation = new Array();	
	
	for(gr=0;gr<groupchilds.length;gr++)
	{
	
		if(groupchilds.item(gr).nodeName != "#text")
		{
		
			var groupNode = groupchilds.item(gr);
		
			if(groupNode.nodeName == MPD.representation.name)
			{
				this.pmpd.period[periods].group[groups].representation[representations] = new Object();
			
				this.parseRepresentation(representations,groups, periods, groupNode);
				
				representations++;
			
			}
		
		}	
	}

}


MPDParser.prototype.parsePeriod = function(periods,node)
{
	var attribs =objectSize(MPD.period);
	for(i=1; i<attribs; i++)
	{
		attribValue = eval("MPD.period."+getKeyByIndex(MPD.period,i).toString());
		if(node.hasAttribute(attribValue)) eval("this.pmpd.period[periods]." + getKeyByIndex(MPD.period,i).toString() + "= node.attributes.getNamedItem(attribValue).value");
	//	console.log("pmpd.period["+periods+"]" + getKeyByIndex(MPD.period,i).toString() + "=" + eval("this.pmpd.period[periods]" + getKeyByIndex(MPD.period,i).toString()));
	}
							
	// now check the adaptationsets ...
							
	var periodchilds = node.childNodes;
	var groups = 0;
	this.pmpd.period[periods].group = new Array();
	
	for(j=0;j<periodchilds.length;j++)
	{
		if(periodchilds.item(j).nodeName != "#text")
		{
			var periodNode = periodchilds.item(j);
							
			if(periodNode.nodeName == MPD.group.name)
			{
				this.pmpd.period[periods].group[groups] = new Object();	

				this.parseGroup(periods, groups, periodNode);
				
				groups++;
			}
		}
	}		
	
	

}

MPDParser.prototype.parse = function()
{
	 if(this.mpd.documentElement.tagName == MPD.rootElement.name)
	 {
		// get all attributes within the root element
		
		var attribs =objectSize(MPD.rootElement);
			
		for(i=1; i<attribs; i++)
		{
			attribValue = eval("MPD.rootElement."+getKeyByIndex(MPD.rootElement,i).toString());
			if(this.mpd.documentElement.hasAttribute(attribValue)) eval("this.pmpd." + getKeyByIndex(MPD.rootElement,i).toString() + "= this.mpd.documentElement.attributes.getNamedItem(attribValue).value");
			console.log("pmpd." + getKeyByIndex(MPD.rootElement,i).toString() + "=" + eval("this.pmpd." + getKeyByIndex(MPD.rootElement,i).toString()));
			
		}
				
		var childsFromRoot = this.mpd.documentElement.childNodes;
		this.pmpd.period = new Array();
		var periods = 0;			
		for(c=0;c<childsFromRoot.length;c++)
		{
			if(childsFromRoot.item(c).nodeName != "#text")
			{
				// now check for the BaseURL
				var node = childsFromRoot.item(c);
				if(node.nodeName == MPD.baseURL.name)
				{
					// we won't expect any attributes with the <BaseURL>...</BaseURL>
					this.pmpd.baseURL = node.textContent;
					console.log(this.pmpd.baseURL);
				}
						
				if(node.nodeName == MPD.period.name)
				{
					// uhm a new period
					this.pmpd.period[periods] = new Object();
							
					this.parsePeriod(periods,node);
											
					periods++;
				}
					
			}
				
		}
			
	 }
	 
	
}	

function MPDLoader(callback)
{
	this.callback = callback;
	
}

var instance;		// not nice ...

MPDLoader.prototype._loadMPD = function()
{
	if(instance.xmlHttp.readyState !=4) return;
	bps = endBitrateMeasurement(instance.xmlHttp.responseText.length);
	console.log("Bitrate:" + bps + " bps");
	instance.mpdparser = new MPDParser(instance.xmlHttp.responseText);
	instance.mpdparser.parse();
	instance.callback();
}
		
MPDLoader.prototype.loadMPD = function(mpdURL)
{
	console.log(mpdURL);
	instance = this;
	this.xmlHttp = new XMLHttpRequest(); 
	this.xmlHttp.onreadystatechange = this._loadMPD;
	this.xmlHttp.open( "GET", mpdURL, true );	
	this.xmlHttp.setRequestHeader('Cache-Control', 'no-cache');
	this.xmlHttp.send( null );
			
	beginBitrateMeasurement();
}		



		
