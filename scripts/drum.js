 (function(DrummerJS, $, undefined) {

  'use strict';

    // ======================================
    // establish public variables and methods
    // ======================================

    DrummerJS.title = 'Javascript Drum Machine';
    DrummerJS.description = 'Create audio loops using drum  samples.'
    DrummerJS.author = 'Sebastian Inman';

    var $_container = $('.player');
    var $_containerWidth  = $_container.width();
    var $_containerHeight = $_container.height();

    var $_setBPM = $('#set-bpm');
    var $_playPauseBtn = $('#playbutton');
    var $_setSamplesBtn = $('#set-samples');
    var _loop_names = ["loop", "loop2", "loop3", "loop4"]
    var _vocal_index = 0;
    var _vocal_names = ["vocals", "vocals2", "vocals3"]
    var _loop_name = 'loop3'
    var _loop_index = 0;
    var $_loop = $("#" + _loop_name)[0];
    var _vocals_name = 'vocals2'
    var $_vocals = $('#' + _vocals_name)[0];
    var _playbackRate;

    var $_nextVocalBtn = $("#next-vocal");
    var $_nextLoopBtn = $("#next-loop");


    var $_toggleRowBtn;
    var $_sampleBtn;

    var _urlHash;

    var _bpm = {"vocals": 95, "vocals2": 125, "vocals3": 140, "vocals4": 120, "loop": 95, "loop2": 120, "loop3": 160, "loop4": 120}

    var _sampleList = 'default';

    var _totalSteps = 16;
    var _totalRows  = 5;

    var _currentStep = 1;
    var _prevStep = 16;

    var _sampleRate = 44100;
    var _minuteInSeconds = 60;
    var _beatsPerMinute;

    var _stepDelay;

    var calculateBPM = function(loop_name) {
      _beatsPerMinute = _bpm[loop_name]
      //_stepDelay = Math.round(((_sampleRate * _minuteInSeconds) / (_beatsPerMinute * _totalSteps)) / _totalSteps);
      _stepDelay = (60 / _beatsPerMinute * 1000 )/2;
      _playbackRate = _beatsPerMinute / _bpm[_vocals_name];
      $_vocals.playbackRate = _playbackRate;

      return _stepDelay;


    };

    // =======================================================
    // creates namespace provider which helps isolate
    // implementated code from the global namespace, providing
    // a single point of access for functions and methods.
    // =======================================================
    // this keeps the code more organized and allows the code
    // to be combined into more logical sections.
    // =======================================================

    DrummerJS.handler = (function() {

      function _handler() {

            /**
             * @var _this
             * @desc in a 'non-strict' environment, 'this' is bound to
             *       the global scope (if it hasn't been bound to anything else).
             *       in 'strict' mode it is set to undefined. we store it in a
             *       variable to avoid scope conflicts.
             */

             var _this = this;

             var _isPlaying;

             this.getNextVocal = function() {
              if (_vocal_index < _vocal_names.length - 1) {
                _vocal_index++;
              } else {
                _vocal_index = 0

              }
              _vocals_name = _vocal_names[_vocal_index]
              $_vocals = $('#' + _vocals_name)[0];
             }

             this.getNextLoop = function() {
              if (_loop_index < _loop_names.length - 1) {
                _loop_index++;
              } else {
                _loop_index = 0;

              }
              _loop_name = _loop_names[_loop_index]
              $_loop = $('#' + _loop_name)[0];
             }

             this.nextVocalHandler = function() {
              _this.stopAudio();
              _this.getNextVocal();
              calculateBPM(_loop_name)
              _this.startAudio();

             }

             this.nextLoopHandler = function() {
              _this.stopAudio();

              _this.getNextLoop();
              calculateBPM(_loop_name);
              _this.startAudio();

             }

             this.playPauseHandler = function(button) {

              calculateBPM(_loop_name);

              var status = button.data('playing');


              if(status === 'true') {

                button.data('playing', 'false').html('<i class="fa fa-play"></i>');

                _this.stopAudio();
                _timesLooped = 0;

              }else {

                button.data('playing', 'true').html('<i class="fa fa-pause"></i>');
                $_vocals.currentTime = 0;
                _this.startAudio();
              }
            };
            
            this.pageLoad = function() {

              if(!window.location.hash) {

                window.location.hash = '!/';

              }

              _urlHash = window.location.hash.split('/');

            };

            this.toggleSample = function(sample) {

              sample.toggleClass('active');

            };

            this.toggleSampleHandler = function() {

              $('.sample').on('click', function() {

                _this.toggleSample($(this));

              });

            };

            this.updateSampleList = function(samples) {

              _sampleList = samples;

              console.log(_sampleList);

            };

            this.updateBPM = function(bpm) {

              _beatsPerMinute = bpm;

              calculateBPM(_loop_name);

              _this.stopAudio();
              _this.startAudio();

            };
            var _timeouts = []

            this.stopAudio = function() {
              $_loop.pause();
              $_vocals.pause();
              $_vocals.currentTime = 0;
              $_sampleBtn.removeClass('hit');

              clearInterval(_isPlaying);
              _timeouts.forEach(function(element) {
                clearTimeout(element)
              });

            };
            var _timesLooped = 0;
            this.syncVocals = function() {
              $_vocals.currentTime = (_timesLooped * 32 * _stepDelay * _playbackRate) / 1000;
              console.log("vocals synced")
            }


            this.tick = function() {
              _this.playAudio()
            }

            this.runLoop = function() {
              if (_timesLooped == 9) {
                _timesLooped = 0;
              } else {
                _timesLooped++;

              }
              _this.stopAudio();
              _this.startAudio();
              _this.syncVocals();
            }

            this.playLoop = function() {
              for (var i = 0; i < 32; i++) {
                _timeouts.push(setTimeout(_this.tick, i * _stepDelay))
              }
              _timeouts.push(setTimeout(_this.runLoop, 32 * _stepDelay))
            }


            this.startAudio = function() {
              $_loop.currentTime = 0;
              $_loop.play();
              $_vocals.play();

              _currentStep = 0

              _isPlaying = window.setInterval(function() {

                _this.playLoop();

              }, _stepDelay * 32);
              _this.playLoop()
              _this.tick()
            }

            this.playAudio = function() {

              

              $_sampleBtn.removeClass('hit');

              for(var i = 1; i < _totalRows + 1; i++) {

                var $_newSample = $('.sample[data-row="' + i + '"][data-column="' + _currentStep + '"]');

                if($_newSample.hasClass('active')) {

                  $('#' + i)[0].currentTime = 0;

                  if(!$_newSample.hasClass('disabled')) {

                    $('#' + i)[0].play();

                  }else{

                    $('#' + i)[0].pause();

                  }

                  $_newSample.addClass('hit');

                }

              }
              if(_currentStep < _totalSteps) {
                _currentStep++;

              }else if(_currentStep >= _totalSteps){
                _currentStep = 1;

              }

            };

            this.createMatrix = function(rows, columns) {

              var sampleSize  = $_containerWidth / columns;

              for(var i = 1; i < rows + 1; i++) {

                $('<div class="m-column" id="row-' + i + '"></div>').appendTo('.container');


                for(var k = 1; k < columns + 1; k++) {

                  $('<div class="m-cell sample" data-row="' + i + '" data-column="' + k + '" style="/*height:' + (sampleSize - 8) + 'px;width:' + sampleSize + 'px*/"></div>').prependTo('#row-' + i);

                }

              }

              $_toggleRowBtn = $('.enable-disable-row');
              $_sampleBtn = $('.sample');

              calculateBPM(_loop_name);

            };

            this.toggleRowBtnHandler = function(button) {

              button.toggleClass('disabled');

              var rowID = button.attr('id').replace('toggle-row-', '');

              $('.sample[data-row="' + rowID + '"]').toggleClass('disabled');

            };


            /**
             * @function init()
             * @desc initiates the DrummerJS global function
             *       creating an active instance of the script on the
             *       current site.
             */

             this.init = function() {

                // run functions here

                _this.pageLoad();

                _this.createMatrix(_totalRows, _totalSteps);
                _this.toggleSampleHandler();

                $_playPauseBtn.on('click', function() {

                  _this.playPauseHandler($(this));

                });

                $_toggleRowBtn.on('click', function() {

                  _this.toggleRowBtnHandler($(this));

                });

                $_setBPM.on('change', function() {

                  _this.updateBPM($(this).val());

                });

                $_setSamplesBtn.on('change', function() {

                  _this.updateSampleList($(this).val());

                });

                $_nextVocalBtn.on('click', function() {

                  _this.nextVocalHandler();

                });

                $_nextLoopBtn.on('click', function() {

                  _this.nextLoopHandler()

                });

                // start the drum machine

                //$_playPauseBtn.click();

                return this;

              };

            // initiate the script!
            return this.init();

          }

        // create a new handler object
        return new _handler();

      }());

// assign DrummerJS to the global namespace
}(window.DrummerJS = window.DrummerJS || {}, jQuery));

