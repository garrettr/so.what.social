from django.db import models
from django.utils.translation import ugettext_lazy as _

class Feed(models.Model):
    title = models.CharField(max_length=140,
            help_text="A descriptive name for this feed")
    # maps to "id" in the JSON dictionary
    # we can't use id because Django uses it for auto-primary-key field
    # https://docs.djangoproject.com/en/dev/ref/models/instances/?from=olddocs#auto-incrementing-primary-keys
    uri = models.CharField(max_length=300,
            help_text="An RSS/Atom URL or a Twitter screenname")

    RSSATOM = u'rss'
    FACEBOOK = u'facebook'
    TWITTER = u'twitter'
    SOURCE_CHOICES = (
        (RSSATOM, u'RSS/Atom'),
        (FACEBOOK, u'Facebook'),
        (TWITTER, u'Twitter'),
    )
    source = models.CharField(max_length=8, choices=SOURCE_CHOICES)

    # metadata
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def __unicode__(self):
        return u'%s' % self.title
