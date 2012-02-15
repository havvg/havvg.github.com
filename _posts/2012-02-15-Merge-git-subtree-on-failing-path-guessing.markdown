---
layout: post
title: "Merging a git subtree on failing path guessing"
excerpt: |
  In the previous post we set up a project using git-subtree.
  Unfortunately there may be situations when the merge of the subtree will not make its way into the correct directory.
---

If you don't know how to set up projects using a git subtree look at the [previous post].

I set up a similar project, in order to make it easier to post, I will wrap up the repositories:

* "landingpages" is a web application for managing product landing pages to attract new customers
* "LandingpageBundle" is a Symfony2 bundle containing shared classes for another project [Ormigo], which is currently re-written completely.

## The Setup

Now let's take a look at what the result was, when I first set things up.

<pre>
 LandingpageBundle git:master ✔  git ph 6dee0ac                 ~/Ormigo/repository/LandingpageBundle
* 6dee0ac - add empty LandingpageBundle (6 days ago) &lt;Toni Uebernickel&gt;
</pre>

<pre>
 landingpages git:feature/Symfony2 ✔  git ph 5470e58            ~/Ormigo/repository/landingpages
*   5470e58 - (origin/feature/Symfony2) add LandingpageBundle as subtree (25 hours ago) &lt;Toni Uebernickel&gt;
|\  
| * 6dee0ac - add empty LandingpageBundle (6 days ago) &lt;Toni Uebernickel&gt;
* 57c339c - add Symfony Light Edition (6 days ago) &lt;Toni Uebernickel&gt;
</pre>

## The issue

Now that I have added some changes to the bundle, I want them to be merged into the project.

<pre>
 LandingpageBundle git:master ✔  git ph                         ~/Ormigo/repository/LandingpageBundle
* 4db8fde - (HEAD, origin/master, master) add controller and routing for landingpages (73 minutes ago) 
* dffe3f8 - add FilesystemLoader for Twig (73 minutes ago) &lt;Toni Uebernickel&gt;
* 91b1877 - add LandingpageInterface (75 minutes ago) &lt;Toni Uebernickel&gt;
* 6dee0ac - add empty LandingpageBundle (6 days ago) &lt;Toni Uebernickel&gt;
</pre>

By what we know, the command `git pull --squash -s subtree --no-commit landingpagebundle master` will merge changes of the bundle into the subtree directory of its tree, so let's hit it.

<pre>
 landingpages git:feature/Symfony2 ✔  git pull --squash -s subtree --no-commit landingpagebundle master
From git.ormigo.net:landingpagebundle
 * branch            master     -> FETCH_HEAD
Squash commit -- not updating HEAD
Automatic merge went well; stopped before committing as requested
</pre>

According to git everything worked out fine, according to me, it did not:

<pre>
 landingpages git:feature/Symfony2 ✗ ≠+ git st                  ~/Ormigo/repository/landingpages
# On branch feature/Symfony2
# Changes to be committed:
#   (use "git reset HEAD &lt;file&gt;..." to unstage)
#
#	new file:   app/views/Controller/LandingpageController.php
#	new file:   app/views/DependencyInjection/LandingpageExtension.php
#	new file:   app/views/Landingpage/AbstractLandingpage.php
#	new file:   app/views/Landingpage/AbstractTwigLandingpage.php
#	new file:   app/views/Landingpage/Factory.php
#	new file:   app/views/Landingpage/LandingpageInterface.php
#	new file:   app/views/Resources/config/routing.yml
#	new file:   app/views/Resources/config/services.yml
#	new file:   app/views/Twig/FilesystemLoader.php
</pre>

Yes, those files should be gone into `src/Ormigo/Bundle/LandingpageBundle`.
So, let's reset this stage and try again:

* `git reset HEAD .`
* `rm -Rf app/views/Controller/ app/views/DependencyInjection app/views/Landingpage app/views/Resources app/views/Twig`

## The solution

What needs to be done is overwrite the "guess" of `git merge` where to put the files into, this can be achieved by adding a `strategy-option` telling it where base the files.

The command: `git merge --squash -s subtree -Xsubtree=src/Ormigo/Bundle/LandingpageBundle landingpagebundle/master`
If you want to do the pull command, it's quite similar: `git pull --squash -s subtree --no-commit -Xsubtree=src/Ormigo/Bundle/LandingpageBundle landingpagebundle master`

Let's take a look into the options set:

The important options is without a doubt: `-Xsubtree=`
This is the missing piece to tell the subtree merge where to base the tree to merge.

The other options have been explained in the [previous post], but one more is new here:
`--squash` does exactly what it names tell: It squashes commits. In this case all commits of the subtree repository will be squashed into one commit. This prevents blowing up the history of the project itself.
The differences in the resulting history are as follows.

<pre>
 landingpages git:feature/Symfony2 ✗ ≠ git ph                         ~/Ormigo/repository/landingpages
* 6e23b06 - (HEAD, feature/Symfony2) update LandingpageBundle (11 seconds ago) &lt;Toni Uebernickel&gt;
*   5470e58 - (origin/feature/Symfony2) add LandingpageBundle as subtree (25 hours ago) &lt;Toni Uebernickel&gt;
|\  
| * 6dee0ac - add empty LandingpageBundle (6 days ago) &lt;Toni Uebernickel&gt;
* 57c339c - add Symfony Light Edition (6 days ago) &lt;Toni Uebernickel&gt;
</pre>

<pre>
 landingpages git:feature/Symfony2 ✗ ≠ git ph                         ~/Ormigo/repository/landingpages
*   c94d016 - (HEAD, feature/Symfony2) update LandingpageBundle (14 seconds ago) &lt;Toni Uebernickel&gt;
|\  
| * 4db8fde - (landingpagebundle/master) add controller and routing for landingpage
| * dffe3f8 - add FilesystemLoader for Twig (2 hours ago) &lt;Toni Uebernickel&gt;
| * 91b1877 - add LandingpageInterface (2 hours ago) &lt;Toni Uebernickel&gt;
* |   5470e58 - (origin/feature/Symfony2) add LandingpageBundle as subtree (25 hours ago) &lt;Toni Uebernickel&gt;
|\ \  
| |/  
| * 6dee0ac - add empty LandingpageBundle (6 days ago) &lt;Toni Uebernickel&gt;
* 57c339c - add Symfony Light Edition (6 days ago) &lt;Toni Uebernickel&gt;
</pre>

[previous post]: /2012/02/13/Using-git-subtree-example-symfony2-bundle-on-cloudcontrol.html
[Ormigo]: https://ormigo.com