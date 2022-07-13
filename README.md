# MIDATA COOP NodeJS backend services library

This library provides communication functions with the MIDATA server. It may be used by backend services written for nodeJS.

## Installation

Add 

`"midata-nodejs": "git+https://github.com/MIDATAcooperative/midata-nodejs.git"`
 
to your package.json dependencies.

## Backend testing

Run

`npx midata-tester <server> <token>`

in your project directory when prompted by the Midata portal in order to try out your backend service.

## Usage of backend library

`const midata = require('midata-nodejs');`

### Available functions:

* `midata.token()` - Returns current session token
	
* `midata.language()` - Returns language code of current user account
	
* `midata.server()` - Returns base URL of Midata server 
		 
* `midata.userId()` - Returns ID of current user
		
* `midata.resourceId()` - Returns ID of current resource

* `midata.receiveFHIRMessage()` - Returns JSON object with FHIR message that triggered your script
		
* `midata.answerFHIRMessage(jsonbundle)` - Send the JSON object which must be a FHIR bundle back to the server 
	
* `midata.fhirRead(authToken, resourceType, id, version?)` - Reads a FHIR resource from the server						
		
* `midata.fhirSearch(authToken, resourceType, params, unbundle)` - Does a FHIR search on the server						
		
* `midata.fhirCreate(authToken, resource)` - Creates a new FHIR resource on the server						
		
* `midata.fhirUpdate(authToken, resource)` - Updates an existing FHIR resource on the server
		
* `midata.fhirTransaction(authToken, bundle)` - Processes a bundle of actions on the server

* `midata.fhirOperation(authToken, operation, bundle)` - Performs an operation on the server				
		