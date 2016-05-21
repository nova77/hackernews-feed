var RSS = require("rss"),
    LinkReadability = require("../lib/link_readability").ReadableLinks,
    FeedParser = require('feedparser'),
    Request = require('request'),
    hacker_news_rss_url = "http://hnrss.org/newest?points=30";

function RssGenerator() {}

RssGenerator.prototype.links = function(callback) {
  var req = Request(hacker_news_rss_url),
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
    LinkReadability.parse(items, function(resultItems) {
      callback(null, resultItems);
    });
  });
    
  req.end();
}

RssGenerator.prototype.feeds = function(callback) {
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

    for (i=0; i < resultItems.length; ++i) {
      item = resultItems[i];

      // I cannot just place the item as it is because url != link.
      feed.item({
        title: item.title,
        description: item.description,
        url: item.link,
        author: item.author,
        date: item.date
      });
    };

    callback(feed.xml());
  });
}

exports.RssGenerator = RssGenerator;
