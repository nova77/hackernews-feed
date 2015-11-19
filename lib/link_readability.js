var Readability = require('node-readability'),
    _           = require('underscore'),
    async       = require("async"),
    request = require('request'),
    util = require('util');


if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}


function ReadableLinks(){
}

/**
 * attach readable text and html to links
 */
ReadableLinks.parse = function(links, callback){
  var resultLinks = [];

  async.map(links, function(link, finish){

    // parsed before
    redis.get(link.url, function(err, reply){
      if(reply){
        var cacheLink = JSON.parse(reply);

        resultLinks.push(cacheLink);

        finish();

      } else {

        // Let the Readability get the readable content
        Readability(link.url, {
            headers: {
              "Pragma": "no-cache",
              "Accept-Language": "en-US,en;q=0.8",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
              "Accept": "text/html;q=0.8"
            }
          }, function(err, article, meta){

          if(err) {
            console.error("Readability error (" + link.url + "): " + err);
            return finish();
          }

          link.html = article.html;
          link.title = article.title;
          link.updated_at = new Date().toString();

          // cache the result
          redis.set(link.url, JSON.stringify(link));

          // push to result
          resultLinks.push(link);

          // trigger finish
          finish();
        });
      }
    });

  },function(err, results){
    // all urls is finished parse
    callback(resultLinks);
  });

};


exports.ReadableLinks = ReadableLinks;

