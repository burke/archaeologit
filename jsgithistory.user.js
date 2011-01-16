// ==UserScript==
// @name          JSGitHistory
// @namespace     http://burkelibbey.org
// @description   PURE AWESOME
// @version       1.0.6
// @include       https://github.com/*/blob/*
// @include       http://github.com/*/blob/*
// ==/UserScript==

function addJQuery(callback) {
  var script = document.createElement("script");
  script.setAttribute("src", "http://ajax.googleapis.com/ajax/libs/jquery/1.4.2/jquery.min.js");
  script.addEventListener('load', function() {
    var script = document.createElement("script");
    script.textContent = "(" + callback.toString() + ")();";
    document.body.appendChild(script);
  }, false);
  document.body.appendChild(script);
}

function main() {
  $(".file .actions").prepend('<li><a class="jsgithistory-link" href="#">jsgithistory</a></li>');
  $(".jsgithistory-link").click(function() {
    var path = location.pathname;
    $(".data").html('<iframe width="100%" height="500px" src="http://localhost:4000'+path+'"></iframe>');
    return false;
  });
}

addJQuery(main);
