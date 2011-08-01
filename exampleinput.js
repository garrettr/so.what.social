var jsonFeeds =
{
    "feeds":
        [
        { "title": "Ramps", "type": "twitter", "id": "RAMPSWV" },
        { "title": "Appalachia Rising", "type": "facebook", "id": "http://www.facebook.com/feeds/page.php?id=135221739823874&format=rss20" },
        { "title": "Honest Appalachia", "type": "rss/atom", "id": "https://blog.honestappalachia.org/feed/" }
    ],
        "errors": false
};

/* from eloquent javascript */
function forEach(array, action) {
    for(var i=0; i < array.length; i++)
        action(array[i]);
}

/* debugging JSON 
   document.write("<ol>");
   forEach(jsonFeeds.feeds, function(feed) {
   document.write("<li>" + feed.title + ", " + feed.type + ": " + feed.id + "</li>");
   });
   document.write("</ol>");
   */

var sws = {};
sws.POST_ARRAY = new Array();
sws.CONTAINER = null;
sws.COUNT = 0;
sws.FINISHED = 0;
sws.TOTAL = 0;

/* jquery plugin authoring: http://docs.jquery.com/Plugins/Authoring */
(function($) {
    $.fn.soWhatSocial = function(callback) {

        sws.CONTAINER = $(this);
        sws.TOTAL = jsonFeeds.feeds.length;

        forEach(jsonFeeds.feeds, function(feed) {
            /* process the feed, adding its output to POST_ARRAY */
            if( feed.type == "twitter") {
                /* ajaxGet("http://api.twitter.com/1/statuses/user_timeline.json?screen_name="+feed.id+"&trim_user=true", twitterSuccess );*/
                tryTwitter(feed.id);
            } else {
                // use YQL to handle RSS/Atom (including Facebook right now)
                $.getJSON("http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22"+encodeURIComponent(feed.id)+"%22&format=json&callback=?", function(d) {
                    if (d.query.results.rss) {
                        $(d.query.results.rss.channel.item).each(function () {
                            var title = this.title;
                            var link = this.link;
                            var description = this.description;
                            var pubDate = this.pubDate;
                            var pubDate = pubDate.replace(/\,/g,'');    // removes comma after weekday
                            console.log(pubDate);

                            // append to div
                            sws.POST_ARRAY[sws.COUNT] = new Array();
                            // domain specific icon code here?
                            sws.POST_ARRAY[sws.COUNT][0] = "<li><p><strong>"+feed.title+'</strong><img class="logo" src="rss_21.png" /></p>'+linkify(get_words(title,50));
                            sws.POST_ARRAY[sws.COUNT][1] = relative_time(pubDate);
                            sws.POST_ARRAY[sws.COUNT][2] = get_delta(pubDate);
                            sws.COUNT++;
                        });
                    }
                    sws.FINISHED++;
                });
                //tryYQLFeed(feed.id);
            }
        });

        /* what's all this about? */
        print_array($(this));

        if (typeof callback == 'function') { // make sure the callback is a function
            callback.call(this); // brings the scope to the callback
        }
    }
})(jQuery);

function tryTwitter(id) {
    $.jsonp({
        "url": "http://api.twitter.com/1/statuses/user_timeline.json?screen_name="+id+"&trim_user=true&callback=?",
        "cache": true,
        "success": function(d) {
            $(d).each(function () {
                var tweet = this.text;
                var pubDate = this.created_at;
                console.log(pubDate);

                sws.POST_ARRAY[sws.COUNT] = new Array();
                sws.POST_ARRAY[sws.COUNT][0] = "<li><p><strong>"+id+'</strong><img class="logo" src="twitter_21.png" /></p>'+linkify(get_words(tweet,50));
                sws.POST_ARRAY[sws.COUNT][1] = relative_twitter_time(pubDate);
                sws.POST_ARRAY[sws.COUNT][2] = get_twitter_delta(pubDate);
                sws.COUNT++;
                console.log(this.text);
            });
        },
        "error": function(d, msg) {
            console.log("ERROR Could not load resource: Twitter, "+id);
        }
    });
    sws.FINISHED++;
}

function tryYQLFeed(id) {
    $.jsonp({
        "url": "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D%22"+encodeURIComponent(id)+"%22&format=json",
        "success": function(d) {
            if (d.query.results.rss) {
                $(d.query.results.rss.channel.item).each(function () {
                    var title = this.title;
                    var link = this.link;
                    var description = this.description;
                    var pubDate = this.pubDate;
                    var pubDate = pubDate.replace(/\,/g,'');    /* removes comma after weekday */

                    /* append to div */
                    sws.POST_ARRAY[sws.COUNT] = new Array();
                    /* domain specific icon code here? */
                    sws.POST_ARRAY[sws.COUNT][0] = "<li>Title: " + title + ", Link: " + link + ", Description: " + description + "</li>";
                    sws.POST_ARRAY[sws.COUNT][1] = relative_time(pubDate);
                    sws.POST_ARRAY[sws.COUNT][2] = get_delta(pubDate);
                    sws.COUNT++;
                });
            }
        },
        "error": function(d, msg) {
            console.log("ERROR Could not load resource: YQLFeed, "+id);
        }
    });
    sws.FINISHED++;
}

// Print the array! 
function print_array(obj) {
    //console.log("Finished: "+sws.FINISHED);
    //console.log("Total: "+sws.TOTAL);
    if(sws.FINISHED == sws.TOTAL) { 
        sws.CONTAINER.html("");
        sws.POST_ARRAY.sort(by(2,1));
        var html = '<ol>';
        for (j = 0; j < sws.COUNT; j++) {
            html += sws.POST_ARRAY[j][0] + '<br />(' + sws.POST_ARRAY[j][1] + ')</li>';
        }
        html += '</ol>';
        sws.CONTAINER.hide().append(html).fadeIn();
    } else {
        setTimeout("print_array()", 1000);
    }
}

function get_words(text, number) {
    // return the first number words of text
    var words = text.split(" ");

    // if we're asking for more words than there are, just return what we have
    if( words.length <= number ) {
        return text;
    }

    var tmp = [];
    for(i = 0; i<number; i++) {
        tmp.push(words[i]);
    }
    return tmp.join(" ")+"...";
}

function linkify(text) {
    // convert anythin starting with http://, https:// or www. to <a></a>
    var chunks = text.split(" ");
    for(i=0; i<chunks.length; i++) {
        var colon_split = chunks[i].split(":");
        var period_split = chunks[i].split(".");
        if( colon_split[0] == "http" || colon_split[0] == "https" || period_split == "www" ) {
            // add a link around it
            chunks[i] = '<a href="'+chunks[i]+'">'+chunks[i]+'</a>';
        }
    }
    return chunks.join(" ");
}

// pubDate delta function
function get_delta(time_value) {
    var values = time_value.split(" ");
    time_value = values[2] + " " + values[1] + ", " + values[3] + " " + values[4];
    var parsed_date = Date.parse(time_value);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
    if (values[5] == "+0000") {
        delta = delta + (relative_to.getTimezoneOffset() * 60);
    } else {
        delta = delta + relative_to.getTimezoneOffset();
    }

    return delta;
}

function get_twitter_delta(time_value) {
    var values = time_value.split(" ");
    // FORMAT for Date.parse: Jul 31 2011 17:00:00
    time_value = values[1] + " " + values[2] + ", " + values[5] + " " + values[3];
    var parsed_date = Date.parse(time_value);
    var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
    var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
    if (values[4] == "+0000") {
        delta = delta + (relative_to.getTimezoneOffset() * 60);
    } else {
        delta = delta + relative_to.getTimezoneOffset();
    }


    return delta;
}

// Function to return the relative time based off of delta.
function relative_time(time_value) {

    var delta = get_delta(time_value);

    if (delta < 60) {
        return 'less than a minute ago';
    } else if(delta < 120) {
        return 'about a minute ago';
    } else if(delta < (60*60)) {
        return (parseInt(delta / 60)).toString() + ' minutes ago';
    } else if(delta < (120*60)) {
        return 'about an hour ago';
    } else if(delta < (24*60*60)) {
        return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
    } else if(delta < (48*60*60)) {
        return '1 day ago';
    } else {
        return (parseInt(delta / 86400)).toString() + ' days ago';
    }
}

// Function to return the relative time based off of delta.
function relative_twitter_time(time_value) {

    var delta = get_twitter_delta(time_value);

    if (delta < 60) {
        return 'less than a minute ago';
    } else if(delta < 120) {
        return 'about a minute ago';
    } else if(delta < (60*60)) {
        return (parseInt(delta / 60)).toString() + ' minutes ago';
    } else if(delta < (120*60)) {
        return 'about an hour ago';
    } else if(delta < (24*60*60)) {
        return 'about ' + (parseInt(delta / 3600)).toString() + ' hours ago';
    } else if(delta < (48*60*60)) {
        return '1 day ago';
    } else {
        return (parseInt(delta / 86400)).toString() + ' days ago';
    }
}


// Multi-Dementional Array sort.
function by(i,dir) {
    return function(a,b){a = a[i];b = b[i];return a == b ? 0 : (a < b ? -1*dir : dir)}
}
