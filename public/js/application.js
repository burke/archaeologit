var JSGIT = {};

(function(J) {

  // public ///////////////////////////////////////////////////////////////////
  J.initialize = function(patches) {
    HISTORY = parsePatches(patches);
    preRenderCommits();
  };

  J.numberOfCommits = function() {
    return HISTORY.length;
  };

  J.renderCommit = function(n) {
    if (READY) {
      setTimeout(function() {
        var commit = HISTORY[n];
        $("#screen").html(commit.rendered);
        $("#commitmsg").html(commit.message);
        $("#commithash").html(commit.commit);
        $("#date").html(commit.date);
        $("#author").html(commit.author);
        $("#linenumbers").height($("#screen").height());
      }, 0);
    }
  };

  // private //////////////////////////////////////////////////////////////////
  var HISTORY   = [];
  var SCREEN    = [];
  var MAX_LINES = 0;
  var READY     = false;

  var colourForAuthor = (function() {
    var authors = {};
    var nextColour = (function() {
      var counter = -1;
      var colours = ["#ffc", "#fcf", "#cff", "#ccf", "#cfc", "#fcc", "#cca", "#cac", "#acc", "#aac", "#aca", "#caa", "#aa8", "#a8a", "#8aa", "#88a", "#8a8", "#a88"];
      return function() {
        counter += 1;
        return colours[counter % colours.length];
      };
    })();
    return function(author) {
      author = author.replace(/ <.*>/,''); // don't show the email -- too long.
      if (! authors[author]) {
        authors[author] = nextColour();
        $("#sidebar").append("<li style='background-color:"+authors[author]+";'>"+author+"</li>");
      }
      return authors[author];
    };
  })();

  function preRenderCommits() {
    var current = -1;

    (function(){
      if(HISTORY.length-1 == current){
        var lineNumbers ='';
        for (var i=1; i<=MAX_LINES; i++) {
          lineNumbers += ("<li>"+i+"</li>");
        }
        READY = true;
        $("#linenumbers").html(lineNumbers);
        J.renderCommit(current);
      } else {
        current += 1;
        loadCommit(current);
        setTimeout(arguments.callee, 0);
      }
    })();
  };

  function loadCommit(n) {
    var commit = HISTORY[n];

    if (commit.patch) {
      var chunks = commit.patch.split(/^(?=@@ )/m).slice(1);
      $.each(chunks, function(i, chunk){
        applyChunk(commit, chunk);
      });
    }

    commit.rendered = SCREEN.join("");
    if (SCREEN.length > MAX_LINES) { MAX_LINES = SCREEN.length; }
  };

  function applyChunk(commit, chunk) {
    var lines = chunk.split(/\n/m);
    var header = lines[0];
    var pos;
    lines = lines.slice(1);

    if (parseInt(header.match(/\-\d*/)[0].substr(1),10) === 0) {
      SCREEN = []; // rewrite
    }
    pos = parseInt(header.match(/\+\d*/)[0].substr(1),10) - 1;
    if (pos < 0) { pos = 0; }
    var curr = 0;

    while (lines[curr]) {
      if (lines[curr][0]=="+") {
        SCREEN.splice(pos, 0, "<pre style='background-color:"+colourForAuthor(commit.author)+";'>"+(lines[curr].slice(1) || "&nbsp;")+"</pre>");
      } else if (lines[curr][0]=="-") {
        SCREEN.splice(pos, 1);
        pos -= 1;
      }
      curr += 1;
      pos += 1;
    }
  };

  function parsePatches(patches) {
    var textcommits = patches.split(/^(?=commit [0-9a-f]{40}$)/m);
    var commits = [];

    $.each(textcommits, function(i, tc) {
      commits[i] = {
        commit:  tc.match(/^commit .*$/m)[0].substr(7),
        author:  tc.match(/^Author: .*$/m)[0].substr(8),
        date:    tc.match(/^Date:   .*$/m)[0].substr(8),
        message: tc.split(/^$/m)[1].replace(/^    /mg,""),
        patch:   tc.split(/^\+\+\+ b\/.*$/m)[1]
      };
    });

    return commits;
  };

})(JSGIT);

$(function() {
  JSGIT.initialize($("#history").text());
  $("#nav").slider({
    max: JSGIT.numberOfCommits()-1,
    value: JSGIT.numberOfCommits()-1,
    slide: function(event, ui){
      JSGIT.renderCommit(ui.value);
    }
  });
});
