var photoContext = null;
var photo = null;

var photoContextW = 550;
var photoContextH = 400;

function init(){
	photo = document.getElementById("photo");
	photoContext = document.getElementById("photo").getContext("2d");
	document.getElementById("snapBtn").onclick = drawImageInCanvas;
	document.getElementById("sendBtn").onclick = sendPhoto;
}

function drawImageInCanvas(e){
	var img = new Image();
	img.onload = function () {
		photoContext.drawImage(img,0,0, photo.width, photo.height);
	}
	img.src = "css/sample.jpg";	
}

function sendPhoto() {
// Split data channel message in chunks of this byte length.
var CHUNK_LEN = 64000;
console.log('width and height ', photoContextW, photoContextH);
var img = photoContext.getImageData(0, 0, photoContextW, photoContextH),
len = img.data.byteLength,
n = len / CHUNK_LEN | 0;

console.log('Sending a total of ' + len + ' byte(s)');

if (!dataChannel) {
  logError('Connection has not been initiated. ' +
    'Get two peers in the same room first');
  return;
} else if (dataChannel.readyState === 'closed') {
  logError('Connection was lost. Peer closed the connection.');
  return;
}

dataChannel.send(len);

// split the photo and send in chunks of about 64KB
for (var i = 0; i < n; i++) {
  var start = i * CHUNK_LEN,
  end = (i + 1) * CHUNK_LEN;
  console.log(start + ' - ' + (end - 1));
  dataChannel.send(img.data.subarray(start, end));
}

// send the reminder, if any
if (len % CHUNK_LEN) {
  console.log('last ' + len % CHUNK_LEN + ' byte(s)');
  dataChannel.send(img.data.subarray(n * CHUNK_LEN));
}
}

function snapAndSend() {
  snapPhoto();
  sendPhoto();
}

function renderPhoto(data) {
  var canvas = document.createElement('canvas');
  canvas.width = photoContextW;
  canvas.height = photoContextH;
  canvas.classList.add('incomingPhoto');
  // trail is the element holding the incoming images
  trail.insertBefore(canvas, trail.firstChild);

  var context = canvas.getContext('2d');
  var img = context.createImageData(photoContextW, photoContextH);
  img.data.set(data);
  context.putImageData(img, 0, 0);
}

function show() {
  Array.prototype.forEach.call(arguments, function(elem) {
    elem.style.display = null;
  });
}

function hide() {
  Array.prototype.forEach.call(arguments, function(elem) {
    elem.style.display = 'none';
  });
}

function randomToken() {
  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function logError(err) {
  if (!err) return;
  if (typeof err === 'string') {
    console.warn(err);
  } else {
    console.warn(err.toString(), err);
  }
}

window.onload = init;