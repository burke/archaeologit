var Search = Search || {};

(function(Search){
  var AUTHOR      = /[a-z]+\s[a-z]+/ig,
      SHA1        = /[a-z0-9]{40}/ig,
      SHA1_RANGE  = /[a-z0-9]{40}..[a-z0-9]{40}/ig;
  
  Search.extractSha1s = function(input){
    var result = [],
      ranges = input.match(SHA1_RANGE) || [];
   
    // Remove SHA1 Ranges from input
    input = input.replace(SHA1_RANGE,'');
   
    // add SHA1 ranges to result
    for(var i = 0,length = ranges.length; i < length; i++){
      var range = ranges[i].split('..');
      result = result.concat([range]);
    }
    
    // add non-range SHA1's if present
    sha1s = input.match(SHA1);

    if(sha1s) result = result.concat(sha1s);

    return result;
  };

  Search.extractAuthors = function(input){
    return input
            .replace(SHA1_RANGE)
            .replace(SHA1,'')
            .match(AUTHOR);
  };
  
  Search.parse = function(input){
 
    var result = {},
      author = Search.extractAuthors(input),
      sha1   = Search.extractSha1s(input);

    if(author)            result.author = author;
    if(sha1.length > 0)   result.sha1   = sha1;

    return result; 
  };

})(Search);
