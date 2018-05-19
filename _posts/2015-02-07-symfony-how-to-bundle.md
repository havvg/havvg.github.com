---
layout: post
title: "Symfony: How to Bundle"
tags:
    - symfony
    - bundle
    - tutorial
    - how-to
---
Creating a bundle for Symfony is one of the most misunderstood topics. This topic is very old, but it got some tension in the recent past. I've been discussing this topic with several people using different channels for more than three years now. There are some blog postings out there based on those discussions.

Back then, just for the sake of "learning by doing", I created a bundle which is now available as [HavvgDRYBundle](https://github.com/havvg/HavvgDRYBundle). Over the time I decided to try a completely bundle-free edition and ended up with [a small sandbox](https://github.com/havvg/symfony-sandbox).

This posting is based on a "Lightning Rant" I did with [Marc Aschmann](https://marc-aschmann.de/) at the [Symfony Live Berlin 2014](https://berlin2014.live.symfony.com/) event. It was a decision of five minutes with nearly no preparations. It was provocative and cheeky. However I got quite some feedback on this rant from different companies and developers at the site, to explain in more details. Those discussions were awesome. I'm also holding a talk on this topic at Symfony meetups.

> There is a Bundle for that

While working with Symfony, you will hear this sentence a lot, and while true it's also the root of all evil. [Lukas Smith](https://twitter.com/lsmith) helds [a great talk](https://joind.in/talk/view/12584) with the same name. It's a wrap-up about what you can do with a bundle as it and continues on how to select a bundle for a concrete topic.  The talk is a must, so if you get the chance, get it! Another key aspect of the talk: do not rush into writing your own bundle. Get things sorted, look for solutions already out there and contribute, if those don't meet your requirements to 100%.

## Yet another Bundle

This posting refers to "Bundle" as any bundle, that is created within the "Acme" namespace, is project specific and not distributed among other projects. The easiest way you will identify those bundles: You don't require them like third-party bundles (e.g. using Composer).

The big challenge when dealing with the topic "Bundle" is the [Symfony documentation](https://symfony.com/doc/2.7/index.html) itself. It is a very good documentation and will provide anyone, who wants to use Symfony with any information necessary to get things rolling. However there are some common pitfalls that come with any documentation, no matter how good it is. The documentation is an abstract of what's actually possible. It provides the easiest way to achieve things and makes you reach your goal fast. In order to support you this way, it's a very simplified view on problems. It's the basic solution. It's use case specific and while backreferences exist, the documentation is not granting you the total view on everything. It focuses on a problem and discards other aspects for the sake of getting you on the spot and solving the specific issue. This often leads to wrongly applied patterns in applications using the Symfony framework. You should always question the documentation you are reading and consult other resources, too.

## Facing the Bundle

The following quotes are from the [Symfony Quicktour "The Architecture"](https://symfony.com/doc/2.7/quick_tour/the_architecture.html#understanding-the-bundle-system).

> **A bundle is kind of like a plugin in other software.** So why is it called a bundle and not a plugin? This is because **everything is a bundle in Symfony**, from the core framework features **to the code you write for your application**.

This is the most misunderstood paragraph in the Symfony documentation regarding how to structure your code! If you apply this to your application, you be coupled to a system. You will depend on constraints of the framework - or the edition you are using. You will most likely end up putting business logic into your bundle. There is one thing to keep in mind: Your application code is way more important than the code of the framework.

> All the code you write for your application is organized in bundles. In Symfony speak, **a bundle is a structured set of files** (PHP files, stylesheets, JavaScripts, images, ...) **that implements a single feature** (a blog, a forum, ...) and **which can be easily shared with other developers**.

This is the second paragraph of the architecture quicktour and it will make you think, you got the first paragraph right, as you might have created this "BlogBundle" and "CommentBundle". Let's face the key aspects. A structured set of files, including stylesheets, javascripts, images. You may refer to those as "assets". I don't see many valid applications for providing such assets within a bundle. This led to many bundles, that are plain wrong and unnecessary.

There are of course valid use cases. If you are about to create your own eco-system, like a set of bundles to create an ecommerce platform, such as [Sylius](https://github.com/Sylius/Sylius), providing features you can attach to your shop. Those bundles are perfectly valid to serve assets, just for the sake of providing "Look and Feel". Another valid part would be debugging tools to be used within the profiler.

If you are creating your own ecosystem, a framework to create a platform your software serves - bundles are one way to go. If you are creating a very specific application, that's not extensible as it - you won't need any bundle at all!

The third part of this paragraph is the key element when it comes down to creating a bundle. If the bundle you are about to create is not extensible, configurable or reusable - it's just not a bundle, it's part of your application or the integration of it into the framework. If you will not re-use the bundle in any way, don't create it at all.

> **Bundles are first-class citizens** in Symfony. This gives you the **flexibility to use pre-built features** packaged in third-party bundles **or to distribute your own bundles**. [..] And at the end of the day, your application code is just as important as the core framework itself.

There are plenty of bundles out there and there are also some great ones in existence. Basically there are two aspects of a software a bundle may provide:

* Infrastructure & Architecture
* Business Logic / Business Modelling

Infrastructural bundles extend the way of utilizing the Symfony framework with the key aspects of it, such as exporting routing information to a client side javascript application. Architectural bundles will provide you with abstractions of architectural choices that may change based on performance indicators, e.g. moving files from local to CDN by utilizing and integrating a filesystem abstraction layer or integrating an image processing library.

The kind of bundles you should consume with caution - the bad ones - are those modelling business. Any bundle enforcing you onto a business model is bad - period. Your business - you - are defining your business model!

## Software Architecture

This whole topic is about software architecture. I hear people saying "My new project will be built in Symfony." Most projects start with such a sentence. The majority of projects I've seen so far are so called "legacy applications" that have been built for the last five to ten years. The developers back then may not be around anymore. The patterns are bad, the software is fragile and there is more time investment on maintenance than on getting more business value out of it.

So, there is the current team of developers, who are choosing Symfony as their framework of choice and start building the new version, completely free from any technical debt the legacy codebase contains. They are reading the first parts of the documentation and get started. Based on the documentation they will start creating bundles all over the place. Those bundles are bound to the application and they will be circular dependencies on the bundles eliminating the sake of the bundles in the first place completely.

One or two years later, they realize a common pitfall to be part of their software: "I got the model X, which somehow is connected to bundle A, but also bundle B - where should a put it?" If you are asking a similar question in your software project, you have failed in building a maintainable software and will end up with a "legacy codebase" soon - one using Symfony.

It's not the framework that will make the new software better. Yes, it gives you a fresh start, if your business can afford it. The only thing you are granted is another chance, not a silver bullet. The software is built by developers and it will only be as good as those developers. It doesn't matter, whether you are using Symfony or any other framework. It doesn't matter you are establishing agile development. All that matters: the people working on the project and their understanding of (object oriented, functional, aspect oriented, ..) programming and building maintainable software by applying known pattern at the right places. The key aspect you should look for is the awareness of software architecture and how to build extensible, maintainable and stable software.

### Three Layer of Application

Utilizing a framework in any kind of application is creating a basic three layer architecture.

#### Business Model

The base layer and thus the greatest, the only static layer your software defines, is the "Business Model" or "Business Logic". That's the software your business generates. It defines the domain itself, its constraints, its language - everything. There is no routing. There are no bundles. There is no framework! It's your domain of interdependent models defining the business value by applying rules defined by the business itself.

#### Framework

On the other side there is a framework, in our case it's Symfony. This framework provides you with solutions and a way to apply those solutions in order to supply a web interface to consume your application in a shared state. You will be given tools to easily define interaction endpoints (Controller + Routing) with your domain. You have a ready-to-use security layer providing authentication and authorization capabilities. You have a set of components wired gently to save you time building this interface. That's it - a framework. Just another building block, but it is never the foundation of your software.

#### Integration

The last and the smallest layer is defined as "Integration Layer". This skinny layer is the glue code between your business model, the libraries you utilize, the components you created and the Symfony framework. This is where bundles are meant to be. They provide meta data and configuration to integrate your software with the framework to make it easier to utilize the systems the framework provides.

## No bundle is also no solution

You may think, this post is about avoiding bundles completely. That's not what this is all about. It's all about delivering maintainable software. If you would remove all "Acme" bundles from your project - and the easiest way would be to make your service definitions and templates and other resources part of the application (read: put them in app/ instead of a bundle). As a reference you can take a look into [the sandbox](https://github.com/havvg/symfony-sandbox) I mentioned.

Why are people tending to create multiple bundles in their application? It's an illusion of decoupling! If you truely have bundles, that you are actually disabling on given parameters, those bundles are completely fine. If you got more than one bundle, that are all active and you are not able to disable one without disabling another and the other way around, you got interdependent bundles already. There is absolutely no use to them.

If you want to verify a bundle qualifies for being a bundle, there are three key aspects to take into account. The bundle in question should provide configuration. The smallest piece of configuration would be the ability to disable the bundle and "everything" works fine (of course without the functionality this bundles integrates). A good hint may be a non-existent "DependencyInjection" directory and an empty bundle class. If you cannot re-use the bundle in other applications, even within your company space, you should remove or merge it.

The worst kind of a bundle, you could have created is a bundle containing the business logic of your application, e.g. containing the model. It's just a place to have the classes, but if you got this part wrong chances are, your architecture has other defects, too. The bundle namespace is considered an integration namespace. There is nothing more than glue code, configuration and framework specifics.

Removing all bundles completely is a tedious amount of work with no real benefit. You will be required to create utilities to work around a problem you are creating by removing the bundles. I suggest to try this. Remove any bundle, and try to solve the problems that you encounter. There is only one business value to this: you will learn more about the framework and the way its internals work and interact.

My suggestion would be creating one bundle to integrate your application with the framework - "AppBundle". It's the easiest way to go, and by having only one bundle it will save you much time as you don't have decisions to make like "Another bundle, or X, or Y?" - extend the configuration of the bundle to propagate your systems into the framework utilities.

A few months ago the ["Best Practices"](https://symfony.com/doc/current/best_practices/index.html) have been released and beside the rage on the release management and its initial content raised in the community. I second roughly 25% of the best practices mentioned. However there is one point they got finally right.

> **Create only one bundle called AppBundle** for your application logic.

One AppBundle - but please **do not put your application logic in there**!
