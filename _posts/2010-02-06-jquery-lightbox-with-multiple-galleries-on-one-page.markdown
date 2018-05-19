---
layout: post
title: jQuery lightBox with multiple galleries on one page
---
[Lightbox](https://leandrovieira.com/projects/jquery/lightbox/) is one great plugin for [jQuery](https://www.jquery.com). As there is no option to set up relations for links of images to generate galleries of it like thickbox does, you have to call lightBox multiple times to get your galleries up and separated from each other.

A simple call for lightBox looks something like this.

```javascript
$('#photos .gallery a').lightBox();
```

Imagine you have several separated elements of the class `gallery` nested under the photos node. LightBox will put all of these images in one gallery.

The following code snippet will call lightBox multiple times separating each gallery from all others.

```javascript
$('#photos .gallery').each(function() {
  $('a', $(this)).lightBox();
});
```
