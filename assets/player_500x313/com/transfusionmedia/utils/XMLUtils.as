import com.transfusionmedia.utils.*;

/** 
 *#########################################################################
 *
 * Authored in:		Flash CS3 : ActionScript 2.0
 *  
 * Filename:        XMLUtils.as
 * @usage           Utilities for manipulating XML
 * 
 * @since  	        August 10, 2008
 * @author  	    Warren Benedetto <warren@transfusionmedia.com>
 * 
 *#########################################################################
**/

class com.transfusionmedia.utils.XMLUtils {
	
	public static function escapeEntities(str:String) {
		return str.split('&').join('&amp;').
								split('>').join('&gt;').
								split('<').join('&lt;');
	}
	
	// use this when expecting an array of objects, because xmlToObject will
	// only make an array out of more than one node with the same name.
	public static function forceArray(obj:Object, key:String) {
		if(!obj) return false;
		if(!obj[key]) {
			obj[key] = new Array();
		} else if(!(obj[key] instanceof Array)) {
			obj[key] = new Array(obj[key]);
		}
		return obj[key];
	}
	
	public static function xmlToObject(theXML:XML) {
		
		//if (theXML == null) {
			//theXML = this;
		//}
		
		// make an empty object to attach properties and other objects to
		var returnObj 	= new Object();
		var tempObj 	= new Object();

		// loop throught the child nodes of the returned xml...
		for (var nodeIndex = 0; nodeIndex < theXML.childNodes.length; nodeIndex++) {
			
			var currentNode 		= theXML.childNodes[nodeIndex];

			/* Replace hyphens in node name with underscores */
			var currentNodeName 	= currentNode.nodeName.toString();
			currentNodeName			= currentNodeName.split("-").join("_");
			currentNodeName			= currentNodeName.split(":").join("_");
			
			// for text nodes.....
			if (!(currentNode.firstChild.nodeValue == null && currentNode.hasChildNodes())) {
				// anything thats not another nest of nodes, just make properties from them
				// creating a String object lets us add properties to it later
				var tempNode = new String(currentNode.firstChild.nodeValue);
							
				if (returnObj[currentNodeName] == null) {
					returnObj[currentNodeName] = tempNode;
					
					// this is used for attaching attributes later
					tempObj = returnObj[currentNodeName];
				} else {
					// make an array if it doesn't exist already
					if (returnObj[currentNodeName][0] == null) {
						var tempObj = returnObj[currentNodeName];
						returnObj[currentNodeName] = new Array();
						returnObj[currentNodeName][0] = tempObj;
					}
					returnObj[currentNodeName].push(tempNode);
					
					// this is used for attaching attributes later
					tempObj = returnObj[currentNodeName][returnObj[currentNodeName].length - 1];
				}	

			} else {

				// this is another nested object....
				// if an object of this name doesnt exists...
				if (returnObj[currentNodeName] == null) {
					returnObj[currentNodeName] = xmlToObject(currentNode);
					
					// this is used for attaching attributes later
					tempObj = returnObj[currentNodeName];
				} else {
					// make an array if it doesn't exist already
					if (returnObj[currentNodeName][0] == null) {
						var tempObj = returnObj[currentNodeName];
						returnObj[currentNodeName] = new Array();
						returnObj[currentNodeName][0] = tempObj;
					}
					returnObj[currentNodeName].push(xmlToObject(currentNode));
					
					// this is used for attaching attributes later
					tempObj = returnObj[currentNodeName][returnObj[currentNodeName].length - 1];
				}	

			}
			
			tempObj.attributes = new Object();
			
			var attributeCounter = 0;
			for (var a in currentNode.attributes) {
				attributeCounter++
				
				/* Replace hyphens in attribute name with underscores */
				var attributeName 	= a.toString();
				attributeName		= attributeName.split(":").join("_");

				tempObj.attributes[attributeName] = currentNode.attributes[a];
			}
			if (attributeCounter == 0) {
				tempObj.attributes = null;
			}
				
		}

		// return the new object
		return returnObj;

	}
}