var JSGIT = {};

(function(J) {

  J.HISTORY = [];
  J.currentCommit = -1;

  J.SCREEN = [];

  J.REWRITE_SAVEPOINTS = [];

  J.UP = 1;
  J.DOWN = -1;

  J.colourForAuthor = (function() {
    var colours = ["#cca", "#cac", "#acc", "#aac", "#aca", "#caa", "#ffc", "#fcf", "#cff", "#ccf", "#cfc", "#fcc"];
    var authors = {};
    return function(author) {
      if (! authors[author]) {
        authors[author] = colours.pop();
        $("#sidebar").append("<li style='background-color:"+authors[author]+";'>"+author+"</li>");
      }
      return authors[author];
    };
  })();

  J.renderHistory = function(patches) {
    J.HISTORY = J.parsePatches(patches);
    J.renderCommit(J.HISTORY.length-1);
  };

  J.renderCommit = function(n) {
    while (n != J.currentCommit) {
      if (n < J.currentCommit) {
        J.renderDown();
      } else {
        J.renderUp();
      }
    }
  };

  J.renderUp = function() {
    var prevCommit = J.currentCommit;
    J.currentCommit += 1;
    J.modifyScreen(J.UP, J.HISTORY[J.currentCommit]);
  };

  J.renderDown = function() {
    var prevCommit = J.currentCommit;
    J.currentCommit -= 1;
    J.modifyScreen(J.DOWN, J.HISTORY[J.currentCommit]);
  };

  J.modifyScreen = function(direction, commit) {
    if (!commit.patch) { return; } // If no patch is given, we can kind of just ignore this.
    $("#commitmsg").html(commit.message);
    $("#commithash").html(commit.commit);
    $("#date").html(commit.date);
    $("#author").html(commit.author);
    var chunks = commit.patch.split(/^(?=@@ )/m).slice(1);

    $.each(chunks, function(i, chunk){J.applyChunk(direction, chunk, commit.author);});
  };

  J.applyChunk = function(direction, chunk, author) {
    var lines = chunk.split(/\n/m);
    var header = lines[0];
    var start;
    lines = lines.slice(1);

    if (direction == J.UP) {
      J.REWRITE_SAVEPOINTS[J.currentCommit-1] = J.SCREEN.slice(0);
      if (parseInt(header.match(/\-\d*/)[0].substr(1)) == 0) {
        J.SCREEN = []; // rewrite
      }
      start = parseInt(header.match(/\+\d*/)[0].substr(1)) - 1;
      if (start < 0) { start = 0; }
      var curr = 0;
      var real = 0;

      while (lines[curr]) {
        if (lines[curr][0]=="+") {
          J.SCREEN.splice(start+real, 0, "<pre style='background-color:"+J.colourForAuthor(author)+";'>"+lines[curr].slice(1)+"</pre>");
          real += 1;
        } else if (lines[curr][0]=="-") {
          J.SCREEN.splice(start+real, 1);
        } else {
          // skip!
          real += 1;
        }
        curr += 1;
      }
    } else { // J.DOWN
      J.SCREEN = J.REWRITE_SAVEPOINTS[J.currentCommit];
    }
    $("#screen").html(J.SCREEN.join("<br/>"));
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
        patch:   tc.split(/^\+\+\+ b\/.*$/m)[1]
      };

    });
    return commits.reverse();
  };

})(JSGIT);

$(function() {
  JSGIT.renderHistory($("#history").text());
  $("#nav").slider({
    max: JSGIT.HISTORY.length-1,
    value: JSGIT.HISTORY.length-1,
    slide: function(event, ui){
      JSGIT.renderCommit(ui.value);
    }
  });
  JSGIT.renderCommit(0);
});