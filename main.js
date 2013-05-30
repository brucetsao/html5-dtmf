(function(){
  var f, SineWave, ctx, tones, res$, i$, ref$, len$, k, DTMF, wait, delay, dial, nfield, dfield, button, slice$ = [].slice;
  f = {
    AudioContext: window.AudioContext || window.mozAudioContext || window.webkitAudioContext
  };
  SineWave = (function(){
    SineWave.displayName = 'SineWave';
    var prototype = SineWave.prototype, constructor = SineWave;
    function SineWave(context, frequency){
      this.context = context;
      this.frequency = frequency != null ? frequency : 440;
      this.x = 0;
      this.sampleRate = this.context.sampleRate;
      this.node = this.context.createJavaScriptNode(512, 1, 1);
      this.node.onaudioprocess = bind$(this, 'process');
      this.mod = this.sampleRate / (2 * Math.PI * this.frequency);
    }
    prototype.setFreq = function(frequency){
      this.frequency = frequency;
      return this.mod = this.sampleRate / (2 * Math.PI * this.frequency);
    };
    prototype.process = function(e){
      var data, i$, to$, i;
      data = e.outputBuffer.getChannelData(0);
      for (i$ = 0, to$ = data.length; i$ < to$; ++i$) {
        i = i$;
        data[i] = Math.sin(this.x++ / this.mod);
      }
    };
    prototype.play = function(){
      this._active = true;
      return this.node.connect(this.context.destination);
    };
    prototype.pause = function(){
      if (this._active) {
        this.node.disconnect();
        return this._active = false;
      }
    };
    return SineWave;
  }());
  ctx = new f.AudioContext;
  res$ = {};
  for (i$ = 0, len$ = (ref$ = [697, 770, 852, 941, 1209, 1336, 1477]).length; i$ < len$; ++i$) {
    k = ref$[i$];
    res$[k] = new SineWave(ctx, k);
  }
  tones = res$;
  DTMF = {
    H: [1209, 1336, 1477],
    V: [697, 770, 852],
    get: function(num){
      if (num === 0) {
        return [1336, 941];
      }
      return [DTMF.H[(num - 1) % 3], DTMF.V[~~((num - 1) / 3)]];
    }
  };
  console.log(JSON.stringify(DTMF.get(5)));
  wait = function(delay, fn){
    return setTimeout(fn, delay);
  };
  delay = 40;
  dial = function(num){
    var tone, execute;
    tone = function(n, next){
      var ref$, t1, t2;
      n = parseInt(n);
      ref$ = DTMF.get(n), t1 = ref$[0], t2 = ref$[1];
      console.log("Playing " + n + " (" + t1 + ", " + t2 + ") for " + delay + " ms");
      tones[t1].play();
      tones[t2].play();
      return wait(delay, function(){
        var _, ref$, v;
        console.log("Pausing for " + delay + " ms");
        for (_ in ref$ = tones) {
          v = ref$[_];
          v.pause();
        }
        return wait(delay, function(){
          return next();
        });
      });
    };
    execute = function(arg$){
      var first, rest;
      first = arg$[0], rest = slice$.call(arg$, 1);
      if (!first) {
        return;
      }
      return tone(first, function(){
        return execute(rest);
      });
    };
    return execute(num.split(""));
  };
  nfield = document.querySelector("input[type=text]");
  dfield = document.querySelector("input[type=number]");
  button = document.querySelector("button");
  button.addEventListener('click', function(e){
    return dial(nfield.value.replace(/[^0-9]/g, ''));
  });
  dfield.value = delay;
  dfield.addEventListener('change', function(e){
    return delay = dfield.value;
  });
  function bind$(obj, key, target){
    return function(){ return (target || obj)[key].apply(obj, arguments) };
  }
}).call(this);
