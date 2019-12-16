var SongSmash = {
  instrumentalBuffer: [],
  vocalBufferList: [],
  instrumentalIndex: 0,
  vocalIndex: 0,
  targetBPM: 120,
  vocalMultiplier: 1,
  instrumentalMultiplier: 1,
  gainNode: null,
  source1: null,
  source2: null
}

SongSmash.loadNextInstrumental = function () {
  this.instrumentalMultiplier = 1
  if (this.instrumentalIndex + 1 < InstrumentalFiles.length) {
    this.instrumentalIndex++
  } else {
    this.instrumentalIndex = 0
  }
  this.getInstrumentalBuffer(function(bufferList){
    SongSmash.instrumentalBufferList = bufferList
    SongSmash.stop()
    SongSmash.updateUI()
    SongSmash.play()
  })
}

SongSmash.loadPrevInstrumental = function () {
  this.instrumentalMultiplier = 1
  if (this.instrumentalIndex > 0) {
    this.instrumentalIndex--
  } else {
    this.instrumentalIndex = InstrumentalFiles.length - 1
  }
  this.getInstrumentalBuffer(function(bufferList){
    SongSmash.instrumentalBufferList = bufferList
    SongSmash.stop()
    SongSmash.updateUI()
    SongSmash.play()
  })
}

SongSmash.currentInstrumentalImageUrl = function () {
  return InstrumentalFiles[this.instrumentalIndex].img
}

SongSmash.currentVocalImageUrl = function () {
  return VocalFiles[this.vocalIndex].img
}

SongSmash.loadNextVocal = function () {
  this.vocalMultiplier = 1
  if (this.vocalIndex + 1 < VocalFiles.length) {
    this.vocalIndex++
  } else {
    this.vocalIndex = 0
  }
  this.getVocalBuffer(function(bufferList){
    SongSmash.vocalBufferList = bufferList
    SongSmash.stop()
    SongSmash.updateUI()
    SongSmash.play()
  })
}

SongSmash.loadPrevVocal = function () {
  this.vocalMultiplier = 1
  if (this.vocalIndex > 0) {
    this.vocalIndex--
  } else {
    this.vocalIndex = VocalFiles.length - 1
  }
  this.getVocalBuffer(function(bufferList){
    SongSmash.vocalBufferList = bufferList
    SongSmash.stop()
    SongSmash.updateUI()
    SongSmash.play()
  })
}

SongSmash.stop = function () {
  if (SongSmash.source1) {
    SongSmash.source1.stop()
    SongSmash.source1.disconnect()
    SongSmash.source1 = null
  }
  if (SongSmash.source2) {
    SongSmash.source2.stop()
    SongSmash.source2.disconnect()
    SongSmash.source2 = null
  }
  if (SongSmash.mixSource) {
    SongSmash.mixSource.stop()
    SongSmash.mixSource.disconnect()
    delete SongSmash.mixSource.buffer
    delete SongSmash.mixSource
  }
}

SongSmash.slowDownVocal = function () {
  this.vocalMultiplier /= 2
  this.stop()
  this.play()
}

SongSmash.speedUpVocal = function () {
  this.vocalMultiplier *= 2
  this.stop()
  this.play()
}

SongSmash.slowDownInstrumental = function () {
  this.instrumentalMultiplier /= 2
  this.stop()
  this.play()
}

SongSmash.speedUpInstrumental = function () {
  this.instrumentalMultiplier *= 2
  this.stop()
  this.play()
}

SongSmash.play = function () {
  // create and set up sources
  if (this.instrumentalBufferList.length < 0 || this.vocalBufferList.length < 0) {
    return
  }
  var instrumentalBuffer = this.instrumentalBufferList[0]
  var vocalBuffer = this.vocalBufferList[0]
  var vocalBPM = VocalFiles[this.vocalIndex].bpm
  var instrumentalBPM = InstrumentalFiles[this.instrumentalIndex].bpm
  var instrumentalDuration = instrumentalBuffer.duration
  var instrumentalPlaybackRate = this.normalizedPlaybackRate(instrumentalDuration, instrumentalBPM) * this.instrumentalMultiplier
  var vocalsDuration = vocalBuffer.duration
  var vocalsPlaybackRate = this.normalizedPlaybackRate(vocalsDuration, vocalBPM) * this.vocalMultiplier

  var numberOfChannels = 2
  var sampleRate = 44100
  var length = sampleRate * vocalsDuration * vocalsPlaybackRate
  var offlineContext = new OfflineAudioContext(numberOfChannels, length, sampleRate)


  //this.stop()

  var source1 = offlineContext.createBufferSource()
  var source2 = offlineContext.createBufferSource()
  source1.buffer = instrumentalBuffer
  source1.playbackRate.value = instrumentalPlaybackRate
  source1.loop = true
  source2.buffer = vocalBuffer
  source2.playbackRate.value = vocalsPlaybackRate
  //source2.loop = true

  // connect audio to the renderer
  source1.connect(offlineContext.destination)
  source2.connect(offlineContext.destination)

  // start audio
  source1.start(0)
  source2.start(0)

  // render the mix
  this.stop()

  SongSmash.source1 = source1
  SongSmash.source2 = source2
  console.log("Rendering mix...")
  offlineContext.oncomplete = function (e) {
    var buffer = e.renderedBuffer
    console.log("Rendering complete.")
    //context.destination.disconnect()
    //SongSmash.stop()
    let mixSource = context.createBufferSource()
    mixSource.buffer = buffer
    mixSource.connect(SongSmash.gainNode)
    mixSource.loop = true
    mixSource.start(0)
    SongSmash.mixSource = mixSource
    console.log("Playing mix.")
  }
  offlineContext.startRendering()
}

SongSmash.setVocalImage = function () {
  getDataUri(this.currentVocalImageUrl(), function (dataUri) {
    if (temporaryImage) objectURL.revokeObjectURL(temporaryImage);
    var imageDataBlob = convertDataURIToBlob(dataUri);
    temporaryImage = objectURL.createObjectURL(imageDataBlob);
    //$("#vocalImage").attr("src", temporaryImage)
  });
}

SongSmash.setInstrumentalImage = function () {
  getDataUri(this.currentInstrumentalImageUrl(), function (dataUri) {
    if (temporaryImage) objectURL.revokeObjectURL(temporaryImage);
    var imageDataBlob = convertDataURIToBlob(dataUri);
    temporaryImage = objectURL.createObjectURL(imageDataBlob);
    //$("#instrumentalImage").attr("src", temporaryImage)
  });
}

SongSmash.updateUI = function () {
  this.setVocalImage()
  this.setInstrumentalImage()
}

SongSmash.setBPM = function (element) {
  var bpm = parseInt(element.value)
  this.mixSource.playbackRate.value = bpm / 120
  $("p#bpm").html(bpm)
}

SongSmash.normalizedPlaybackRate = function (duration, bpm) {
  var sixteenBeatsInSeconds = ((60 / bpm) * 2)
  var currentMultiple = duration / sixteenBeatsInSeconds
  var roundedMultiple = Math.round(currentMultiple)
  return (currentMultiple / roundedMultiple) * (this.targetBPM / bpm)
}

SongSmash.onDoneLoading = function (duration, bpm) {
  this.updateUI()
  $("#play-button").show()
  $(".loading-text").html("<button onclick='sessionWillBegin()'>Click Here to Play</button>")
}

function sessionWillBegin() {
  $(".loading-text").hide()
  $(".control-center").show()
  SongSmash.play()
}

SongSmash.finishedLoadingInstrumentals = function (bufferList) {
  console.log("Instrumentals loaded.")
  // Create two sources and play them both together.
  SongSmash.instrumentalBufferList = bufferList
  if (SongSmash.vocalBufferList.length > 0) {
    SongSmash.onDoneLoading()
  }
}

SongSmash.finishedLoadingVocals = function (bufferList) {
  console.log("Vocals loaded.")
  // Create two sources and play them both together.
  SongSmash.vocalBufferList = bufferList
  if (SongSmash.instrumentalBufferList.length > 0) {
    SongSmash.onDoneLoading()
  }
}

SongSmash.getVocalBuffer = function(completion) {
  var vocalsBufferLoader = new BufferLoader(
    context,
    [VocalFiles[SongSmash.vocalIndex].file],
    completion
  )
  vocalsBufferLoader.load()
}

SongSmash.getInstrumentalBuffer = function(completion) {
  var instrumentalsBufferLoader = new BufferLoader(
    context,
    [InstrumentalFiles[SongSmash.instrumentalIndex].file],
    completion
  )
  instrumentalsBufferLoader.load()
}

SongSmash.init = function () {
  // Fix up prefixing
  SongSmash.gainNode = context.createGain()
  SongSmash.gainNode.connect(context.destination)
  SongSmash.getInstrumentalBuffer(function(bufferList) {
    SongSmash.finishedLoadingInstrumentals(bufferList)
  })
  SongSmash.getVocalBuffer(function(bufferList) {
    SongSmash.finishedLoadingVocals(bufferList)
  })
}


