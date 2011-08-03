from django.contrib import admin
from feedit.models import Feed

class FeedAdmin(admin.ModelAdmin):
    list_display = ('title', 'source', 'uri', 'created_on')
    search_fields = ('title', 'source', 'uri')
    list_filter = ('source',)

admin.site.register(Feed, FeedAdmin)
