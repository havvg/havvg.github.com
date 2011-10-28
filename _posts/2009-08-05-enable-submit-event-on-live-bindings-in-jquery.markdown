---
layout: post
title: enable submit event on live bindings in jQuery
---
[The live() method](http://docs.jquery.com/Events/live "Events/live - jQuery JavaScript Library") is one great new feature of jQuery 1.3, however it does not support binding of the event 'submit' of forms.

{% highlight javascript %}
$('form').live('submit', function() {
  // your callback
});
{% endhighlight %}

This can be simulated by a simple workaround on the selected objects. [The click() event](http://docs.jquery.com/Events/click "Events/click - jQuery JavaScript Library") can be bound using the live() method. The workaround is simple: do not bind the submit of a form, but the click on any submit button within it.

{% highlight javascript %}
$('input:submit', $('form')).live('click', function() {
  // your callback
});
{% endhighlight %}
