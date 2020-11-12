#!/usr/bin/env node

var childProcess = require('child_process');
const axios = require('axios').default;



function pingForCalls(backend, myhandle) {
	return axios({
		url : backend+"/api/debug/getopencalls/"+myhandle,
		headers: {
			"Accept-Encoding": "gzip",
	        "Connection": "keep-alive"
		},
		timeout: 5000
	})
	.then(result => {
		return doRequests(backend, result.data, myhandle);
	})
	.catch(error => {
		handleError(error);
		resolve();
	});
}

function answerCall(backend, myhandle, answer) {
	if (answer.content && answer.content.length>0) {
		console.log("Replying with FHIR message:");
		console.log(answer.content);
	}
	axios({
	    method : "post",
		url : backend+"/api/debug/getopencalls/"+myhandle,
		data : answer
	});
}

function handleError(error) {
	console.log("An error occured while trying to connect to the server.");
	console.log("Please check that you have the correct URL and that the server is reachable.");
	process.exit(1);
}

async function doRequests(backend, body, myhandle) {
	if (!body.length) return;
    console.log("Processing "+body.length+" actions...");

	for (var i=0;i<body.length;i++) {
		var call = body[i];
		var p = call.path.split("/");
		var path = __dirname + "/../../" + p[p.length-1];
		var args = [call.token, call.lang, backend, call.owner, call.resourceId];
		var res = call.resource;
		console.log("---------------------------");
		if (res != null) {
			console.log("Incoming FHIR message:");
			console.log(res);
			console.log();
		}
		console.log("Start: '"+path+"' for user="+call.owner+" with language="+call.lang+" for resource="+call.resourceId);
		var answer = await runScript(path, args, res);
		answer.returnPath = call._id;
		answerCall(backend, myhandle, answer);
		console.log("Done '"+path+"' with status "+answer.status+".");
		console.log();
	}
	console.log("Waiting for new actions. Press Ctrl-C to abort.");
}

function runScript(scriptPath, args, res) {
    console.log("Run script...");
	return new Promise(function (resolve, reject) {

        var process = childProcess.fork(scriptPath, args, { stdio : ["pipe","pipe","inherit","ipc"] });
        var buf = "";
	    // listen for errors as they may prevent the exit event from firing
	    process.on('error', function (err) {
	        reject(err);
	    });

	    process.stdout.on('data', function(data) {
	        buf += data.toString();
	    });

	    // execute the callback once the process has finished running
	    process.on('exit', function (code) {
	        var err = code === 0 ? null : new Error('exit code ' + code);
	        resolve({ status : code, content : buf});
	    });

	    if (res != null && process.stdin) process.stdin.end(res);

	});
}

var requestLoop = function(backend, handle) {
	pingForCalls(backend, handle)
	.then(function() {
	  setTimeout(function() { requestLoop(backend, handle); }, 1000*5);
	});
};

if (process.argv.length<4) {
	console.log("Usage: node midata_tester.js <serverurl> <token>");
} else {
	var backend = process.argv[2];
	var handle = process.argv[3];
	console.log("Starting with connection to: "+backend);
	console.log("Press Ctrl-C to abort.");
	requestLoop(backend, handle);
}
