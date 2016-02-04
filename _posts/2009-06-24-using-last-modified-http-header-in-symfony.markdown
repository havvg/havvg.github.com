---
layout: post
title: using Last-Modified HTTP Header in symfony
excerpt: As there are many situations in which you might want to use the HTTP status code ["304 - Not Modified"](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection "List of HTTP status codes - Wikipedia, the free encyclopedia") symfony gives you an easy way in doing so. Especially while you are delivering dynamic content, it might not be that easy to determ whether the request has been modified or not. Sending the HTTP response header is one thing, later on you have to check against the If-Modified-Since HTTP request header sent to your application.
---
As there are many situations in which you might want to use the HTTP status code ["304 - Not Modified"](http://en.wikipedia.org/wiki/List_of_HTTP_status_codes#3xx_Redirection "List of HTTP status codes - Wikipedia, the free encyclopedia") symfony gives you an easy way in doing so. Especially while you are delivering dynamic content, it might not be that easy to determ whether the request has been modified or not. Sending the HTTP response header is one thing, later on you have to check against the If-Modified-Since HTTP request header sent to your application.

## Use-Cases

I got a [simple feed](http://bestof.wstar.de/feed "Best of White Star Clan") using this little setup. Let's face the use cases first.

1. The user does the first request and gets the feed filled with the latest items.
2. The user does the second request and between the first and this one, nothing has changed.
3. The user does the third request and a new feed item is available.

## add Last-Modified

The first request is delivering the complete feed and has to add the "Last-Modified" HTTP header. In order to do this, we use the given postExecute() method of the feedActions.
```php
<?php
/**
 * send the Last-Modified HTTP header
 */
public function postExecute()
{
  $latestEntry = EntryPeer::getLatestEntry();
  $this->getResponse()->setHttpHeader('Last-Modified', $latestEntry->getCreatedAt('r'));
}
```

Well yeah, we don't care about the use case here, as this header can be sent without harming anything.

## check If-Modified-Since

The user does the second request, which contains the `If-Modified-Since` HTTP header. Because we don't want to run the action itself (we won't save CPU time, response time, bandwith .. this way), we use the `preExecute()` method of our `feedActions`. First we look whether the request contains the header, and if this header is given, we check against the latest feed item.

In order to stop symfony doing the work, you have to explicitly send out the response before the `executeAction()` method is called. This will also be done within the `preExecute()` method.

```php
<?php
/**
 * check whether this request has changed
 */
private function preExecute()
{
  $latestEntry = EntryPeer::getLatestEntry();
  if ($lastModified = $this->getRequest()->getHttpHeader('If-Modified-Since'))
  {
    if ($lastModified == $latestEntry->getCreatedAt('r'))
    {
      $this->getResponse()->setHeaderOnly(true);
      $this->getResponse()->setStatusCode(304);
      $this->getResponse()->send();
      # use case 2
    } # else: use case 3
  } # else: use case 1
}
```

If there is no `If-Modified-Since` header given we are in use case #1. If the header is sent and the date given is the same as the latest item, we are in use case #2. Last but not least, if the header is given and there is a new item - the date in the `If-Modified-Since` header does not match the `created_at` field - we are in use case #3.

However, this is just a basic example how you could do it :)

## Not mentioned here

This example is kept simple. I didn't mentioned, that actually you might want to retrieve the youngest updated_at of all feed items. You can add far more caching, like caching the latest item somewhere while creating it and retrieve it here much faster. There are many improvements possible, that would not fit into this posting :)
