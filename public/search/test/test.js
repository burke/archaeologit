module("init");

test("search object is present",function(){
  expect(1);
  ok(Search);
});

module("extractions");


test("extract author",function(){
  var expected = ["Stefan Penner"],
  result = Search.extractAuthors("Stefan Penner")
  same(result,expected);
});

test("extract author but not sha1",function(){
  var expected = ["Stefan Penner"],
  result = Search.extractAuthors("931d09f8fe662ebd7c2b31a093b85b041ade101d Stefan Penner")
  same(result,expected);
});

test("Extract sha1",function(){
  var expected = ["931d09f8fe662ebd7c2b31a093b85b041ade101d"],
    result = Search.extractSha1s("931d09f8fe662ebd7c2b31a093b85b041ade101d");
  same(result,expected);
});

test("Extract sha1 but not author",function(){
  var expected = ["931d09f8fe662ebd7c2b31a093b85b041ade101d"],
    result = Search.extractSha1s("931d09f8fe662ebd7c2b31a093b85b041ade101d stefan penner");
  same(result,expected);
});

module("Parse input");

test("parse is present",function(){
  expect(1);
  ok(Search.parse);
});

test("with only author",function(){
  expect(1);
  var expected = {author:["Stefan Penner"]},
    result = Search.parse("Stefan Penner");
  same(result,expected);
});

test("with only sha1",function(){
  expect(1);
  var expected = {sha1:["931d09f8fe662ebd7c2b31a093b85b041ade101d"]},
    result = Search.parse("931d09f8fe662ebd7c2b31a093b85b041ade101d");
  same(result,expected);
});

test("with sha1 range",function(){
  expect(1);
  var expected = {sha1:[["931d09f8fe662ebd7c2b31a093b85b041ade101d","d0392b076f5e9604239c3386a53de950d7d50328"]]},
    result = Search.parse("931d09f8fe662ebd7c2b31a093b85b041ade101d..d0392b076f5e9604239c3386a53de950d7d50328");
  same(result,expected);

});

test("with sha1 and name",function(){
  expect(1);
  var expected = {
      sha1:   ["931d09f8fe662ebd7c2b31a093b85b041ade101d"],
      author: ["Stefan Penner"]
    },
    result = Search.parse("931d09f8fe662ebd7c2b31a093b85b041ade101d Stefan Penner");
  same(result,expected);
});

test("with name and sha1",function(){
  expect(1);
  var expected = {
      sha1:   ["931d09f8fe662ebd7c2b31a093b85b041ade101d"],
      author: ["Stefan Penner"]
    },
    result = Search.parse("Stefan Penner 931d09f8fe662ebd7c2b31a093b85b041ade101d");
  same(result,expected);
});

test("with multiple name's and sha1's",function(){
  expect(2);
  var expected = {
      author: ['Burke Libbey','Stefan Penner'],
      sha1:   ['d0392b076f5e9604239c3386a53de950d7d50328','931d09f8fe662ebd7c2b31a093b8Ab041ade101d']
    },
    result = Search.parse("Burke Libbey d0392b076f5e9604239c3386a53de950d7d50328 Stefan Penner 931d09f8fe662ebd7c2b31a093b85b041ade101d");

  same(result.author,expected.author);
  same(result.sha1,expected.sha1);
});
