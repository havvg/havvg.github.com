---
layout: post
title: "Github:Pages with Jekyll"
tags:
    - github-pages
    - jekyll
excerpt: |
  Finally, my blog is now on [github:pages]!
  [github:pages]: http://pages.github.com
---

Finally, my blog is now on [github:pages]!

Making this decision has its root long time ago. I didn't want to use Wordpress anymore. It's too much secondary work for me like updating the installed software, maintaining broken plugins, fixing stylesheets for special purposes and so on. Since then I wanted to have a very simple way to publish new content.

* add a new file
* commit and push it
* There should *not* be any third step!

At first look, I wanted to code such an application myself; well, I didn't! Now this website is powered by [Jekyll], [Liquid] and hosted on [github:pages].

I'm very lazy on the port, so old links won't work anymore and are cought by a nice 404 page pointing to the archive.

## Drafts in Jekyll

There is no way to have drafts in [Jekyll] by now. I can't use a custom fork, as github is hosting the site. However, there is at least one solution to this problem: `.gitignore`.

I have added the line `_posts/*.draft.*` to the project's `.gitignore`. Yes, there is `published: false` configurable on each post. But in a hurry, would you change this flag back or accidentally commit the new post `published: true` because you were reviewing your upcoming post?

On my local machine I have `jekyll --no-lsi --auto` running. This will automatically regenerate content on file changes. By having the gitignore in place, I can't commit a new post's file, that follows the naming convention of `year-month-day-your-title.draft.extension`.

### Versioning drafts

If you want to have your drafts versioned, add a folder like `_drafts` add your draft there and create a file link to it in `_posts`, so you will be able to see it locally, but it's not published on production.

Assume, you have this file `_drafts/2011-10-30-github-pages-with-jekyll.markdown`. Issuing this command line will add a post that will be published locally: `ln _drafts/2011-10-30-github-pages-with-jekyll.markdown _posts/2011-10-30-github-pages-with-jekyll.draft.markdown`.

## Combining multiple CSS files

I like to have my CSS some sort of separated. However it should be only one file in the end, that's requested by the browser. It's pretty easy to have this task solved. As you include files like header and footer on your website, you can use the same mechanism to include multiple files into your resulting stylesheet file. It's important to deactivate any layout for this file using `layout: ~` in the [YAML Front Matter].

I have created a separate folder under the `_includes` folder, where my CSS files are saved. Then there is only one `stylesheet.css` which includes every single one of them in the root directory. This file is parsed as any other file!

## Generating a sitemap

Generating a sitemap is not as easy as the stylesheet file. The greatest difference is the more complex use of [Liquid]. The first thing you want to have in your sitemap: your posts. That's an easy loop over the built-in global variable `site.posts`.

The same method can be used to put all pages in your sitemap, too. But your 404 page, the stylesheet file and many other files should not be listed there. In order to get only pages you actually want in your sitemap, you have to somehow configure the content. I added a `sitemap` item to each page's configuration, to mark it for listing in the sitemap and provide the values for its entry. Now I can loop on `site.pages` and only include those pages!

An [example sitemap] is available on github, so is an [example configuration].

[github:pages]: http://pages.github.com
[Jekyll]: https://github.com/mojombo/jekyll/
[Liquid]: http://liquidmarkup.org/
[YAML Front Matter]: https://github.com/mojombo/jekyll/wiki/YAML-Front-Matter
[example sitemap]: https://github.com/havvg/havvg.github.com/blob/master/sitemap.xml
[example configuration]: https://github.com/havvg/havvg.github.com/blob/master/archive.html
