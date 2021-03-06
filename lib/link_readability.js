var Readability = require('node-readability'),
    async = require("async"),
    redisExpireSecs = 172800,  // expire in 2 days
    hackerNewsUrl = "news.ycombinator.com",
    gitHubUrl = "github.com",
    youTubeUrl = "www.youtube.com";

if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

function ReadableLinks() {}

ReadableLinks.parse = function(items, callback) {
  async.map(items, function(item, doneCallback) {
    if (item.link.indexOf(hackerNewsUrl) > -1) {
      // It's Ask HN, no need to do readability.
      console.log("ASKHN: " + item.link);
      doneCallback(null, item);
      return; 
    } else if (item.link.indexOf(youTubeUrl) > -1) {
      // It's Ask HN, no need to do readability.
      console.log("YOUTUBE: " + item.link);
      doneCallback(null, item);
      return;
    } else if (item.link.endsWith(".pdf")) {
      // It's Ask HN, no need to do readability.
      console.log("PDF: " + item.link);
      doneCallback(null, item);
      return;
      // TODO: GitHub, focus on the readme.
    } else if (item.link.indexOf(gitHubUrl) > -1) {
      // TODO: GitHub, focus on the readme.
    }

    // Parsed before.
    redis.get(item.link, function(err, reply) {
      if (reply) {
        console.log("CACHED: " + item.link);
        var cachedItem = JSON.parse(reply);
        doneCallback(null, cachedItem);
      } else {
        console.log("READING: " + item.link);

        // Let the Readability get the readable content.
        Readability(item.link, {
            maxRedirects: 100,
            headers: {
              "Pragma": "no-cache",
              "Accept-Language": "en-US,en;q=0.8",
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
              "Accept": "text/html;q=0.8"
            }
          }, function(err, article, meta) {

          if (err) {
            console.error("Readability error (" + item.link + "): " + err);
            doneCallback(null, item);  // Just return as it is.
            return;
          }

          if (article.content) {
            original_link = item.description;
            item.description = article.content;
             // Add "Comments URL: .." back.
            item.description += "<p>" + original_link + "</p>";
          }

          article.close();

          // cache the result
          redis.setex(item.link, redisExpireSecs, JSON.stringify(item));

          // push to result
          doneCallback(null, item);
        });
      }
    });
  }, function(err, results) {
    results = results.filter(function (value) {
      return value !== null;
    });

    // All urls are parsed.
    callback(results);
  });   
};

exports.ReadableLinks = ReadableLinks;
