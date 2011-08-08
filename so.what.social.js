(function ($) {

    // internal variables
    var POST_ARRAY = new Array();
    var CONTAINER = null;
    var COUNT = 0;                      // number of posts stored
    var FINISHED = 0;                   // number of feeds processed (success or fail)
    var TOTAL = 0;                      // number feeds to process

    $.fn.soWhatSocial = function (options) {

        var defaults = {
            'feeds': [],                // list of feeds in format { 'title': '', 'type': '', 'id': '' }
            'icons': {
                'rss': 'rss_21.png',
                'twitter': 'twitter_21.png',
                'facebook': 'facebook_21.png'
            },
            'totalPosts': 10,           // total posts to display
            'sourceMax': 5              // max number to show from any one source
        };

        // merge defaults with options provided by caller
        var settings = $.extend( defaults, options );
        TOTAL = settings.feeds.length;

        CONTAINER = this;

        // Multi-Dementional Array sort.
        function by(i,dir) {
            return function(a,b){a = a[i];b = b[i];return a == b ? 0 : (a < b ? -1*dir : dir)}
        }

        // pubDate delta function
        function get_delta(time_value) {
            // Date.parse seems pretty flexible
            // might want to add some error handling here though
            // http://stackoverflow.com/questions/1088793/the-correct-javascript-date-parse-format-string
            // tested on Twitter dates, RSS dates, Facebook RSS dates
            var values = time_value.split(" ");
            var parsed_date = Date.parse(time_value);
            var relative_to = (arguments.length > 1) ? arguments[1] : new Date();
            var delta = parseInt((relative_to.getTime() - parsed_date) / 1000);
            // iffy - depends on particular date format
            if (values[5] == "+0000") {
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
                return 'Yesterday';
            } else {
                return (parseInt(delta / 86400)).toString() + ' days ago';
            }
        }

        function get_words(text, number) {
            // return the first number words of text
            var words = text.split(" ");

            // if we're asking for more words than there are, just return what we have
            if( number > words.length ) {
                return text;
            }

            var tmp = [];
            for(i = 0; i<number; i++) {
                tmp.push(words[i]);
            }
            return tmp.join(" ")+"...";
        }

        function linkify(text) {
            // convert anything starting with http://, https:// or www. 
            // OR
            // ending with .com, .org, .net
            // to <a></a>
            var chunks = text.split(" ");
            for(i=0; i<chunks.length; i++) {
                var colon_split = chunks[i].split(":");
                var period_split = chunks[i].split(".");
                var ps_last = period_split.length-1;
                if( colon_split[0] == "http" || colon_split[0] == "https" ) {
                    // add a link around it
                    chunks[i] = '<a href="'+chunks[i]+'">'+chunks[i]+'</a>';
                }
                
                if( period_split[0] == "www" || period_split[ps_last] == "com" || period_split[ps_last] == "org" || period_split[ps_last] == "net" ) {
                    // add a link around it, adding http://
                    chunks[i] = '<a href="http://'+chunks[i]+'">'+chunks[i]+'</a>';
                }
            }
            return chunks.join(" ");
        }

        function strip_tags(text) {
            // remove html tags from a string
            // http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
            return text.replace(/<[^>]*>?/g, '');
        }

        function build_li(feed, text, date, url) {
            li_text =   "<li>";
            // link around title/icon instead
            li_text +=  '<p><a class="original_post" href="'+url+'"><strong>'+feed.title+'</strong><img class="icon" src="'+settings.icons[feed.type]+'" /></a></p>';
            li_text +=  text;
            li_text +=  '<br />(' + relative_time(date) + ')';
            li_text +=  "</li>";
            return li_text;
        }

        function tryTwitter(feed) {
            $.jsonp({
                url: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name="+feed.id+"&trim_user=true&count="+settings.sourceMax+"&include_rts=1&callback=?",
            cache: true,
            success: function(d) {
                $(d).each(function () {
                    var tweet = this.text;
                    var pubDate = this.created_at;
                    var url = 'https://twitter.com/#!/'+feed.id+'/status/'+this.id_str;

                    POST_ARRAY[COUNT] = new Array();
                    POST_ARRAY[COUNT][0] = build_li(feed, linkify(tweet), pubDate, url);
                    POST_ARRAY[COUNT][1] = relative_time(pubDate);
                    POST_ARRAY[COUNT][2] = get_delta(pubDate);
                    COUNT++;
                });
                FINISHED++;
            },
            error: function(d, msg) {
                   console.log("ERROR Could not load resource: Twitter, "+id);
                   FINISHED++;
               }
            });
        }
        function tryFacebook(feed) {
            // uses YQL select * from feed at the moment
            $.jsonp({
                url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22"+encodeURIComponent(feed.id)+"%22%20limit%20"+settings.sourceMax+"&format=json&callback=?",
            cache: true,
            success: function(d) {
                $(d.query.results.item).each(function () {
                    var title = this.title;
                    var url = this.link;
                    var description = this.description;
                    var pubDate = this.pubDate;
                    var pubDate = pubDate.replace(/\,/g,'');    /* removes comma after weekday */

                    /* append to div */
                    POST_ARRAY[COUNT] = new Array();
                    POST_ARRAY[COUNT][0] = build_li(feed, linkify(get_words(strip_tags(title), 30)), pubDate, url);
                    POST_ARRAY[COUNT][1] = relative_time(pubDate);
                    POST_ARRAY[COUNT][2] = get_delta(pubDate);
                    COUNT++;
                });
                FINISHED++;
            },
            error: function(d, msg) {
                   console.log("ERROR Could not load resource: RSS, "+feed.id);
                   FINISHED++;
               }
            });

        }
        function tryRSS(feed) {
            // uses YQL select * from feed at the moment
            $.jsonp({
                url: "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20feed%20where%20url%3D%22"+encodeURIComponent(feed.id)+"%22%20limit%20"+settings.sourceMax+"&format=json&callback=?",
            cache: true,
            success: function(d) {
                $(d.query.results.item).each(function () {
                    var title = this.title;
                    var url = this.link;
                    var description = this.description;
                    var pubDate = this.pubDate;
                    var pubDate = pubDate.replace(/\,/g,'');    /* removes comma after weekday */

                    /* append to div */
                    POST_ARRAY[COUNT] = new Array();
                    POST_ARRAY[COUNT][0] = build_li(feed, linkify(get_words(strip_tags(description), 30)), pubDate, url);
                    POST_ARRAY[COUNT][1] = relative_time(pubDate);
                    POST_ARRAY[COUNT][2] = get_delta(pubDate);
                    COUNT++;
                });
                FINISHED++;
            },
            error: function(d, msg) {
                       console.log("ERROR Could not load resource: RSS, "+feed.id);
                        FINISHED++;
                   }
            });
        }

        function print_array() {
            console.log("Finished: "+FINISHED);
            console.log("Total: "+TOTAL);
            console.log("Count: "+COUNT);

            if(FINISHED == TOTAL) { 
                CONTAINER.html("");
                POST_ARRAY.sort(by(2,1));
                var html = '<ol>';
                for (j = 0; j < ( (COUNT < settings.totalPosts) ? COUNT : settings.totalPosts ); j++) {
                    html += POST_ARRAY[j][0];
                }
                html += '</ol>';
                CONTAINER.hide().append(html).fadeIn();
            } else {
                // weirdly, print_array(), "print_array", and "print_array()" don't work
                setTimeout(print_array, 1000);
            }
        }
        

        // FEED PROCESSING LOOP
        return this.each(function () {

            $.each(settings.feeds, function(index, feed) {
                if( feed.type == "twitter" ) {
                    tryTwitter(feed);
                } else if ( feed.type == "facebook" ) {
                    tryFacebook(feed);
                } else if ( feed.type == "rss" ) {
                    tryRSS(feed);
                } else {
                    console.log("feed type="+feed.type+" is unsupported. Skipped.");
                    FINISHED++;
                }

            });

            print_array();

        });
    }
    
})(jQuery);
