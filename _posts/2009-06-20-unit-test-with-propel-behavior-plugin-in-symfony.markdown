--- 
layout: post
title: unit test with sfPropel*BehaviorPlugin in symfony
excerpt: Today I have written my first unit test in symfony in which one of the models has attached a propel behavior. In my case it was the sfPropelActAsSluggableBehavior. While writing the unit test I didn't thought it would be a problem, until I finnaly ran the test.
---
Today I have written my first unit test in symfony in which one of the models has attached a propel behavior. In my case it was the sfPropelActAsSluggableBehavior. While writing the unit test I didn't thought it would be a problem, until I finnaly ran the test.

The error message was short, but has a lack of information. "sfPropelActAsSluggableBehavior is not registered" - sweet! So, what's going on? The autoloader can't find it? Anything with the ProjectConfiguration wrong? In fact, it was the sfContext which was missing. Well within an unit test this is usual, because you are - most often - testing the model and its functions. But how to test behaviors of the model? You need to get the sfContext initialized, which is quite simple and you go on with the testing.
```php
<?php
 
require_once(dirname(__FILE__) . '/../bootstrap/unit.php');

$limeTest = new lime_test(20, new lime_output_color());

$limeTest->info('Setting up sfContext ..');
sfContext::createInstance(ProjectConfiguration::getApplicationConfiguration('nopaste', 'test', true));

```

So after bootstrapping the unit test you got your ProjectConfiguration set up. What you need now is an ApplicationConfiguration. Well it's not that good, because you add a dependency to your models test, but I found no other way to get the test running, except removing the behavior itself. Create the sfContext with a test application and your test will run!
