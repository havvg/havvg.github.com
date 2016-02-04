---
layout: post
title: How to combine git and cloudControl using github
tags:
    - git
    - github
    - cloudcontrol
    - documentation
    - tutorial
excerpt: |
  ## What is git? – The short version.

  Git is a distributed version control system (VCS). What does “distributed” mean in this case? It means, that there is no “server” as in other VCS like subversion. The repository will be transferred as it to any other user who has access to it – including the complete history.

  ## What is github? – A small overview.

  Github is a web based service to manage git repositories in a social way. You can create new repositories, fork others, modify the codebase and send your changes back. There are many more very cool features, but we keep it here for now.

  ## What is cloudControl? – A PHP PaaS!

  Yes, that’s it: a great PHP platform as a service (PaaS) on top of Amazon Web Services. You will have your php application deployed on multiple machines with a single command. There are plenty of add-ons available such as worker processes, MySQL database, MongoDB and memcached to name a few.
---
# Requirements

This is the list of requirements to get this tutorial done.

* a working cloudControl account
* an active github account
* cctrlapp installed
* git installed
* UNIX based operating system

There are plenty of tutorials how to get these things up, so we skip it here completely.

# The environment – What do we use?

## What is git? – The short version.

Git is a distributed version control system (VCS). What does “distributed” mean in this case? It means, that there is no “server” as in other VCS like subversion. The repository will be transferred as it to any other user who has access to it – including the complete history.

## What is github? – A small overview.

Github is a web based service to manage git repositories in a social way. You can create new repositories, fork others, modify the codebase and send your changes back. There are many more very cool features, but we keep it here for now.

## What is cloudControl? – A PHP PaaS!

Yes, that’s it: a great PHP platform as a service (PaaS) on top of Amazon Web Services. You will have your php application deployed on multiple machines with a single command. There are plenty of add-ons available such as worker processes, MySQL database, MongoDB and memcached to name a few.

# Getting started
Knowing your environment is essential, but now let’s get started.

## Set up a new project locally

Here are the very basic steps to get a new project set up locally. We call the example project “githubcctut” for github cloudControl tutorial.

```bash
  $ mkdir githubcctut
  $ cd githubcctut/
```

We now got an empty folder, where our source code and other files will be put into. Using `git init` we will make this empty folder a new git repository. This repository now only contains one branch “master”, the default.

Let’s create a basic README file using `touch README`, add information about the project to it and add to git using `git add README`. Afterwards the README can be committed in its current state using `git commit README`. Enter a friendly and useful commit message, you are done.

### How to: git commit message

There are best practices on how to write a commit message in sense of grammar and such. However there are some rules, that will be used by many tools, being it web based such as github or desktop applications like [Tower].

* The first line of the commit message is limited to *49 characters*.
* The second line is blank.
* The third line and any following lines are considered detail information on the changes introduced by this commit.

In other words, to quote the manual itself.

> Though not required, it’s a good idea to begin the commit message with a single
> short (less than 50 character) line summarizing the change, followed by a blank
> line and then a more thorough description. Tools that turn commits into email, for
> example, use the first line on the Subject: line and the rest of the commit in the
> body.

## Delivering changes

Now that we got our first commit, containing a message describing it and the actual changes, it is time to deliver this to someone else. The easiest way is to set up a remote repository that is available any time. This may be considered a “server” for now.

Having a github account set up, we can just go and [create a new repository] right away. Enter a project name and you are done. Having this done, there is a help being displayed, telling you how to set things up.

As we already have a local repository, we can just add the remote repository using `git remote add origin ...`. Now our local repository knows that there is another one, that is related to it and where it can fetch changes from or push them to. The github repository is empty right now, so we will send our current commit to the remote using `git push -u origin master`.

`git push` sends changes to any remote as configured. The -u flag tells git to set up a “tracking” between the local branch called “master” and the branch “master” on the github repository. In order to retrieve changes from the remote you can just fire `git pull`. Right now, this will tell you, that it’s already up-to-date.

## Adding more developers

A new developer may want to join your project. He will then clone your project (or fork it on github) using `git clone`. This mirrors the state of the repository to a new local repository on the developers machine. He can now add changes and push them over to any repository he has access to. Changes on forked github repositories will be provided as a “Pull Request”, which you – as the owner – may modify, accept or decline.

# Deliver to cloudControl

## Setting up an application

It’s pretty damn simple to create a new application on cloudControl using the `cctrlapp githubcctut create --repo git php` command line. Unfortunately the “githubcctut” is not available to you, so choose any name, you like :) Afterwards you can check the existence using `cctrlapp githubcctut details`. This will show you some information on your new application. The required one for the next step is the repository url.

## Setting up git

In order to deliver your application to cloudControl and let the platform handle the deployment of your application, you have to provide it with your source code.

We set up a new remote repository as we did for github: `git remote add cloudcontrol ssh://githubcctut@cloudcontrolled.com/repository.git`

## Deploy the app

Now that our local repository knows about the cloudControl repository (which is empty right now), we can send our changes with `git push cloudcontrol master`.

The remote repository on cloudControl now has the master branch the same way, it was committed on the local repository.

Now it’s time to deploy it. Check `cctrlapp githubcctut/default details` for information on the default deployment (which is in fact the master branch). The current state will show up as “not deployed”. Fire up `cctrlapp githubcctut/default deploy`, wait a couple of seconds and hit the details command again.

The current state has changed to “deployed” making our application available on the [githubcctut.cloudcontrolled.com domain].

After further modifications, you can issue `git push` which will send the changes only to the github remote. If you want to send those changes to cloudControl and deploy them, you have to use `git push cloudcontrol`.

# Tips on ~/.gitconfig

Git uses several files to set up the configuration being used. Create a .gitconfig file in your home directory to modify the behavior of git as you need it, here are some useful entries.

## Know who you are

To set your name and email on your git environment add:

```ini
[user]
name = Your Full Name
email = yourmail@host.com
```

## Sending changes

As git will send changes on any branch, it might be useful, to control what will be sent. The following lines will tell git to only push changes to the remote repositories that are set up as “tracking” when issuing `git push` without any more arguments.

```ini
[push]
default = tracking
```

## Excluding system specific files

You can create a list of files that will be ignored by git. This list is saved in the .gitignore file in any folder of the repository. In addition to the repository and its project or language specific ignore list, you may have a system or user specific list of files to be ignored on all of your repositories. This file can be published to git using these lines.

```ini
[core]
excludesfile = ~/.gitignore
```

The content of the file mentioned is a list (line based) of regular expressions of files to be ignored.

## github integration

Applications – such as the previously mentioned Tower – make use of the following lines.

```ini
[github]
user = YourAccountName
token = YourApiToken
```

You can retrieve the token on the admin interface of your github account.

## git aliases

Setting up shorter aliases may be helpful. Here is a sample list for users who are familiar with subversion.

```ini
[alias]
st = status
ci = commit
co = checkout
di = diff
```

[Tower]: http://www.git-tower.com/
[create a new repository]: https://github.com/repositories/new
[githubcctut.cloudcontrolled.com domain]: http://githubcctut.cloudcontrolled.com/README
[the admin interface of your github account]: https://github.com/account/admin
