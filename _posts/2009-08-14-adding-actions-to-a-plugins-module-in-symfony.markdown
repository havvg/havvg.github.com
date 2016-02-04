---
layout: post
title: adding actions to a plugins module in symfony
excerpt: There are many cases in which you might want to extend capabilities of a plugin. As this is not that complicated at all and you can go edit every file within your plugin directory, this is not the best way doing this. Adding new methods to a library can easily be done by creating a new class extending the plugins one. I don't like to edit any file within the plugin directory, as I am using `svn:externals` to install and update plugins.
---
There are many cases in which you might want to extend capabilities of a plugin. As this is not that complicated at all and you can go edit every file within your plugin directory, this is not the best way doing this. Adding new methods to a library can easily be done by creating a new class extending the plugins one. I don't like to edit any file within the plugin directory, as I am using `svn:externals` to install and update plugins.

I just wanted to add a register action to [the famous sfGuardPlugin](http://www.symfony-project.org/plugins/sfGuardPlugin "Plugins | sfGuardPlugin | symfony | Web PHP Framework"). It's - as always - pretty easy to do this in symfony. There are two ways of creating a new action for a module. You add a method `executeRegister` to the `actions.class.php` of the module or [you add a class for the action](http://www.symfony-project.org/book/1_2/06-Inside-the-Controller-Layer#chapter_06_sub_alternative_action_class_syntax "The Definitive Guide to symfony | Chapter 6 - Inside The Controller Layer | symfony | Web PHP Framework:"). The second approach helped me not to touch the code of the `sfGuardPlugin`.

If you want to overwrite or add things to a module of any plugin, you simply add a folder for the module in your applications `modules` folder. In my case, this is `sfGuardAuth` because I want to extend the `sfGuardAuth` module of `sfGuardPlugin`. Having done this, you can add or overwrite anything for this module by adding the required files.

<pre>
havvgBook:modules havvg$ ls -lR sfGuardAuth
total 0
drwxr-xr-x  3 havvg  staff  102 Aug 14 20:18 actions
drwxr-xr-x  4 havvg  staff  136 Aug 14 20:24 config
drwxr-xr-x  3 havvg  staff  102 Aug 14 20:20 templates
 
sfGuardAuth/actions:
total 8
-rw-r--r--  1 havvg  staff  461 Aug 14 20:27 registerAction.class.php
 
sfGuardAuth/config:
total 16
-rw-r--r--  1 havvg  staff  26 Aug 14 20:24 security.yml
-rw-r--r--  1 havvg  staff  24 Jul 28 21:08 view.yml
 
sfGuardAuth/templates:
total 8
-rw-r--r--  1 havvg  staff  8 Aug 14 20:21 registerSuccess.php
</pre>

Now that the files exist, you can add the content in `sfGuardAuth/actions/registerAction.class.php`.

```php
<?php
class registerAction extends sfAction
{
  /**
   * Execute the register action.
   *
   * @param sfWebRequest $request
   *
   * @return string
   */
  public function execute($request)
  {
    return sfView::SUCCESS;
  }
}
```

The only thing missing now, is a proper route and of course the action itself :)
