---
layout: post
title: single table inheritance pattern in symfony using propel
excerpt: |
  Rails is doing it, Java is doing it very similar, you can do it in symfony, too: make use of the [Single Table Inheritance pattern](http://en.wikipedia.org/wiki/Single_Table_Inheritance "Single Table Inheritance - Wikipedia, the free encyclopedia").
---
Rails is doing it, Java is doing it very similar, you can do it in symfony, too: make use of the [Single Table Inheritance pattern](http://en.wikipedia.org/wiki/Single_Table_Inheritance "Single Table Inheritance - Wikipedia, the free encyclopedia").

## What's STI?

Wikipedia, the free encyclopedia:
> Single table inheritance is a way to emulate object-oriented inheritance in a relational database. 

Let's say you got two models having the same properties and you want to save them in the same table. The example below takes a simple entry/comment relation. An entry may actually be a post or a comment on this post, the schema.yml would look like this.

```yaml
propel:
  entries:
    _attributes: { phpName: Entry }
    id: ~
    title: { type: varchar(255), required: true }
    body: { type: longvarchar, required: true }
    author_id: { type: bigint, required: true, index: true }
 
  comments:
    _attributes: { phpName: Comment }
    id: ~
    title: { type: varchar(255), required: true }
    body: { type: longvarchar, required: true }
    author_id: { type: bigint, required: true, index: true }
```

Using propel:build-model will generate you the models for comments (Comment, CommentPeer ..) and the same for entries (Entry, EntryPeer ..).

## The database

```sql
# This is a fix for InnoDB in MySQL >= 4.1.x
# It "suspends judgement" for fkey relationships until are tables are set.
SET FOREIGN_KEY_CHECKS = 0;
 
#-----------------------------------------------------------------------------
#-- entries
#-----------------------------------------------------------------------------
 
DROP TABLE IF EXISTS `entries`;
 
 
CREATE TABLE `entries`
(
	`id` INTEGER  NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255)  NOT NULL,
	`body` TEXT  NOT NULL,
	`author_id` BIGINT  NOT NULL,
	PRIMARY KEY (`id`),
	KEY `entries_I_1`(`author_id`)
)Type=InnoDB;
 
#-----------------------------------------------------------------------------
#-- comments
#-----------------------------------------------------------------------------
 
DROP TABLE IF EXISTS `comments`;
 
 
CREATE TABLE `comments`
(
	`id` INTEGER  NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255)  NOT NULL,
	`body` TEXT  NOT NULL,
	`author_id` BIGINT  NOT NULL,
	PRIMARY KEY (`id`),
	KEY `comments_I_1`(`author_id`)
)Type=InnoDB;
 
# This restores the fkey checks, after having unset them earlier
SET FOREIGN_KEY_CHECKS = 1;
```

Above you can see, how the generated SQL using propel:build-sql looks like. In our example we will modify this SQL a bit. We remove the comments part completely. The SQL should now look like this (incomplete).

```sql
DROP TABLE IF EXISTS `entries`;
 
CREATE TABLE `entries`
(
	`id` INTEGER  NOT NULL AUTO_INCREMENT,
	`title` VARCHAR(255)  NOT NULL,
	`body` TEXT  NOT NULL,
	`author_id` BIGINT  NOT NULL,
	PRIMARY KEY (`id`),
	KEY `entries_I_1`(`author_id`)
)Type=InnoDB;
```

Using propel:insert-sql should only create the entries table. To make this example easier, we will generate the admin module with propel using propel:generate-admin as follows.

```bash
$ php symfony propel:generate-admin --module="adminEntries" backend Entry
```

Add some entries using this admin module, also add some comments and mark them e.g. \[Comment\] in the title or something else.

## The model

The way propel handels the relation between your model and which table is used for it, is pretty easy. The BaseCommentPeer class has a property TABLE_NAME, by overwriting this and all of the attributes column names in the inherited class CommentPeer you got all you needed!

```php
<?php
 
class CommentPeer extends BaseCommentPeer
{
	/** the default database name for this class */
	const DATABASE_NAME = 'propel';
 
	/** the table name for this class */
	const TABLE_NAME = 'entries';
 
	/** A class that can be returned by this peer. */
	const CLASS_DEFAULT = 'lib.model.Comment';
 
	/** The total number of columns. */
	const NUM_COLUMNS = 4;
 
	/** The number of lazy-loaded columns. */
	const NUM_LAZY_LOAD_COLUMNS = 0;
 
	/** the column name for the ID field */
	const ID = 'entries.ID';
 
	/** the column name for the TITLE field */
	const TITLE = 'entries.TITLE';
 
	/** the column name for the BODY field */
	const BODY = 'entries.BODY';
 
	/** the column name for the AUTHOR_ID field */
	const AUTHOR_ID = 'entries.AUTHOR_ID';
 
	/**
	 * holds an array of fieldnames
	 *
	 * first dimension keys are the type constants
	 * e.g. self::$fieldNames[self::TYPE_PHPNAME][0] = 'Id'
	 */
	private static $fieldNames = array (
		BasePeer::TYPE_PHPNAME => array ('Id', 'Title', 'Body', 'AuthorId', ),
		BasePeer::TYPE_STUDLYPHPNAME => array ('id', 'title', 'body', 'authorId', ),
		BasePeer::TYPE_COLNAME => array (self::ID, self::TITLE, self::BODY, self::AUTHOR_ID, ),
		BasePeer::TYPE_FIELDNAME => array ('id', 'title', 'body', 'author_id', ),
		BasePeer::TYPE_NUM => array (0, 1, 2, 3, )
	);
 
	/**
	 * holds an array of keys for quick access to the fieldnames array
	 *
	 * first dimension keys are the type constants
	 * e.g. self::$fieldNames[BasePeer::TYPE_PHPNAME]['Id'] = 0
	 */
	private static $fieldKeys = array (
		BasePeer::TYPE_PHPNAME => array ('Id' => 0, 'Title' => 1, 'Body' => 2, 'AuthorId' => 3, ),
		BasePeer::TYPE_STUDLYPHPNAME => array ('id' => 0, 'title' => 1, 'body' => 2, 'authorId' => 3, ),
		BasePeer::TYPE_COLNAME => array (self::ID => 0, self::TITLE => 1, self::BODY => 2, self::AUTHOR_ID => 3, ),
		BasePeer::TYPE_FIELDNAME => array ('id' => 0, 'title' => 1, 'body' => 2, 'author_id' => 3, ),
		BasePeer::TYPE_NUM => array (0, 1, 2, 3, )
	);
}
```

Now the comments are mapped to the entries table in the database. So let's test it.

```php
<?php
 
require_once(dirname(__FILE__) . '/../bootstrap/unit.php');
 
$configuration = ProjectConfiguration::getApplicationConfiguration('frontend', 'test', true);
$dbManager = new sfDatabaseManager($configuration);
 
$limeTest = new lime_test(12, new lime_output_color());
 
// we'll save the ids so we know them
$entryIds = array();
$commentIds = array();
 
// first add some test entries
$entry = new Entry();
$entry->setAuthorId(0);
$entry->setBody('This is the first test entry.');
$entry->setTitle('First Test Entry');
$limeTest->is($entry->save(), true, 'Added first test entry.');
$entryIds[] = $entry->getId();
 
$entry = new Entry();
$entry->setAuthorId(0);
$entry->setBody('This is the second test entry.');
$entry->setTitle('Second Test Entry');
$limeTest->is($entry->save(), true, 'Added second test entry');
$entryIds[] = $entry->getId();
 
// add some test comments
$comment = new Comment();
$comment->setAuthorId(0);
$comment->setBody('This is the first test comment.');
$comment->setTitle('First Test Comment');
$limeTest->is($comment->save(), true, 'Added first test comment.');
$commentIds[] = $comment->getId();
 
$comment = new Comment();
$comment->setAuthorId(0);
$comment->setBody('This is the second test comment.');
$comment->setTitle('Second Test Comment');
$limeTest->is($comment->save(), true, 'Added second test comment');
$commentIds[] = $comment->getId();
 
 
// get the entries back
$entries = EntryPeer::retrieveByPKs($entryIds);
 
/* @var $eachEntry Entry */
foreach ($entries as $eachEntry)
{
	$limeTest->isa_ok($eachEntry, 'Entry', 'Entry OK: ' . $eachEntry->getId());
}
 
$comments = CommentPeer::retrieveByPKs($commentIds);
 
/* @var $eachComment Comment */
foreach ($comments as $eachComment)
{
	$limeTest->isa_ok($eachComment, 'Comment', 'Comment OK: ' . $eachComment->getId());
}
 
$fakeEntries = EntryPeer::retrieveByPKs($commentIds);
foreach ($fakeEntries as $eachEntry)
{
	$limeTest->isa_ok($eachEntry, 'Entry', 'Entry OK: ' . $eachEntry->getId());
}
 
$fakeComments = CommentPeer::retrieveByPKs($entryIds);
foreach ($fakeComments as $eachComment)
{
	$limeTest->isa_ok($eachComment, 'Comment', 'Comment OK: ' . $eachComment->getId());
}
```

Now you can call the unit test using the following command line.

```bash
$ php symfony test:unit EntriesComments
```

The result should like this:

<pre>
1..12
ok 1 - Added first test entry.
ok 2 - Added second test entry
ok 3 - Added first test comment.
ok 4 - Added second test comment
ok 5 - Entry OK: 21
ok 6 - Entry OK: 22
ok 7 - Comment OK: 23
ok 8 - Comment OK: 24
ok 9 - Entry OK: 23
ok 10 - Entry OK: 24
ok 11 - Comment OK: 21
ok 12 - Comment OK: 22
 Looks like everything went fine.
</pre>

## What's next?

Well these are the basics how to use the Single Table Inheritance in symfony using propel. You can now implement certain model based features as usual, but remember you are now using the same database table for both classes. The next step could be using a generalized table and two specialized ones referring to the general one each, so you got real STI.
