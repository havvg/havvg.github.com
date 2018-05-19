---
layout: post
title: triggerHandler on live event bindings in jQuery
---
As stated in the jQuery API Documentation, [the triggerHandler() method](https://docs.jquery.com/Events/triggerHandler "Events/triggerHandler - jQuery JavaScript Library") does not work on events bound to objects using [the live() method](https://docs.jquery.com/Events/live "Events/live - jQuery JavaScript Library"), which includes also objects created after the DOM was loaded completely.

However, this is nothing unusual. In fact, it might be a common way to work within an advanced AJAX enabled webapplication. I encountered this problem this evening and also created a simple workaround. The following code snippet works just fine.

```javascript
var event = new $.Event('click');
event.preventDefault();
$('input:submit', $(this)).trigger(event);
```
