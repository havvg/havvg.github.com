---
layout: post
title: "add a project wide TestCase to sfPHPUnit2Plugin "
---
I just moved my projects from lime to [PHPUnit testing framework](http://www.phpunit.de). To make this easier, I appreciate [the work of Frank Stelzer](http://dev.esl.eu/blog/2010/02/25/testing-symfony-projects-with-phpunit/), who has created a plugin which makes this move pretty easy within [symfony](http://www.symfony-project.org). Setting things up was one easy task, but soon I ran into the problem not being able to share code within the classes of the test cases without touching the plugins code.

In order to being able to do this, we use the autoloader of symfony. If the `sfPHPUnitBaseTestCase` is found in our library use this, otherwise the one provided by the [sfPHPUnit2Plugin](http://symfony-project.org/plugins/sfPHPUnit2Plugin). So, what's left is moving the current code of the sfPHPUnitBaseTestCase into a new class and make it the superclass of this one. I have chosen to add another entry for the autoloader %SF_LIB_DIR%/test. The only thing left, since the bootstraps for functional and selenium tests can make good out of the autoloader. There are slight adjustments to check whether the file is given at the chosen place. This is the only thing I don't like yet, because it's hardcoded within the plugin. However you can use the bootstrap templates to adjust it easily. Having done the explanation, here comes the complete patch for [r31286](http://trac.symfony-project.org/browser/plugins/sfPHPUnit2Plugin/trunk?rev=31286).

I sent the patch to Frank and he is reviewing it and will hopefully apply this in the near future to the trunk. In the meanwhile, feel free to use it. But be advised that you might get conflict when you are going to update the plugin later and the actual solution was being adjusted. I will let you know, how to solve this in case it happens.

```diff
Index: lib/test/sfPHPUnitPluginBaseTestCase.class.php
===================================================================
--- lib/test/sfPHPUnitPluginBaseTestCase.class.php	(revision 0)
+++ lib/test/sfPHPUnitPluginBaseTestCase.class.php	(revision 0)
@@ -0,0 +1,150 @@
+<?php
+
+/*
+ * This file is part of the sfPHPUnit2Plugin package.
+ * (c) 2010 Frank Stelzer <dev@frankstelzer.de>
+ *
+ * For the full copyright and license information, please view the LICENSE
+ * file that was distributed with this source code.
+ */
+
+/**
+ * The plugins base class for all test cases.
+ *
+ * @package    sfPHPUnit2Plugin
+ * @subpackage test
+ * @author     Frank Stelzer <dev@frankstelzer.de>
+ */
+abstract class sfPHPUnitPluginBaseTestCase extends PHPUnit_Framework_TestCase
+{
+  /**
+   * The sfContext instance
+   *
+   * @var sfContext
+   */
+  private $context = null;
+
+  /**
+   * The sfApplicationConfiguration instance
+   *
+   * @var sfApplicationConfiguration
+   */
+  private $applicationConfiguration = null;
+
+  /**
+   * Dev hook for custom "setUp" stuff
+   * Overwrite it in your test class, if you have to execute stuff before a test is called.
+   */
+  protected function _start()
+  {
+  }
+
+  /**
+   * Dev hook for custom "tearDown" stuff
+   * Overwrite it in your test class, if you have to execute stuff after a test is called.
+   */
+  protected function _end()
+  {
+  }
+
+  /**
+   * Please do not touch this method and use _start directly!
+   */
+  protected function setUp()
+  {
+    $this->_start();
+  }
+
+  /**
+   * Please do not touch this method and use _end directly!
+   */
+  protected function tearDown()
+  {
+    $this->_end();
+  }
+
+  /**
+   * Returns current sfApplicationConfiguration instance.
+   * If no configuration does currently exist, a new one will be created.
+   *
+   * @return sfApplicationConfiguration
+   */
+  protected function getApplicationConfiguration()
+  {
+  	if (is_null($this->applicationConfiguration))
+  	{
+  		$this->applicationConfiguration = ProjectConfiguration::getApplicationConfiguration($this->getApplication(), $this->getEnvironment(), true);
+  	}
+
+  	return $this->applicationConfiguration;
+  }
+
+  /**
+   * A unit test does not have loaded the whole symfony context on start-up, but
+   * you can create a working instance if you need it with this method
+   * (taken from the bootstrap file).
+   *
+   * @return sfContext
+   */
+  protected function getContext()
+  {
+    if (!$this->context)
+    {
+      // ProjectConfiguration is already required in the bootstrap file
+      $this->context = sfContext::createInstance($this->getApplicationConfiguration());
+    }
+
+    return $this->context;
+  }
+
+  /**
+   * Returns current sfPHPUnitTest
+   *
+   * @return sfPHPUnitTest
+   */
+  protected function getTest()
+  {
+    if (!$this->test)
+    {
+      $this->test = new sfPHPUnitTest( $this );
+    }
+
+    return $this->test;
+  }
+
+  /**
+   * Prints a debug message and dumps the
+   * assigned variable
+   *
+   * @param mixed $mixed The content which should be dumped
+   * @param string $message A debug message
+   */
+  protected function debug($mixed, $message = 'debug')
+  {
+  	$this->getTest()->diag(sprintf('[%s] %s', $message, var_export($mixed, true)));
+  }
+
+  /**
+   * Returns application name
+   *
+   * Overwrite this method if you need a context instance in your unit test!
+   *
+   * @return string
+   */
+  protected function getApplication()
+  {
+    throw new Exception( 'Application name is not defined. Overwrite "getApplication" in your unit test!');
+  }
+
+  /**
+   * Returns environment name
+   *
+   * Overwrite this method if you need a context instance in your unit test!
+   *
+   * @return string test by default
+   */
+  protected function getEnvironment()
+  {
+    return 'test';
+  }
+}
\ No newline at end of file
 
Property changes on: lib/test/sfPHPUnitPluginBaseTestCase.class.php
___________________________________________________________________
Added: svn:keywords
   + "LastChangedBy LastChangedDate Revision HeadURL Id"
 
Index: lib/test/sfPHPUnitBaseTestCase.class.php
===================================================================
--- lib/test/sfPHPUnitBaseTestCase.class.php	(revision 31514)
+++ lib/test/sfPHPUnitBaseTestCase.class.php	(working copy)
@@ -9,150 +9,16 @@
  */
 
 /**
- * sfBasePHPUnitTestCase is the super class for all unit
+ * sfPHPUnitBaseTestCase is the super class for all unit
  * tests using PHPUnit.
  *
- * @package    sfPHPUnit2Plugin
+ * Make a class available in your library folder and put your project relevant helper methods in there.
+ *
+ * @package sfPHPUnit2Plugin
  * @subpackage test
- * @author     Frank Stelzer <dev@frankstelzer.de>
+ * @author Toni Uebernickel <tuebernickel@gmail.com>
  */
-abstract class sfPHPUnitBaseTestCase extends PHPUnit_Framework_TestCase
+class sfPHPUnitBaseTestCase extends sfPHPUnitPluginBaseTestCase
 {
-  /**
-   * The sfPHPUnitTest instance for lime compatibility
-   *
-   * @var sfPHPUnitTest
-   */
-  private $test = null;
 
-  /**
-   * The sfContext instance
-   *
-   * @var sfContext
-   */
-  private $context = null;
-
-  /**
-   * The sfApplicationConfiguration instance
-   *
-   * @var sfApplicationConfiguration
-   */
-  private $applicationConfiguration = null;
-
-  /**
-   * Dev hook for custom "setUp" stuff
-   * Overwrite it in your test class, if you have to execute stuff before a test is called.
-   */
-  protected function _start()
-  {
-  }
-
-  /**
-   * Dev hook for custom "tearDown" stuff
-   * Overwrite it in your test class, if you have to execute stuff after a test is called.
-   */
-  protected function _end()
-  {
-  }
-
-  /**
-   * Please do not touch this method and use _start directly!
-   */
-  protected function setUp()
-  {
-    $this->_start();
-  }
-
-  /**
-   * Please do not touch this method and use _end directly!
-   */
-  protected function tearDown()
-  {
-    $this->_end();
-  }
-
-  /**
-   * Returns current sfApplicationConfiguration instance.
-   * If no configuration does currently exist, a new one will be created.
-   *
-   * @return sfApplicationConfiguration
-   */
-  protected function getApplicationConfiguration()
-  {
-  	if (is_null($this->applicationConfiguration))
-  	{
-  		$this->applicationConfiguration = ProjectConfiguration::getApplicationConfiguration($this->getApplication(), $this->getEnvironment(), true);
-  	}
-
-  	return $this->applicationConfiguration;
-  }
-
-  /**
-   * A unit test does not have loaded the whole symfony context on start-up, but
-   * you can create a working instance if you need it with this method
-   * (taken from the bootstrap file).
-   *
-   * @return sfContext
-   */
-  protected function getContext()
-  {
-    if (!$this->context)
-    {
-      // ProjectConfiguration is already required in the bootstrap file
-      $this->context = sfContext::createInstance($this->getApplicationConfiguration());
-    }
-
-    return $this->context;
-  }
-
-  /**
-   * Returns current sfPHPUnitTest
-   *
-   * @return sfPHPUnitTest
-   */
-  protected function getTest()
-  {
-    if (!$this->test)
-    {
-      $this->test = new sfPHPUnitTest( $this );
-    }
-
-    return $this->test;
-  }
-
-  /**
-   * Prints a debug message and dumps the
-   * assigned variable
-   *
-   * @param mixed $mixed The content which should be dumped
-   * @param string $message A debug message
-   */
-  protected function debug($mixed, $message = 'debug')
-  {
-  	$this->getTest()->diag(sprintf('[%s] %s', $message, var_export($mixed, true)));
-  }
-
-  /**
-   * Returns application name
-   *
-   * Overwrite this method if you need a context instance in your unit test!
-   *
-   * @return string
-   */
-  protected function getApplication()
-  {
-    throw new Exception( 'Application name is not defined. Overwrite "getApplication" in your unit test!');
-  }
-
-  /**
-   * Returns environment name
-   *
-   * Overwrite this method if you need a context instance in your unit test!
-   *
-   * @return string test by default
-   */
-  protected function getEnvironment()
-  {
-    return 'test';
-  }
 }
\ No newline at end of file
Index: lib/config/autoload.yml
===================================================================
--- lib/config/autoload.yml	(revision 31514)
+++ lib/config/autoload.yml	(working copy)
@@ -1,6 +1,11 @@
-autoload:
+autoload:  
   # tests for sfPHPUnit2Plugin
   sfPHPUnit2Plugin_tests:
     name:           sfPHPUnit2Plugin tests
     path:           %SF_PLUGINS_DIR%/sfPHPUnit2Plugin/lib/test
     recursive:      false
+    
+  project_lib_test:
+    name:           project test library
+    path:           %SF_LIB_DIR%/test
+    recursive:      false
\ No newline at end of file
Index: data/template/selenium/bootstrap.tpl
===================================================================
--- data/template/selenium/bootstrap.tpl	(revision 31514)
+++ data/template/selenium/bootstrap.tpl	(working copy)
@@ -14,7 +14,19 @@
 
 // autoloading does not exist at this point yet, require base classes by hand
 $_phpunitPluginDir = dirname(__FILE__).'/../../../plugins/sfPHPUnit2Plugin';
-require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseTestCase.class.php';
+require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitPluginBaseTestCase.class.php';
+
+// check for project specific base class
+$_projectBaseTestCase = sfConfig::get('sf_lib_dir').'/test/sfPHPUnitBaseTestCase.class.php';
+if (file_exists($_projectBaseTestCase))
+{
+  require_once $_projectBaseTestCase;
+}
+else
+{
+  require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseTestCase.class.php';
+}
+
 require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseSeleniumTestCase.class.php';
 
 // remove all cache
Index: data/template/functional/bootstrap.tpl
===================================================================
--- data/template/functional/bootstrap.tpl	(revision 31514)
+++ data/template/functional/bootstrap.tpl	(working copy)
@@ -13,7 +13,20 @@
 
 // autoloading does not exist at this point yet, require base classes by hand
 $_phpunitPluginDir = dirname(__FILE__).'/../../../plugins/sfPHPUnit2Plugin';
-require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseTestCase.class.php';
+
+require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitPluginBaseTestCase.class.php';
+
+// check for project specific base class
+$_projectBaseTestCase = sfConfig::get('sf_lib_dir').'/test/sfPHPUnitBaseTestCase.class.php';
+if (file_exists($_projectBaseTestCase))
+{
+  require_once $_projectBaseTestCase;
+}
+else
+{
+  require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseTestCase.class.php';
+}
+
 require_once $_phpunitPluginDir.'/lib/test/sfPHPUnitBaseFunctionalTestCase.class.php';
 
 // remove all cache
```
