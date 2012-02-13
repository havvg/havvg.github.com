---
layout: post
title: "Using git-subtree: Example adding Symfony2 bundle on cloudControl"
excerpt: |
  Let's say you got your closed source project built on Symfony2.
  Let's further say you are a proud customer of cloudControl.
  Third assumption: You have not only one project, but two and those are sharing a closed source bundle.
  
  See how to use `git-subtree` to add the shared bundle to both projects and having the bundle in a separate repository.
---

If you don't have, imagine:

* You have got two applications built on [Symfony2].
* Both of those applications are deployed on [cloudControl].
* Both applications share one or more bundles you have written.
* All repositories are closed-source (Yes, those exist!).

## The Setup

* We got our first application on the remote repository `git@git.localdomain:application-a.git`.
* We have another application on the remote repository `git@git.localdomain:application-b.git`.
* We have the shared bundle on the remote repository `git@git.localdomain:shared-bundle.git`.
* The shared bundle will be put on the `src/Acme/SharedBundle/` directory.

As you can see, if you add the shared bundle to both repositories as `git submodule` a deploy on `cloudControl` would fail, as the deploying server cannot access the remote of the submodule.
That's why you could make use of `git-subtree` to share the code on both repositories and thus having it accessible on `cloudControl`.

## Add the shared bundle

We will add the shared bundle on the first application `application-a` as a subtree. There are only four steps required to make it work.

### Configure the remote

The first step is registering the remote of the shared bundle on the repository of `application-a`.
This is done by issuing `git remote add -f shared-bundle git@git.localdomain:shared-bundle.git`.

The command will add a new remote (like `origin` or `upstream`) with the name `shared-bundle` and the given repository.
The `-f` option tells git to do a `fetch` right away, so the local repository is up-to-date.

### Merge the bundle

Now that git knows about the remote and therefore all of its content we proceed by actually applying the code,
by using `git merge -s ours --no-commit shared-bundle/master`.

This tells git to `merge` the branch `master` of the `shared-bundle` into the `application-a`.
The merge strategy in use `ours` ensures no files will be actually added now.
The `--no-commit` option stops right before the merge commit would be created.

Now that the commits of the `shared-bundle/master` are available, we are good to read the tree of the branch into the tree of `application-a`.
This is done by issuing `git read-tree --prefix=src/Acme/SharedBundle/ -u shared-bundle/master.`
Now the tree of the shared bundle is available in the index of `application-a`.
It appears as a branch that has no parent in the current tree, which is correct.

The last required step is the actual commit of the staging area (the subtree): `git commit`.

### Updating the bundle

After changing the `shared-bundle` you only need to issue `git pull -s subtree shared-bundle master`.
This will apply the changes and a merge commit will be created. If you don't want an automatically created merge commit, add the `--no-commit` option again.

## History

Let's take a look at the history of this subtree merge on `application-a`.

<pre>
*   66815de - (HEAD, master) Merge branch 'master' of git@git.localdomain:shared-bundle.git into master 
|\  
| * 25f6757 - (shared-bundle/master) add empty README
* |   bcd30d9 - Merge remote-tracking branch 'shared-bundle/master' into master
|\ \  
| |/  
| * 6dee0ac - add empty SharedBundle
* 938473b - a commit before adding the subtree
</pre>

As you can see, the tree of `6dee0ac` (the first commit in `shared-bundle/master`) has no parent in the `application-a` tree `938473b`.
`bcd30d9` is the result of the `git commit` after `git read-tree` which merged both trees (`6dee0ac` under the prefix directory and `938473b`).
`25f6757` is a commit in `shared-bundle/master` which is merged by the `66815de` commit using `git pull`.

[Symfony2]: http://symfony.com
[cloudControl]: https://www.cloudcontrol.com/
