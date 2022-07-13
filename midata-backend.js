const fs = require("fs");
const axios = require('axios').default;

var midataSettings = {
	token :	process.argv[2],
	language : process.argv[3],
	server : process.argv[4],
	userId : process.argv[5],
	resourceId : process.argv[6],
	useFhirR4 : false
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

	/** Sets the backend to use FHIR R4 (default is STU3)*/
	useFhirR4 : function(useR4) {
		midataSettings.useFhirR4 = useR4;
	},

	/** Read a FHIR resource */
	fhirRead : function(authToken, resourceType, id, version) {
		return axios({
			method: "get",
			url: midataSettings.server + "/fhir/"+resourceType+"/"+id+(version !== undefined ? "/_history/"+version : ""),
			headers: {
				"Authorization": "Bearer " + authToken,
				"Accept": midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
				"Accept-Encoding": "gzip",
				"Connection": "keep-alive"
			}
		}).then(result => {
			return result.data;
		});
	},

	/** Search for FHIR resources */
	fhirSearch : function(authToken, resourceType, params, unbundle) {
		var req = axios({
			method: "get",
	    	url: midataSettings.server + "/fhir/"+resourceType,
	    	headers: {
				"Authorization" : "Bearer "+authToken,
				"Accept" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
				"Accept-Encoding": "gzip",
				"Connection": "keep-alive"
			},
	    	params: params
		}).then(result => {
			return result.data;
		});
		return unbundle ? unpackBundle(req) : req;
	},

	/** Create a new FHIR resource */
	fhirCreate : function(authToken, resource) {
		return axios({
	    	method : "post",
	    	url : midataSettings.server + "/fhir/"+resource.resourceType,
	    	headers : {
				"Authorization" : "Bearer "+authToken ,
			 	"Prefer" : "return=representation",
				"Content-Type" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
				"Accept" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json"
			},
	    	data : resource
		}).then(result => {
			return result.data;
		});
	},

	/** Update a previously read FHIR resource */
	fhirUpdate : function(authToken, resource) {
		return axios({
			method : "put",
			url : midataSettings.server +"/fhir/"+resource.resourceType+"/"+resource.id,
			headers : {
				"Authorization" : "Bearer "+authToken,
				"Prefer" : "return=representation",
				"Content-Type" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
				"Accept" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json"
			},
	    	data : resource
		}).then(result => {
			return result.data;
		});
	},

	/** Send a bundle containing changes to the server */
	fhirTransaction : function(authToken, bundle) {
		return axios({
		    	method : "post",
		    	url : midataSettings.server + "/fhir",
		    	headers : {
					"Authorization" : "Bearer "+authToken,
					"Content-Type" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
					"Accept" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json"
				},
		    	data : bundle
		}).then(result => {
			return result.data;
		});
	},

	/** Performs an operation on the server */
	fhirOperation : function(authToken, operation, bundle) {
		return axios({
			method : "post",
			url : midataSettings.server + "/fhir/" + operation,
			headers : {
				"Authorization" : "Bearer " + authToken,
				"Content-Type" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json",
				"Accept" : midataSettings.useFhirR4 ? "application/fhir+json; fhirVersion=4.0" : "application/fhir+json"
			},
			data : bundle
		}).then(result => {
			return result.data;
		});
	}
};
