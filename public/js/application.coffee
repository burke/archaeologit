JSGIT = {}
((J) ->
  toSnakeCase = (s) ->
    s.replace(/\s+$/g, "").replace(/\s/g, "_").replace /<|>|&lt;|&gt;/g, ""
  preRenderCommits = ->
    current = -1
    (->
      if HISTORY.length - 1 is current
        lineNumbers = ""
        i = 1

        while i < MAX_LINES
          lineNumbers += ("<li>" + i + "</li>")
          i++
        READY = true
        $("#linenumbers").html lineNumbers
        J.renderCommit current
      else
        current += 1
        loadCommit current
        setTimeout arguments.callee, 0
    )()
  loadCommit = (n) ->
    commit = HISTORY[n]
    if commit.patch
      chunks = commit.patch.split(/^(?=@@ )/m).slice(1)
      $.each chunks, (i, chunk) ->
        applyChunk commit, chunk
    commit.rendered = SCREEN.join("")
    MAX_LINES = SCREEN.length  if SCREEN.length > MAX_LINES
  applyChunk = (commit, chunk) ->
    lines = chunk.split(/\n/m)
    header = lines[0]
    pos = undefined
    lines = lines.slice(1)
    SCREEN = []  if parseInt(header.match(/\-\d*/)[0].substr(1), 10) is 0
    pos = parseInt(header.match(/\+\d*/)[0].substr(1), 10) - 1
    pos = 0  if pos < 0
    curr = 0
    while lines[curr]
      if lines[curr][0] is "+"
        SCREEN.splice pos, 0, "<pre class='loc' data-author='" + toSnakeCase(commit.author) + "'style='background-color:" + colourForAge(commit) + ";'>" + (lines[curr].slice(1) or "&nbsp;") + "</pre>"
      else if lines[curr][0] is "-"
        SCREEN.splice pos, 1
        pos -= 1
      curr += 1
      pos += 1
  parsePatches = (patches) ->
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
  colourCounter = -1
  HISTORY = []
  SCREEN = []
  MAX_LINES = 0
  READY = false
  BUSY = false
  J.authors = {}
  J.initialize = (patches) ->
    J.authors = {}
    HISTORY = []
    SCREEN = []
    MAX_LINES = 0
    READY = false
    BUSY = false
    colourCount = -1
    HISTORY = parsePatches(patches)
    preRenderCommits()
    $("#nav").slider
      max: JSGIT.numberOfCommits() - 1
      value: JSGIT.numberOfCommits() - 1
      change: (event, ui) ->
        JSGIT.renderCommit ui.value, true

      slide: (event, ui) ->
        JSGIT.renderCommit ui.value, false

  J.numberOfCommits = ->
    HISTORY.length

  J.renderCommit = (n, force) ->
    if READY
      if force or not BUSY
        setTimeout (->
          BUSY = true  unless force
          startTime = new Date()
          commit = HISTORY[n]
          $("#screen").html commit.rendered
          $("#commitmsg").html commit.message
          $("#commithash").html commit.commit
          $("#date").html commit.date
          $("#author").html commit.author
          $("#linenumbers").height $("#screen").height()
          unless force
            setTimeout (->
              BUSY = false
            ), new Date() - startTime
        ), 0
    HISTORY[n]

  J.playback = (timeout) ->
    (->
      val = $("#nav").slider("value")
      if val < HISTORY.length
        $("#nav").slider "value", val + 1
        setTimeout arguments.callee, timeout
    )()

  colourForAge = (commit) ->
    recency = commit.seqnum / J.numberOfCommits()
    red = 255 - Math.round(128 * recency)
    green = 255 - Math.round(128 * recency)
    blue = 255 - 0
    "rgb(" + red + "," + green + "," + blue + ")"

  colourForAuthor = (->
    nextColour = (->
      colours = [ "#ffc", "#fcf", "#cff", "#ccf", "#cfc", "#fcc", "#cca", "#cac", "#acc", "#aac", "#aca", "#caa", "#aa8", "#a8a", "#8aa", "#88a", "#8a8", "#a88" ]
      ->
        colourCounter += 1
        colours[colourCounter % colours.length]
    )()
    (author) ->
      name = author
      snakeAuthor = toSnakeCase(author)
      J.authors[author] = nextColour()  unless J.authors[author]
      J.authors[author]
  )()
) JSGIT
$ ->
  JSGIT.initialize $("#history").text()
