---
layout: post
title: ORM Designer
excerpt: |
  I were asked to take a look into [ORM Designer by Inventic s.r.o.](http://www.orm-designer.com/ "Website of ORM Designer") two weeks ago. I tested the software and here is my little piece of review as a developer.
---
I were asked to take a look into [ORM Designer by Inventic s.r.o.](http://www.orm-designer.com/ "Website of ORM Designer") two weeks ago. I tested the software and here is my little piece of review as a developer.

## Disclaimer

Everything I am talking about is related to the usage of ORM Designer for symfony with Propel.

## Design and User Interface

The design is very clean, you won't get distracted by some crazy special effects nobody needs for production work. However the user interface is not that straight forward. There are several things I could mention.

### Tab Key

The most annoying thing was the tab-ability. I don't want to use the mouse for all things, so tab is the most important key that should be supported by a tool I want to work with. To get a real scenario with this one: open a project, create a module and add a new entity to it. The window that will open is focused on the name of the new entity, which is pretty much the best place to start. Use the tab key to get into the description of it and afterwards to set up the correct module, if you have started in the wrong one. When focused on the location field, press tab again - you are out. I didn't found any way to get the tab somewhere further.

However there are several shortcuts active, so use insert key to add a new field. The name will be focused. It's tabbing fine until you reach the PK flag. You're out - again! OK, you can use arrow keys and space and enter to get working. So you would get all the work done there, try to change the editor to get on the "Indexes" tab. No way for this, at least not without clicking. Properties panel doesn't work either :-)

### Entity Relationship Diagram

The complete ERD looks pretty. By default the chosen colors are just fine, not that colorful to be distracted but light ones to get the modules separated in the view.

## Logical Separation and Grouping

The ORM Designer makes it pretty easy to work. There are no more strange abstractions, but it's ready for real world usage. Entities are the basis of your ORM. They are the classes and tables and are displayed like UML class diagrams. A group of entities is called a region which will be displayed as a rectangle similar to the UML diagram boundaries. The final group is a group of regions or entities, they are called modules which reflect your projects or e.g. a plugins schema. Pretty easy to understand in sense of application development!

## Importing Existing Projects

This is another part I have to admit: There are some features required. On some projects I am putting the schema definition into separated files. When I first started with ORM Designer I just wanted to import a project and wanted to see how to work with it. Well, I could not import any \*\_schema.yml file. Afterwards I took a look into the exported files, they use an other notation within the Yaml files. Here are the different notations, to get this clear.

{% highlight yaml %}
mcx-users:
  _attributes: { package: lib.model.user }
  user_profile:
    _attributes: { phpName: sfGuardUserProfile }
    id: ~
    user_id: { type: integer, foreignTable: sf_guard_user, foreignReference: id, required: true, onDelete: cascade }
    email: { type: varchar(255), index: unique }
    created_at: ~
{% endhighlight %}

{% highlight yaml %}
mcx-users:
  _attributes:
    package: lib.model.user
  user_profile:
    _attributes:
      phpName: sfGuardUserProfile
    id: ~
    user_id: 
      type: integer
      foreignTable: sf_guard_user
      foreignReference: id
      required: true
      onDelete: cascade
    email: 
      type: varchar(255)
      index: unique
    created_at: ~
{% endhighlight %}

The first one is the one of my project, the second is the one ORM Designer uses. These inline dictionaries using curly brackets seem to be the problem, I guess.

## Do Not Repeat Yourself &#038; Not Invented Here

What I really like about ORM Designer the same way I like about using plugins and external libraries: using them. I created the module for the sfGuardPlugin for symfony - once. You can export the result, you can import an existing ORM Designer project into. It's a linked resource. Changing something in the linked one (e.g. a plugin) will be shown in the project which is linking. That's the way it's meant to be!

## Conclusion: Use it?

I won't use ORM Designer right now. For my setup (symfony + propel) it does not support enough and I have to do much work by myself again, here is a list of features I would request to get started to work with ORM Designer in production. Currently I am much faster writing the \*\_schema.yml by myself.

- Support for Behaviors for Propel ORM
- Support for any Yaml notation
- Ability to export a module as a separate ORM Designer project
- Configuration of default settings of entity fields based on naming conventions (similar to "id: ~" in schema.yml)
- Mac OS X support without X11 and/or wine - saying: native support (cocoa)
