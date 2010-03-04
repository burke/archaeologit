var JSGIT = {};

(function(J) {

  J.HISTORY = [];
  J.SCREEN = [];
  J.MAX_LINES = 0;
  J.READY = false;

  J.colourForAuthor = (function() {
    var colours = ["#aa8", "#a8a", "#8aa", "#88a", "#8a8", "#a88", "#cca", "#cac", "#acc", "#aac", "#aca", "#caa", "#ffc", "#fcf", "#cff", "#ccf", "#cfc", "#fcc"];
    var authors = {};
    return function(author) {
      if (! authors[author]) {
        authors[author] = colours.pop() || '#eee';
        $("#sidebar").append("<li style='background-color:"+authors[author]+";'>"+author+"</li>");
      }
      return authors[author];
    };
  })();

  J.loadHistory = function(patches) {
    J.HISTORY = J.parsePatches(patches);
    J.preRenderCommits();
  };

  J.preRenderCommits = function() {
    var current = -1;

    (function(){
      if(J.HISTORY.length-1 == current){
        var lineNumbers ='';
        for (var i=1; i<=J.MAX_LINES; i++) {
          lineNumbers += ("<li>"+i+"</li>");
        }
        J.READY = true;
        $("#linenumbers").html(lineNumbers);
        J.renderCommit(current);
      } else {
        current += 1;
        J.loadCommit(current);
        setTimeout(arguments.callee,0);
      }
    })();
  };

  J.renderCommit = function(n) {
    if (J.READY) {
      setTimeout(function() {
        var commit = J.HISTORY[n];
        $("#screen").html(commit.rendered);
        $("#commitmsg").html(commit.message);
        $("#commithash").html(commit.commit);
        $("#date").html(commit.date);
        $("#author").html(commit.author);
        $("#linenumbers").height($("#screen").height());
      }, 0);
    }
  };

  J.loadCommit = function(n) {
    var commit = J.HISTORY[n];

    if (commit.patch) {
      var chunks = commit.patch.split(/^(?=@@ )/m).slice(1);
      $.each(chunks, function(i, chunk){
        J.applyChunk(commit, chunk);
      });
    }

    commit.rendered = J.SCREEN.join("");
    if (J.SCREEN.length > J.MAX_LINES) { J.MAX_LINES = J.SCREEN.length; }
  };

  J.applyChunk = function(commit, chunk) {

    var lines = chunk.split(/\n/m);
    var header = lines[0];
    var pos;
    var content;
    lines = lines.slice(1);

    if (parseInt(header.match(/\-\d*/)[0].substr(1),10) === 0) {
      J.SCREEN = []; // rewrite
    }
    pos = parseInt(header.match(/\+\d*/)[0].substr(1),10) - 1;
    if (pos < 0) { pos = 0; }
    var curr = 0;

    while (lines[curr]) {
      if (lines[curr][0]=="+") {
        content = lines[curr].slice(1) || "&nbsp;";
        J.SCREEN.splice(pos, 0, "<pre style='background-color:"+J.colourForAuthor(commit.author)+";'>"+content+"</pre>");
        pos += 1;
      } else if (lines[curr][0]=="-") {
        J.SCREEN.splice(pos, 1);
      } else {
        pos += 1;
      }
      curr += 1;
    }
  };

  J.parsePatches = function(patches) {
    var textcommits = patches.split(/^(?=commit [0-9a-f]{40}$)/m);
    var commits = [];

    $.each(textcommits, function(i, tc) {
      commits[i] = {
        commit:  tc.match(/^commit .*$/m)[0].substr(7),
        author:  tc.match(/^Author: .*$/m)[0].substr(8),
        date:    tc.match(/^Date:   .*$/m)[0].substr(8),
        message: tc.split(/^$/m)[1].replace(/^    /mg,""),
        patch:   tc.split(/^\+\+\+ b\/.*$/m).slice(1).join('')
      };
    });

    return commits;
  };

})(JSGIT);

$(function() {
  JSGIT.loadHistory($("#history").text());
  $("#nav").slider({
    max: JSGIT.HISTORY.length-1,
    value: JSGIT.HISTORY.length-1,
    slide: function(event, ui){
      JSGIT.renderCommit(ui.value);
    }
  });
});
