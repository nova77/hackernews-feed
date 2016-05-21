// var FeedParser = require('feedparser'),
//     request = require('request'),
//     cheerio = require('cheerio'),
//     hacker_news_rss_url = "http://hnrss.org/newest?points=30";


// /**
//  * RSS Parser parse the first page of hacker news
//  */
// function PageParser(){
// }

// /**
//  * getLinks of the first page
//  */
// PageParser.prototype.getLinks = function(callback){

//   request(hacker_news_rss_url, function (error, response, body) {
//     feedparser = new FeedParser();

    
//   }


//   req.setMaxListeners(50);
//   // Some feeds do not respond without user-agent and accept headers.
//   req.setHeader('user-agent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/31.0.1650.63 Safari/537.36');
//   req.setHeader('accept', 'text/html,application/xhtml+xml');

//   var feedparser = new FeedParser();
//   req.on('error', done);

//   // make a request to get the body of hackernews page
//   request(hacker_news_url, function (error, response, body) {
//     var $, links, link;

//     if (!error && response.statusCode == 200) {
//       // get the body
//       $ = cheerio.load(body);

//       // query the links
//       links = $('td.title a').filter(function(i, el) {
//         return el.attribs.href.indexOf('http') == 0;
//       }).map(function(i, el){
//         return { title:el.children[0] ? el.children[0].data : "", url:el.attribs.href};
//       });

//       // trigger callback
//       callback(links);
//     } else {
//       callback(null, 'Error retrieving links (' + response.statusCode + '): ' + error);
//     }
//   })
// }


// // exports
// exports.PageParser = PageParser;
