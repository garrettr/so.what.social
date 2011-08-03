from django import template
from feedit.models import Feed

def do_feed_list(parser, token):
    return FeedListNode()

class FeedListNode(template.Node):
    def render(self, context):
        feed_list = Feed.objects.all()
        # add to the context (why not)
        context['feed_list'] = feed_list
        # build JSON
        json_list = ['[',]
        for feed in feed_list:
            json_list.append('{')
            json_list.append('"title": "%s",' % feed.title)
            json_list.append('"type": "%s",' % feed.source)
            json_list.append('"id": "%s"' % feed.uri)
            json_list.append('},')
        json_list.append(']')
        return ''.join(json_list)

register = template.Library()
register.tag('get_feed_list', do_feed_list)
