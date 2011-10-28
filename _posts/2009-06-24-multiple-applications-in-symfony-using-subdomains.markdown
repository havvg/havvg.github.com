--- 
layout: post
title: multiple applications in symfony using subdomains
excerpt: You might have thought about it - me too :) It's one simple way to use subdomains to manage the chosen application of your symfony project.
---
You might have thought about it - me too :) It's one simple way to use subdomains to manage the chosen application of your symfony project.

{% highlight php %}
<?php

require_once(dirname(__FILE__).'/../config/ProjectConfiguration.class.php');

switch ($_SERVER['HTTP_HOST'])
{
  case 'backend.megacomplex.de':
    $configuration = ProjectConfiguration::getApplicationConfiguration(
      'backend',
      'prod',
      false);
  break;

  case 'mkt.megacomplex.de':
    $configuration = ProjectConfiguration::getApplicationConfiguration(
      'mkt',
      'prod',
      false);
  break;

  case 'nopaste.megacomplex.de':
    $configuration = ProjectConfiguration::getApplicationConfiguration(
      'nopaste',
      'prod',
      false);
  break;

  default:
    $configuration = ProjectConfiguration::getApplicationConfiguration(
      'game',
      'prod',
      false);
  break;
}

sfContext::createInstance($configuration)->dispatch();
{% endhighlight %}

That's the index.php I'm using for Megacomplex. On the other hand you will have to setup your webserver correctly!
