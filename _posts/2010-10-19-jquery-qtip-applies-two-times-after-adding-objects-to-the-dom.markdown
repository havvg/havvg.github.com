--- 
layout: post
title: jQuery qTip applies two times after adding objects to the DOM
excerpt: |
  At [Adcloud](https://adcloud.com) we are using the [jQuery qTip plugin](https://craigsworks.com/projects/qtip/), which provides pretty nice and easy to apply tooltips. We ran into one small problem, which solution I want to share. The tooltips work fine, except when you are adding new objects to the DOM. As of [jQuery 1.4](https://jquery.com) there is no availability of live binding on the load-Event.
---

At [Adcloud](https://adcloud.com) we are using the [jQuery qTip plugin](https://craigsworks.com/projects/qtip/), which provides pretty nice and easy to apply tooltips. We ran into one small problem, which solution I want to share. The tooltips work fine, except when you are adding new objects to the DOM. As of [jQuery 1.4](https://jquery.com) there is no availability of live binding on the load-Event.

```javascript
// example style definition
$.fn.qtip.styles.myStyle = {
    name: 'blue',
    tip: 'bottomLeft',
    background: '#FFFFFF',
    color: '#515151',
    textAlign: 'left',
    border: {
        width: 0,
        radius: 4,
        color: '#B4D800'
    },
    width: {
        min: 100,
        max: 350
    },
};
```

```javascript
// example qTip
$('legend.tooltip[title]').qtip({
    style: 'myStyle'
});
```

If you put your code into a separate function, you can call this to apply qTip to the newly added objects in the DOM. However, objects that were already touched by qTip will look somehow broken.

![Example of a broken qTip](/images/2010/10/double-qtip.jpg "Broken qTip")

To fix this issue, [the style option](https://craigsworks.com/projects/qtip/docs/reference/#style) is the key. Here you can add a class, that will be set to the elements which were affected by the qTip plugin. Using this option to apply a class you will exclude from the collection to pass into qTip, you won't call qTip on the same object twice.

```javascript
// example style definition
$.fn.qtip.styles.myStyle = {
    name: 'blue',
    tip: 'bottomLeft',
    background: '#FFFFFF',
    color: '#515151',
    textAlign: 'left',
    border: {
        width: 0,
        radius: 4,
        color: '#B4D800'
    },
    width: {
        min: 100,
        max: 350
    },
    classes: {
        target: 'qtip'
    } 
};
```

```javascript
// example qTip
$('legend.tooltip[title]').not('.qtip').qtip({
    style: 'myStyle'
});
```

Now you can call your function to apply qTip to your newly added objects without having strange tooltips.
