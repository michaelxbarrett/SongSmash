function BufferLoader(context, urlList, callback) {
  this.context = context;
  this.urlList = urlList;
  this.onload = callback;
  this.bufferList = new Array();
  this.loadCount = 0;
}

BufferLoader.prototype.loadBuffer = function (url, index) {
  // Load buffer asynchronously
  var myHeaders = new Headers();
  myHeaders.append('pragma', 'force-cache');
  myHeaders.append('cache-control', 'force-cache');
  const request = new Request(url, {
    method: 'GET',
    headers: myHeaders
  });
  request.cache = 'no-store'
  var loader = this;

  fetch(request)
    .then(x => x.arrayBuffer())
    .then(function (buffer) {
      loader.context.decodeAudioData(
        buffer,
        function (buffer) {
          if (!buffer) {
            alert('error decoding file data: ' + url);
            return;
          }
          loader.bufferList[index] = buffer;
          if (++loader.loadCount == loader.urlList.length) {
            loader.onload(loader.bufferList);
            loader.bufferList = new Array();
          }
        },
        function (error) {
          console.error('decodeAudioData error', error);
        }
      );
    })

  // var request = new XMLHttpRequest();
  // request.open("GET", url, true);
  // request.responseType = "arraybuffer";

  // var loader = this;

  // request.onload = function() {
  //   // Asynchronously decode the audio file data in request.response
  //   loader.context.decodeAudioData(
  //     request.response,
  //     function(buffer) {
  //       if (!buffer) {
  //         alert('error decoding file data: ' + url);
  //         return;
  //       }
  //       loader.bufferList[index] = buffer;
  //       if (++loader.loadCount == loader.urlList.length)
  //         loader.onload(loader.bufferList);
  //     },
  //     function(error) {
  //       console.error('decodeAudioData error', error);
  //     }
  //   );
  // }

  // request.onerror = function() {
  //   alert('BufferLoader: XHR error');
  // }

  // request.send();
}

BufferLoader.prototype.load = function () {
  for (var i = 0; i < this.urlList.length; ++i)
    this.loadBuffer(this.urlList[i], i);
}
