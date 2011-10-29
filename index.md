---
layout: site
---
{% for post in site.posts limit:3 %}
  {% include post_preview.html %}
{% endfor %}
