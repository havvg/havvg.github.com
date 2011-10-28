---
layout: post
title: speed up PHPUnit CodeCoverage in symfony projects
excerpt: Well, [PHPUnit CodeCoverage](http://www.phpunit.de) is pretty nice and exports some nice HTML files to take a look into. However, a project most often contains more than just PHP files and for a symfony project this could be the phpunit.xml.dist. It removes all folders from your coverage report, that most likely are not your stuff. This one is based on the shipped file of [sfPHPUnit2Plugin](http://www.symfony-project.org/plugins/sfPHPUnit2Plugin). The relevant part is the `<filter>` section.
---
Well, [PHPUnit CodeCoverage](http://www.phpunit.de) is pretty nice and exports some nice HTML files to take a look into. However, a project most often contains more than just PHP files and for a symfony project this could be the phpunit.xml.dist. It removes all folders from your coverage report, that most likely are not your stuff. This one is based on the shipped file of [sfPHPUnit2Plugin](http://www.symfony-project.org/plugins/sfPHPUnit2Plugin). The relevant part is the `<filter>` section.

{% highlight xml %}
<phpunit
  colors="true"
  convertErrorsToExceptions="true"
  convertNoticesToExceptions="true"
  convertWarningsToExceptions="true"
  stopOnFailure="true">
 
  <filter>
    <blacklist>
      <directory>cache</directory>
      <directory>data</directory>
      <directory>log</directory>
      <directory>lib/vendor</directory>
      <directory>plugins</directory>
      <directory>web</directory>
    </blacklist>
  </filter>
 
  <testsuites>
    <testsuite name="Unit Tests">
      <directory>test/phpunit/unit/</directory>
    </testsuite>
    <testsuite name="Functional Tests">
      <directory>test/phpunit/functional/</directory>
    </testsuite>
  </testsuites>
</phpunit>
{% endhighlight %}
