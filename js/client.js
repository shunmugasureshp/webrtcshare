var isInitiator;
//var configuration = null;

 var configuration = {
   'iceServers': [{
     'urls': 'stun:stun.l.google.com:19302'
   }]
 };

var room = window.location.hash.substring(1);
if (!room) {
  room = window.location.hash = randomToken();
}

var socket = io('http://localhost:3000');
	socket.on('ipaddr', function(ipaddr) {
	console.log('Server IP address is: ' + ipaddr);
	// updateRoomURL(ipaddr);
});

socket.on('log', function(array) {
  console.log.apply(console, array);
});

socket.on('full', function(room) {
  alert('Room ' + room + ' is full. We will create a new room for you.');
  window.location.hash = '';
  window.location.reload();
});

socket.on('bye', function(room) {
  console.log(`Peer leaving room ${room}.`);
  // If peer did not create the room, re-enter to be creator.
  if (!isInitiator) {
    window.location.reload();
  }
});

socket.on('created', function(room, clientId) {
  console.log('Created room', room, '- my client ID is', clientId);
  isInitiator = true;
  //setImage_panel();
});

socket.on('joined', function(room, clientId) {
  console.log('This peer has joined room', room, 'with client ID', clientId);
  isInitiator = false;
  createPeerConnection(isInitiator, configuration);
  //grabWebCamVideo();
});

socket.on('ready', function() {
  console.log('Socket is ready');
  createPeerConnection(isInitiator, configuration);
});

socket.on('message', function(message) {
  console.log('Client received message:', message);
  signalingMessageCallback(message);
});

window.addEventListener('unload', function() {
  console.log(`Unloading window. Notifying peers in ${room}.`);
  socket.emit('bye', room);
});

/**
* Send message to signaling server
*/
function sendMessage(message) {
  console.log('Client sending message: ', message);
  socket.emit('message', message);
}

// Joining a room.
socket.emit('create or join', room);


function randomToken() {
  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}