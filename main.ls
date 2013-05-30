f =
  AudioContext: window.AudioContext or window.mozAudioContext or window.webkitAudioContext

class SineWave
  (@context, @frequency=440) ->
    @x = 0
    @sample-rate = @context.sample-rate
    @node = @context.createJavaScriptNode(512, 1, 1)
    @node.onaudioprocess = @~process
    @mod = @sample-rate / (2 * Math.PI * @frequency)
    console.log(@mod)

  setFreq: (@frequency) ->
    @mod = @sample-rate / (2 * Math.PI * @frequency)

  process: !(e) ->
    data = e.outputBuffer.getChannelData(0)
    for i from 0 til data.length
      data[i] = Math.sin(@x++ / @mod)

  play: ->
    @_active = true
    @node.connect(@context.destination)

  pause: ->
    if @_active
      @node.disconnect()
      @_active = false

ctx = new f.AudioContext
tones = {[k, new SineWave(ctx, k)] for k in [697 770 852 941 1209 1336 1477]}

DTMF =
  H: [1209 1336 1477]
  V: [ 697  770  852]
  get: (num) ->
    return [1336 941] if num is 0
    [ DTMF.H[(num - 1) % 3], DTMF.V[~~((num - 1) / 3)] ]

console.log(JSON.stringify(DTMF.get(5)))

wait = (delay, fn) -> setTimeout fn, delay

delay = 40

dial = (num) ->
  tone = (n, next) ->
    n = parseInt(n)
    [t1, t2] = DTMF.get(n)
    console.log("Playing #n (#t1, #t2) for #delay ms")
    tones[t1].play()
    tones[t2].play()
    <- wait(delay)
    console.log("Pausing for #delay ms")
    for _, v of tones
      v.pause()
    <- wait(delay)
    next()
  execute = ([first, ...rest]) ->
    return unless first
    <- tone(first)
    execute(rest)
  execute(num.split(""))

nfield = document.querySelector("input[type=text]")
dfield = document.querySelector("input[type=number]")
button = document.querySelector("button")
button.addEventListener \click, (e) ->
  dial(nfield.value)

dfield.value = delay
dfield.addEventListener \change, (e) ->
  delay := dfield.value