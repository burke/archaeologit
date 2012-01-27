window.toSnakeCase = (s) ->
  s.replace(/\s+$/g, "").replace(/\s/g, "_").replace /<|>|&lt;|&gt;/g, ""

class Archaeologit
  constructor: (patches) ->
    @history  = []
    @screen   = []
    @maxLines = 0
    @ready    = false
    @busy     = false
    @authors  = {}
    @history  = @parsePatches(patches)
    @preRenderCommits()
    @bindSlider()

  parsePatches: (patches) ->
    textcommits = patches.split(/^(?=commit [0-9a-f]{40}$)/m)
    commits = []
    $.each textcommits, (i, tc) ->
      commits[i] =
        commit: tc.match(/^commit .*$/m)[0].substr(7)
        author: tc.match(/^Author: .*$/m)[0].substr(8)
        date: tc.match(/^Date:   .*$/m)[0].substr(8)
        message: tc.split(/^$/m)[1].replace(/^    /g, "")
        patch: tc.split(/^\+\+\+ b\/.*$/m)[1]
        seqnum: i

    commits

  preRenderCommits: (current = -1) ->
    if current is @history.length - 1
      lineNumbers = ""
      i = 1

      while i < @maxLines
        lineNumbers += ("<li>" + i + "</li>")
        i++
      @ready = true
      $("#linenumbers").html lineNumbers
      @renderCommit current
    else
      @loadCommit current + 1
      setTimeout (=> @preRenderCommits current + 1), 0

  loadCommit: (n) ->
    commit = @history[n]
    if commit.patch
      chunks = commit.patch.split(/^(?=@@ )/m).slice(1)
      $.each chunks, (i, chunk) =>
        @applyChunk commit, chunk
    commit.rendered = @screen.join("")
    @maxLines = @screen.length  if @screen.length > @maxLines

  applyChunk: (commit, chunk) ->
    lines = chunk.split(/\n/m)
    header = lines[0]
    pos = undefined
    lines = lines.slice(1)
    @screen = []  if parseInt(header.match(/\-\d*/)[0].substr(1), 10) is 0
    pos = parseInt(header.match(/\+\d*/)[0].substr(1), 10) - 1
    pos = 0  if pos < 0
    curr = 0
    while lines[curr]
      if lines[curr][0] is "+"
        @screen.splice pos, 0, "<pre class='loc' data-author='" + window.toSnakeCase(commit.author) + "'style='background-color:" + colourForAge(commit) + ";'>" + (lines[curr].slice(1) or "&nbsp;") + "</pre>"
      else if lines[curr][0] is "-"
        @screen.splice pos, 1
        pos -= 1
      curr += 1
      pos += 1

  bindSlider: ->
    $("#nav").slider
      max: @numberOfCommits() - 1
      value: @numberOfCommits() - 1
      change: (event, ui) =>
        @renderCommit ui.value, true
      slide: (event, ui) =>
        @renderCommit ui.value, false

  numberOfCommits: ->
    @history.length

  renderCommit: (n, force) ->
    if @ready
      if force or not @busy
        setTimeout (=>
          @busy = true  unless force
          startTime = new Date()
          commit = @history[n]
          console.log @history
          $("#screen").html commit.rendered
          $("#commitmsg").html commit.message
          $("#commithash").html commit.commit
          $("#date").html commit.date
          $("#author").html commit.author
          $("#linenumbers").height $("#screen").height()
          unless force
            setTimeout (=>
              @busy = false
            ), new Date() - startTime
        ), 0
    @history[n]

  colourForAge: (commit) ->
    recency = commit.seqnum / @numberOfCommits()
    red = 255 - Math.round(128 * recency)
    green = 255 - Math.round(128 * recency)
    blue = 255 - 0
    "rgb(" + red + "," + green + "," + blue + ")"

$ -> window.archaeologit = new Archaeologit $("#history").text()

