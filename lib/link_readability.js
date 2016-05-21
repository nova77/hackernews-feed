var Readability = require('node-readability'),
    sanitizer = require("sanitizer"),
    async = require("async");
    // _           = require('underscore'),
    // request = require('request'),
    // util = require('util');


if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

function ReadableLinks(){
}

        // Readability(item.link, {
        //   headers: {
        //     "Pragma": "no-cache",
        //     "Accept-Language": "en-US,en;q=0.8",
        //     "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
        //     "Accept": "text/html;q=0.8"
        //   }
        // }, function(err, article, meta) {
        //   console.log(">>>> READ");


// // probably not necessary
// function stripHTML(html) {
//   var clean = sanitizer.sanitize(html, function (str) {
//       return str;
//   });
//   // Remove all remaining HTML tags.
//   clean = clean.replace(/<(?:.|\n)*?>/gm, "");

//   // RegEx to remove needless newlines and whitespace.
//   // See: http://stackoverflow.com/questions/816085/removing-redundant-line-breaks-with-regular-expressions
//   clean = clean.replace(/(?:(?:\r\n|\r|\n)\s*){2,}/ig, "\n");

//   // Return the final string, minus any leading/trailing whitespace.
//   return clean.trim();
// }

ReadableLinks.parse = function(items, callback) {
  //var resultItems = [];
  //console.log("###### ITEMS CALL: " + items.length);

  async.map(items, function(item, doneCallback) {

    console.log(">>> LINK: " + item.link);

    // parsed before
    redis.get(item.link, function(err, reply) {
      if (reply) {
        console.log(">>>> CACHED: " + item.link);
        var cachedItem = JSON.parse(reply);
        doneCallback(null, cachedItem);
        // resultItems.push(cachedItem);
        // finish();
      } else {
        // Let the Readability get the readable content
        Readability(item.link, function(err, article, meta) {
          console.log(">>>> READ: " + item.link);
          console.log("   > DESCRIPTION: " + item.description);

          if (err) {
            console.error("Readability error (" + item.link + "): " + err);
            doneCallback(null, item);
            return;
          }

          if (article.content) {
            original_link = item.description;
            item.description = article.content;
             // Add "Comments URL: .." back.
            item.description += "<p>" + original_link + "</p>";
          }

          // console.log('CONTENT: ' + article.content);
          // console.log('HTML: ' + article.html);

          article.close();

          // cache the result
          redis.set(item.link, JSON.stringify(item));

          // push to result
          //resultItems.push(item);
          doneCallback(null, item);
        });
      }
    });
  }, function(err, results) {
    results = results.filter(function (value) {
      return value !== null;
    });

    console.log("Got here");
    console.log("results: " + results);
    //console.log(JSON.stringify(resultItems));

    callback(results);
    // all urls is finished parse
    //callback(resultItems);
  });   

  //   // parsed before
  //   redis.get(item.link, function(err, reply) {
  //     if (reply) {
  //       var cacheLink = JSON.parse(reply);
  //       callback(cacheLink);
  //     } else {
  //       // Let the Readability get the readable content
  //       Readability(item.link, {
  //         headers: {
  //           "Pragma": "no-cache",
  //           "Accept-Language": "en-US,en;q=0.8",
  //           "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
  //           "Accept": "text/html;q=0.8"
  //         }
  //       }, function(err, article, meta) {
  //         if(err) {
  //           console.error("Readability error (" + item.link + "): " + err);
  //           return;
  //         }

  //         link.html = article.html;
  //         link.title = article.title;
  //         link.updated_at = new Date().toString();

  //         // cache the result
  //         redis.set(item.link, JSON.stringify(link));

  //         // push to result
  //         callback(link);
  //       });
  //     }
  //   }, function(err, results){
  //   // all urls is finished parse
  //   callback(resultLinks);
  // });
};


// /**
//  * attach readable text and html to links
//  */
// ReadableLinks.parse = function(links, callback){
//   var resultLinks = [];

//   async.map(links, function(link, finish){

//     // parsed before
//     redis.get(link.url, function(err, reply){
//       if(reply){
//         var cacheLink = JSON.parse(reply);

//         resultLinks.push(cacheLink);

//         finish();

//       } else {

//         // Let the Readability get the readable content
//         Readability(link.url, {
//             headers: {
//               "Pragma": "no-cache",
//               "Accept-Language": "en-US,en;q=0.8",
//               "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
//               "Accept": "text/html;q=0.8"
//             }
//           }, function(err, article, meta){

//           if(err) {
//             console.error("Readability error (" + link.url + "): " + err);
//             return finish();
//           }

//           link.html = article.html;
//           link.title = article.title;
//           link.updated_at = new Date().toString();

//           // cache the result
//           redis.set(link.url, JSON.stringify(link));

//           // push to result
//           resultLinks.push(link);

//           // trigger finish
//           finish();
//         });
//       }
//     });

//   },function(err, results){
//     // all urls is finished parse
//     callback(resultLinks);
//   });

// };


exports.ReadableLinks = ReadableLinks;

