var RSS = require("rss"),
    LinkReadability = require("../lib/link_readability").ReadableLinks,
    FeedParser = require('feedparser'),
    request = require('request'),
    hacker_news_rss_url = "http://hnrss.org/newest?points=30";
    // PageParser = require("../lib/page_parser").PageParser,
    // os = require("os"),
    // hostName = os.hostname();

function RssGenerator(){}

RssGenerator.prototype.links = function(callback){

  var req = request(hacker_news_rss_url),
      feedparser = new FeedParser();

  req.on('error', function (error){
    return callback(error, null);
  });

  req.on('response', function (res){
    var stream = this;
    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
    stream.pipe(feedparser);
  });

  feedparser.on('error', function(error){
    return callback(error, null);
  });

  var items = [];
  feedparser.on('readable', function() {
    var stream = this,
        meta = this.meta,
        item;

    while (item = stream.read()) {
      items.push(item);
    }
  });

  feedparser.on('end', function(err) {
    // //console.log('Got article: %s', item.title || item.description);
    LinkReadability.parse(items, function(resultItems) {
      callback(null, resultItems);
    });
  });
    
  req.end();

  // var page_parser = new PageParser();
  // page_parser.getLinks(function(links, err){
  //   if (err) { return callback(null, err); }
  //   LinkReadability.parse(links, function(resultLinks){
  //     callback(resultLinks);
  //   });
  // });
}


RssGenerator.prototype.feeds = function(callback){
  var i,
      feed = new RSS({
        title: 'Hacker News Front Page',
        description: 'Hacker news front page',
        feed_url: hacker_news_rss_url,
        site_url: "https://news.ycombinator.com",
        author: 'hacker news'
      });


  this.links(function(err, resultItems) {
    if (err) {
      return;
    }

    // for (item in resultItems) {
    //   feed.item({
    //     title: item.title,
    //     description: item.description,
    //     url: item.link,
    //     author: item.author,
    //     date: item.date
    //   });

    //   //feed.item(item);
    // }

    for (i=0; i < resultItems.length; i++) {
      feed.item(resultItems[i])
      // link = resultLinks[i];

      // feed.item({
      //   title:  link.title,
      //   description: link.html,
      //   url: link.url,
      //   author: link.author,
      //   date: link.updated_at
      // });
    };

    callback(feed.xml());

  });

  // this.links(function(resultLinks){

  //   for (i=0; i < resultLinks.length; i++) {
  //     link = resultLinks[i];

  //     feed.item({
  //       title:  link.title,
  //       description: link.html,
  //       url: link.url,
  //       author: link.author,
  //       date: link.updated_at
  //     });
  //   };

  //   callback(feed.xml());

  // });

}

exports.RssGenerator = RssGenerator;
