var JSGIT = {};

(function(J) {

  var colourCounter = -1;

  J.authors = {};
  J.initialize = function(patches) {
    J.authors = {};
    colourCount = -1;
    HISTORY = parsePatches(patches);
    preRenderCommits();

    $("#nav").slider({
        max:   JSGIT.numberOfCommits()-1,
        value: JSGIT.numberOfCommits()-1,
        change: function(event, ui){
          JSGIT.renderCommit(ui.value, true);
        },
        slide: function(event, ui){
          JSGIT.renderCommit(ui.value, false);
        }
      });

    $('#sidebar li :checkbox').live('change',function(){
      var el = $(this), 
        checked = el.attr('checked'), 
        authorName = el.val(),
        lineNumbers = $('#linenumbers li'),
        loc = $('.loc');

      if(checked){
        $('.loc[data-author='+authorName+']').show().each(function(i,e){
          var count = loc.index(e);
          lineNumbers.eq(count).show();
        });
      }else{
        $('.loc[data-author='+authorName+']').hide().each(function(i,e){
          var count = loc.index(e);
          lineNumbers.eq(count).hide();
        });
      }
    });
  };

  J.numberOfCommits = function() {
    return HISTORY.length;
  };

  J.renderCommit = function(n, force) {
    if (READY) {
      if (force || !BUSY) {
        setTimeout(function() {
          if (! force) { BUSY = true; }
          var startTime = new Date();
          var commit = HISTORY[n];
          $("#screen").html(commit.rendered);
          $("#commitmsg").html(commit.message);
          $("#commithash").html(commit.commit);
          $("#date").html(commit.date);
          $("#author").html(commit.author);
          $("#linenumbers").height($("#screen").height());
          if (! force) { setTimeout(function(){BUSY=false;}, new Date()-startTime); }
        }, 0);
      }
    }
    return HISTORY[n];
  };

  J.playback = function(timeout) {
    (function() {
      var val = $("#nav").slider('value');
      if (val < HISTORY.length) {
        $("#nav").slider('value', val+1);
        setTimeout(arguments.callee, timeout);
      }
    })();
  };

  // private //////////////////////////////////////////////////////////////////
  var HISTORY = [],
    SCREEN    = [],
    MAX_LINES = 0,
    READY     = false,
    BUSY      = false;

  var colourForAuthor = (function() {

    var nextColour = (function() {
      var colours = [
        "#ffc", "#fcf", "#cff", "#ccf", "#cfc", "#fcc",
        "#cca", "#cac", "#acc", "#aac", "#aca", "#caa",
        "#aa8", "#a8a", "#8aa", "#88a", "#8a8", "#a88"
      ];
      return function() {
        colourCounter += 1;
        return colours[colourCounter % colours.length];
      };
    })();
    return function(author) {
    var name = author,
     snakeAuthor = toSnakeCase(author);

      if (!J.authors[author]) {
        J.authors[author] = nextColour();
       
        $("#sidebar").append("<li style='background-color:"+J.authors[author]+";' data-email='"+snakeAuthor+"'><input checked type='checkbox' name='author' value='"+snakeAuthor+"' />"+author+"</li>");
      }
      return J.authors[author];
    };
  })();

  function toSnakeCase(s){
    return s.replace(/\s+$/gi,'').replace(/\s/gi,'_').replace(/<|>|&lt;|&gt;/gi,'');
  }

  function preRenderCommits() {
    var current = -1;

    (function(){
      if(HISTORY.length-1 == current){
        var lineNumbers ='';
        for (var i=1; i<MAX_LINES; i++) {
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
  }

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
  }

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
        SCREEN.splice(pos, 0, "<pre class='loc' data-author='"+toSnakeCase(commit.author)+"'style='background-color:"+colourForAuthor(commit.author)+";'>"+(lines[curr].slice(1) || "&nbsp;")+"</pre>");
      } else if (lines[curr][0]=="-") {
        SCREEN.splice(pos, 1);
        pos -= 1;
      }
      curr += 1;
      pos += 1;
    }
  }

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
  // toggle code when clicking on an Authors Name  
  JSGIT.initialize($("#history").text());
});
