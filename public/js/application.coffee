# TODO: Lots more refactoring and tests.
# And features.
# And bugs.

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
    @parsePatches(patches)
    @preRenderCommits()
    @bindSlider()

  parsePatches: (patches) ->
    textcommits = patches.split(/^(?=commit [0-9a-f]{40}$)/m)
    for i, tc of textcommits
      @history[i] =
        commit:  tc.match(/^commit .*$/m)[0].substr(7)
        author:  tc.match(/^Author: .*$/m)[0].substr(8)
        date:    tc.match(/^Date:   .*$/m)[0].substr(8)
        message: tc.split(/^$/m)[1].replace(/^    /g, "")
        patch:   tc.split(/^\+\+\+ b\/.*$/m)[1]
        seqnum:  i

  preRenderCommits: (current = 0) ->
    if current is @history.length
      setTimeout (=> @renderInitialView()), 0
    else
      @loadCommit current
      setTimeout (=> @preRenderCommits current + 1), 0

  renderInitialView: ->
    @ready = true
    lineNumbers = ("<li>#{i}</li>" for i in [1..@maxLines])
    $("#linenumbers").html lineNumbers.join("")
    $("#spinner").hide()
    @renderCommit @history.length - 1, true

  loadCommit: (n) ->
    commit = @history[n]
    if commit.patch
      for chunk in commit.patch.split(/^(?=@@ )/m).slice(1)
        @applyChunk commit, chunk
    commit.rendered = @screen.join("")
    @maxLines = Math.max(@maxLines, @screen.length)

  applyChunk: (commit, chunk) ->
    lines = chunk.split(/\n/m)
    header = lines[0]
    pos = undefined
    lines = lines.slice(1)
    @screen = [] if parseInt(header.match(/\-\d*/)[0].substr(1), 10) is 0
    pos = parseInt(header.match(/\+\d*/)[0].substr(1), 10) - 1
    pos = 0  if pos < 0
    curr = 0
    while lines[curr] != undefined
      if lines[curr][0] is "+"
        @screen.splice pos, 0, "<pre class='loc' data-author='" + window.toSnakeCase(commit.author) + "'style='background-color:" + @colourForAge(commit) + ";'>" + (lines[curr].slice(1) or "&nbsp;") + "</pre>"
      else if lines[curr][0] is "-"
        @screen.splice pos, 1
        pos -= 1
      curr += 1
      pos += 1

  bindSlider: ->
    $("#slider").
      attr("max", @numberOfCommits()).
      val(@numberOfCommits()).
      change((e) => @renderCommit $(e.target).val(), false)
    #change: (event, ui) => @renderCommit ui.value, true

  numberOfCommits: ->
    @history.length

  renderCommit: (n, force) ->
    if @ready
      if force or not @busy
        setTimeout (=>
          @busy = true  unless force
          startTime = new Date()
          commit = @history[n]
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

$ -> new Archaeologit $("#history").text()

