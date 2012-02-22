---
layout: post
title: "git rebase is not a lion, it's a cat - Part Two"
excerpt:
  The first part being an introduction to git rebase mechanics,
  this follow-up drives that introduction into real-world examples.
---

In the [previous post] we took a look at the basics of `git rebase`
The most important part we will take a deeper look in this part: The history will be re-written.
As mentioned in the previous post, this is not necessarily a bad thing.
To have a greater view, we need more repositories. We could also do it in one, but that would be an aweful overact.
The figure shows three repositories. One of them being the bare remote and two clones of that.
They are all on the same state, the repostiory we left off in the first part.

![Two repositories and their remote](/images/2012/02/git-rebase-4.png "Two repositories and their remote")

## Avoiding "merge bubbles"

Let's see what a `merge bubble` is. A very easy way to create one, is using `git pull --no-ff` every time. You will create merge commits that may have been avoided.

![Example merge bubble](/images/2012/02/git-rebase-5.png "Example merge bubble")

As you can see, both merge commits `ae43884` and `9fbfced` may have been avoided. You can push and pull this way infinitely without introducing any changes to your repository, isn't that great?
Let's see, how `git rebase` is a very handy tool here.
There are many merges that can be "fast-forwarded", which means they can be applied without creating a `merge commit`.
As the previous figure shows, the latest merge commit `9fbfced` has not been pushed to the remote repository.
The previous post mentions:

> You cannot push to a remote branch which `HEAD` was already on a commit that has been re-written by the `git rebase`!

We are not at that point, so we are good to go in re-writing history.
But, let's make this a bit more realistic by having the other repository pushed other changes, too.

![Example changes](/images/2012/02/git-rebase-6.png "Example changes")

## Using rebase prior pushing changes

The second repository has pushed its changes to the remote. When the first one tries this, the push will be rejected.
This happens because the most recent commit of it does not have the remotes `HEAD` in its tree. Namingly, it means `341c62e` is not a commit that has `c7878a6` as a (grand-)ancestor.
What could we do about this? Correct, we could `git pull` to retrieve the current tree from the origin. What do you think will happen here?
A new merge commit will be added. The two commits to be merged are the `HEAD` commits of both cloned repositories - `c7878a6` and `341c62e`, respectively.

![Example pull](/images/2012/02/git-rebase-6.2.png "Example pull")

Now that we have done this, it's not getting better. The keyword is `rebase`, who would have guessed?
Since the first repository didn't push its changes by now. We are still good to rebase and push afterwards.
We only need to know the most recent commit of the remote repository. We have pulled its state, so we already know it, it's `c7878a6`.
However you can issue `git show origin/master --oneline` to see the most recent commit your local repository is aware of the remote.
In order to update its knowledge, issue `git fetch origin` after that you can be sure about the result of `git show`.

When issuing `git rebase c7878a6` all goes well, our unnecessary merge commit `004fc7a` is not part of our branch anymore.
Now we are good to push our changes to the remote repository! The push won't be rejected, everything goes well. Successful rebase without breaking anything!

![Everything went well](/images/2012/02/git-rebase-7.png "Everything went well")

[previous post]: /2012/02/18/git-rebase-is-not-a-lion-it-is-a-cat-part-one.html
