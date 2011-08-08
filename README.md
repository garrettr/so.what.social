README
------

This is a public feed aggregator. 

**Check out the [DEMO]**


Supported platforms:

1.  Facebook Pages
    Provide the link to a Page's RSS feed. You can find this by
        a) logging into Facebook
        b) go to the page - in the left column, choose "Subscribe via RSS" and copy the resulting URL.
2.  RSS/Atom feeds
    Provide the link to the feed.
3.  Twitter
    Just provide the Twitter screenname. We use Twitter's REST API instead of YQL due to Twitter's [recent discontinuation of RSS].

The key option is feeds. Pass a JSON list, where each object has 3 fields:

1.  title: Pick a descriptive title
2.  type: Options are 'rss', 'facebook', or 'twitter'
3.  id: The *full URL* or an RSS/Atom feed, or a Twitter screenname

Example:

## 10-second setup

1.  Include JQuery, jquery.jsonp, and so.what.social somewhere in `<head>...</head>`

        <script src="http://ajax.googleapis.com/ajax/libs/jquery/1.6.2/jquery.min.js" type="text/javascript"></script>
        <script src="jquery.jsonp-2.1.4.js" type="text/javascript"></script>
        <script src="so.what.social.js" type="text/javascript"></script>

2.  Include an empty div somewhere in `<body></body>` that will be filled in by so.what.social
    It's nice to include some kind of "loading" animation so your users aren't *too* shocked when the plugin loads.
    
        <body>
        ...
        <div id="activityFeed">
            <img id="loading" src="ajax-loading.gif" />
        </div>
        ...
        </body>

3.  Call so.what.social and pass feeds to it, along with any options. This goes in `<head>...</head>`

        <script type="text/javascript">
            $(document).ready(function() {
                $("#activityFeed").soWhatSocial({
                    "feeds": [
                        {
                            "title": "Some awesome RSS or Atom feed",
                            "type": "rss",
                            "id": "https://blog.honestappalachia.org/feed/"
                        },
                        {
                            "title": "My favorite Twitter",
                            "type": "twitter",
                            "id": "rampswv"
                        },
                        {
                            "title": "Sweet Facebook, bro",
                            "type": "facebook",
                            "id": "http://www.facebook.com/feeds/page.php?id=135221739823874&format=rss20"
                        }
                    ],
                });
            });
        </script>

## TODO

1.  Better error handling.
    Error - sometimes YQL returns null. This crashes the immediate function, FINISHED++ is never called.
    There's a better way.
2.  I added `<a>` tags to the post <li>'s, giving them links back to the original asset (Tweet, Facebook page, etc). Problem: now the links created by linkify(), for example from a tweet, don't work. They appear to be overriden by the outer <li> link.
3.  Minor bug: If a link in text isn't surrouned by spaces, extraneous text (like ...) will be included in
    the link, sometimes breaking it.

## TO-DONE

1.  Incorporate more settings for easy customization without digging into the code.
    Ideas:
    1.  URLs for feed-type icons. Perhaps a dictionary that matches with "type"
    2.  Number of posts to show (total)
    3.  Max. posts from any source
2.  Make the grey link boxes clickable - should take you to the original asset.
    Depends on original resource type, will have to build a URL (see earlier URL work in feedeater,
    esp. for Twitter).
3.  The building of the <li> text (POST_ARRAY[COUNT][0]) is awkward and repetitive. Better way?
    Wrote build_li function

## Notes about backend technology

The Twitter API is working flawlessly. YQL, on the other hand, has some problems. In no particular order,

1.  Sometimes `SELECT * FROM xml WHERE url="wevs"` returns null for no reason. Refreshing the page once or
    twice makes the request go through. At the moment this code will just ignore that particular feed if
    something like this happens. 
2.  Neither limit nor xml(x) appears to work to limit the number of responses from a query. I've tried
    various things in the [YQL console], all with no success. This directly contradicts the [YQL Paging and Table Limits documentation].
3.  The [developer forums], which is where Yahoo! says you should bring bugs and questions, are a
    wasteland.

After some messing around, `select * from xml` seems old and busted; `select * from feed` is the new
hotness.

## Credit

My work on this plugin was inspired by John Patrick Given's excellent [So So Social Plugin]. The license
will be determined once I hear back from him.

[DEMO]: http://so.what.social-demo.s3-website-us-east-1.amazonaws.com/
[So So Social Plugin]: http://johnpatrickgiven.com/jquery/soSoSocial/
[YQL console]: http://developer.yahoo.com/yql/console/
[YQL Paging and Table Limits documentation]: http://developer.yahoo.com/yql/guide/paging.html
[developer forums]: http://developer.yahoo.com/forum/YQL/
