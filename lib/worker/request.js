// Copyright IBM Corp. 2013. All Rights Reserved.
// Node module: strong-store-cluster
// This file is licensed under the Artistic License 2.0.
// License text available at https://opensource.org/licenses/Artistic-2.0

module.exports = request;
process.on('message', onMessage);


var requestIdCounter = 0;
var requestCallbacks = {};


// This function clobbers `data` if specified
function request(method, collection, key, data, cb) {
  data = data || {};

  data.type = 'DSM_REQUEST';
  data.method = method;
  data.collection = collection;
  data.key = key;

  if (cb) {
    var requestId = getRequestId();
    requestCallbacks[requestId] = cb;
    data.requestId = requestId;
  }

  process.send(data);
}


function onMessage(msg) {
  if (msg.type !== 'DSM_REPLY')
    return;

  var requestId = msg.requestId;
  var cb = requestCallbacks[requestId];
  delete requestCallbacks[requestId];

  if (msg.err) {
    var err = new Error('Master error: ' + msg.err);
    return cb(err);
  }

  cb(null, msg);
}


function getRequestId() {
  return ++requestIdCounter;
}


