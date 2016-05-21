var express = require("express"),
    app = express(),
    RssGenerator = require("./lib/rss_generator").RssGenerator,
    EventEmitter = require('events');

app.use(express.logger());

require('console-stamp')(console, 'HH:MM:ss.l');

/* Redirects can cause lots of callbacks to be registered
   however, I am not going to delve into the Readability & request modules to fix that now */
EventEmitter.defaultMaxListeners = 100;

app.get('/', function(req, res) {
  var rss = new RssGenerator();

  rss.feeds(function(feeds, err){
    res.charset = 'UTF-8';
    if (err) {
      console.error("Feed error: " + err);
      res.send(500, "Could not retrieve feed: " + err);
    } else {
      res.header('Content-Type', 'text/xml');
      res.header('Last-Modified', new Date().toString());
      res.header('Cache-Control', 'no-cache');
      res.send(feeds);
    }
  });
});

var port = process.env.PORT || 5500;
app.listen(port, function() {
  console.log("Listening on " + port);
});
