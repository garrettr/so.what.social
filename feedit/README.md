README
------

feedit is a simple Django front-end to the so.what.social JQuery plugin.

feedit provides an admin interface that allows administrators to create, delete, and modify the feeds that will be passed to so.what.social without requiring them to edit any JSON.

## Install

1.  Copy the feedit/ directory to somewhere on your Python path.
2.  Add 'feedit' to INSTALLED_APPS
3.  `./manage.py syncdb`

## Usage

Use the admin interface to edit feeds. Self-explanatory.

To insert the feeds into a template, first follow the instructions for installing so.what.social.

1.  Load the feedit template tags:
        {% load feedit_tags %}
2.  Edit the `<script></script>` block where you had previously hard-coded the feeds in JSON to use the 
    feedit template tag. Something like this:
        <script type="text/javascript">
            $(document).ready(function() {
                $("#activityFeed").soWhatSocial({
                    "feeds": {% get_feed_list %},
                    // any custom settings...
                });
            });
        </script>

That's it!
