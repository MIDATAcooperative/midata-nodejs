const fs = require("fs");
const request = require('request-promise-native');

var midataSettings = {
	token :	process.argv[2],
	language : process.argv[3],
	server : process.argv[4],
	userId : process.argv[5],
	resourceId : process.argv[6]
};

var unpackBundle = function(promise) {
	return promise.then(function(result) {		
	  if (result && result.entry) {
		  var resultArray = [];
		  var entries = result.entry;
		  for (let i=0;i<entries.length;i++) {		  
			 resultArray.push(entries[i].resource); 
		  }
		  return resultArray;
	  } else {
		  return [];
	  }
	});
};

module.exports = {

	/** Get session token */
	token : function() {
		return midataSettings.token;
	},
	
	/** Get language of logged in user */
	language : function() {
		return midataSettings.language;
	},
	
	/** Get URL of Midata backend */
	server : function() {
		return midataSettings.server;
	},
		 
	/** Get id of logged in user */
	userId : function() {
		return midataSettings.userId;
	},
		
	/** Get id of resource that has been changed */
	resourceId : function() {
		return midataSettings.resourceId;
	},
	
	/** Return FHIR message that triggered request as JSON */
	receiveFHIRMessage : function() {
		return JSON.parse(fs.readFileSync(0, 'utf8'));
	},
	
	/** Send answer to FHIR message back to server */
	answerFHIRMessage : function(answerJson) {
		process.stdout.write(JSON.stringify(answerJson));
	},
	
	/** Read a FHIR resource */
	fhirRead : function(authToken, resourceType, id, version) {						
		return request({
			json : true,
	    	url : midataSettings.server + "/fhir/"+resourceType+"/"+id+(version !== undefined ? "/_history/"+version : ""),
	    	headers : { "Authorization" : "Bearer "+authToken }
	    }); 
	},
	
	/** Search for FHIR resources */
	fhirSearch : function(authToken, resourceType, params, unbundle) {						
		var req = request({
			json : true,		    	    	
	    	url : midataSettings.server + "/fhir/"+resourceType,
	    	headers : { "Authorization" : "Bearer "+authToken },
	    	qs : params	    	
	    });
		return unbundle ? unpackBundle(req) : req;
	},
	
	/** Create a new FHIR resource */
	fhirCreate : function(authToken, resource) {						
		return request({
	    	method : "POST",
	    	json : true,
	    	url : midataSettings.server + "/fhir/"+resource.resourceType,
	    	headers : { "Authorization" : "Bearer "+authToken , "Prefer" : "return=representation" },
	    	body : resource
	    });
	},
	
	/** Update a previously read FHIR resource */
	fhirUpdate : function(authToken, resource) {
		return request({
			method : "PUT",
			json : true,
			url : midataSettings.server +"/fhir/"+resource.resourceType+"/"+resource.id,
			headers : { "Authorization" : "Bearer "+authToken, "Prefer" : "return=representation" },
	    	body : resource
		});
	},
	
	/** Send a bundle containing changes to the server */
	fhirTransaction : function(authToken, bundle) {							    	   
		return request({  	    	
		    	method : "POST",
		    	json : true,
		    	url : midataSettings.server + "/fhir",
		    	headers : { "Authorization" : "Bearer "+authToken },
		    	body : bundle	    	
		    
	    });		
	}
		 				
};