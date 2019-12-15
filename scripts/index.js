var instrumentalsBufferLoader;
var vocalsBufferLoader;
window.addEventListener('load', SongSmash.init, false);
window.AudioContext = window.AudioContext || window.webkitAudioContext;
window.OfflineAudioContext = window.OfflineAudioContext || window.webkitOfflineAudioContext;
context = new AudioContext();

window.addEventListener('touchstart', function() {

	// create empty buffer
	var buffer = context.createBuffer(1, 1, 22050);
	var source = context.createBufferSource();
	source.buffer = buffer;

	// connect to output (your speakers)
	source.connect(context.destination);

	// play the file
	source.start(0);

}, false);

var BASE64_MARKER = ';base64,';
var temporaryImage;
var objectURL = window.URL || window.webkitURL;

function convertDataURIToBlob(dataURI) {
    // Validate input data
    if(!dataURI) return;

    // Convert image (in base64) to binary data
    var base64Index = dataURI.indexOf(BASE64_MARKER) + BASE64_MARKER.length;
    var base64 = dataURI.substring(base64Index);
    var raw = window.atob(base64);
    var rawLength = raw.length;
    var array = new Uint8Array(new ArrayBuffer(rawLength));

    for(i = 0; i < rawLength; i++) {
        array[i] = raw.charCodeAt(i);
    }

    // Create and return a new blob object using binary data
    return new Blob([array], {type: "image/jpeg"});
}

function getDataUri(url, callback) {
    var image = new Image();
    image.crossOrigin = 'anonymous'
    image.onload = function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.naturalWidth; // or 'width' if you want a special/scaled size
        canvas.height = this.naturalHeight; // or 'height' if you want a special/scaled size

        canvas.getContext('2d').drawImage(this, 0, 0, this.naturalWidth, this.height,
                                    0, 0, 75, 75);

        // Get raw image data
        //callback(canvas.toDataURL('image/png').replace(/^data:image\/(png|jpg);base64,/, ''));

        // ... or get as Data URI
        callback(canvas.toDataURL('image/png'));
    };

    image.src = url;
}