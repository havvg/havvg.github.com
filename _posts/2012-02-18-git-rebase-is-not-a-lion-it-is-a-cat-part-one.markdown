---
layout: post
title: "git rebase is not a lion, it's a cat - Part One"
tags:
    - git
    - git-rebase
    - documentation
    - tutorial
excerpt: |
  There are many users out there being scared to use git rebase.
  To wrap things up, git rebase is not a lion that will hunt you down.

  It is a cat, it likes you, until you do something fancy and will hurt you once.
  You will know how to deal with the situation properly the next time - but give it a try.

  This post is about quelling some fears off those users - maybe you are one of them?
---

There are many users out there being scared to use git rebase.
To wrap things up, git rebase is not a lion that will hunt you down.

It is a cat, it likes you, until you do something fancy and will hurt you once.
You will know how to deal with the situation properly the next time - but give it a try.

## Commits will be lost

If you think, `git rebase` will erase commits (like in lost forever, right now), you are wrong. Let me prove that to you.

Let's start with an empty repository, create two branches within it, and merge them.

* `git init`
* `git add` and `git commit`
* `git branch develop`
* `git add` and `git commit`
* `git co master`
* `git merge --no-ff develop`

After those commands, you will have two branches (master and develop).
Each of them containing one commit adding something. The master branch also contains a special `merge commit` (a commit with more than one parent commit).

If we now rebase on the first commit, the history will be re-written.
This is the first thing to be fully aware of: **The history will be re-written.**
Which is no problem in itself. It will only hurt, when you try to push this new history into another repository which `HEAD` is pointing to a commit, the current tree does not contain anymore.

If you now check the history with `git log`, you will miss the merge commit and all commits have a different hash, all except the first one, you rebased to.
This is where the part of re-writing history is important to know. You can now - *without any problem* - push to any remote branch which `HEAD` is that exact commit or any past commit in its tree.
You **cannot** push to a remote branch which `HEAD` was already on a commit that has been re-written by the `git rebase`!

The commit you are missing in that log is not gone. It is there, if you try `git show <commit>` it will show you its content. You can also check it out `git checkout <commit>`.
See the following figure on how the history of the repository may look like.

![Setting up the repository](/images/2012/02/git-rebase-1.png "Setting up the repository")

## Reverting the rebase by updating the ref

This figure shows the current state of the repository after the rebase, with the "lost commit" checked out.

![Current history of the repository](/images/2012/02/git-rebase-2.png "Current history of the repository")

Let's assume we did that by accident and want to revert this. The master branch should look just like before that `git rebase`.

In order to do this, you have to understand what a `branch` is and what a `branch head` means.
Put simple, a `branch` is a list of commits each of them being a change up-on its previous commit or in case of a `merge commit` its previous commits.
The `branch head` is the most recent commit of the branch.

As we have seen, the commit is still there and we can check it out. The only thing that needs to be done, is to make that very commit the `branch head` of the `master` branch again.
It's only one command line to revert our basic rebase: `git update-ref refs/heads/master HEAD <merge commit>`. Now we have done very much, but nothing has changed!

![Updating the ref](/images/2012/02/git-rebase-3.png "Updating the ref")
