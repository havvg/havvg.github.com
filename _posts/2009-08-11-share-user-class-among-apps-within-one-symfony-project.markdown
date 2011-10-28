--- 
layout: post
title: share user class among apps within one symfony project
excerpt: Is it possible to share one user class among all apps within one symfony project? - Yes, it is! It is very easy, too. All you need is - surprisingly - a class, some changes in the factories.yml of the apps sharing the user class and that's it!
---
Is it possible to share one user class among all apps within one symfony project? - Yes, it is! It is very easy, too. All you need is - surprisingly - a class, some changes in the factories.yml of the apps sharing the user class and that's it!

At first create a user class you want to share and save it e.g. in lib/mcxUser.class.php, for example:

{% highlight php %}
<?php
class mcxUser extends sfGuardSecurityUser
{
  // your code here
}
{% endhighlight %}

Now all that's left is the factories.yml. Add these lines to the factories.yml in the all: section within all apps that will be using the shared user class.

{% highlight yaml %}
user:
  class: mcxUser
  param:
    timeout:         1800
    logging:         %SF_LOGGING_ENABLED%
    use_flash:       true
    default_culture: %SF_DEFAULT_CULTURE%
{% endhighlight %}

Having done this, you have a green to go. Make sure you clear the cache after doing this.
