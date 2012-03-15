---
layout: post
title: "An example of Symfony2 CollectionType form field prototype"
excerpt: |
  While working an a multi-step form with multiple `CollectionType` in it, I came across the issue requiring a generic solution for handling `allow_add` and `allow_delete` on a collection.
  As there is no entry on the `allow_delete` part in the Symfony2 documentation itself, this solution may not be the best way to do it.
  If you got other solutions on this topic, let me know!
templates:
  macro: |
    {% macro widget_prototype(widget, remove_text) %}
        {% if widget.get('prototype') %}
            {% set form = widget.get('prototype') %}
            {% set name = widget.get('prototype').get('name') %}
        {% else %}
            {% set form = widget %}
            {% set name = widget.get('full_name') %}
        {% endif %}
    
        <div data-content="{{ name }}">
            <a class="btn-remove" data-related="{{ name }}">{{ remove_text }}</a>
            {{ form_widget(form) }}
        </div>
    {% endmacro %}
  post_type: |
    <?php
    
    namespace Acme\Bundle\BlogBundle\Form\Type;
    
    use Symfony\Component\Form\FormBuilder;
    use Symfony\Component\Form\AbstractType;
    
    class PostType extends AbstractType
    {
        public function buildForm(FormBuilder $builder, array $options)
        {
            $builder
                ->add('title')
                ->add('content', 'textarea')
                ->add('tags', 'collection', array(
                    'type' => new TagType(),
                    
                    'allow_add' => true,
                    'allow_delete' => true,
                    
                    'prototype' => true,
                    'prototype_name' => 'tag__name__',
                    'options' => array(
                        // options on the rendered TagTypes
                    ),
                ))
            ;
        }
        
        public function getName()
        {
            return 'post';
        }
    }
  tag_type: |
    <?php
    
    namespace Acme\Bundle\BlogBundle\Form\Type;
    
    use Symfony\Component\Form\FormBuilder;
    use Symfony\Component\Form\AbstractType;
    
    class TagType extends AbstractType
    {
        public function buildForm(FormBuilder $builder, array $options)
        {
            $builder->add('name');
        }
        
        public function getName()
        {
            return 'tag';
        }
    }
  usage: |
    <form action="{{ path('add_post') }}" method="POST">
        {{ form_errors(form) }}
        <fieldset>
            <legend>Add a new post</legend>
            {{ form_row(form.title) }}
            {{ form_row(form.content) }}
            
            <div id="post_tags" data-prototype="{{ _self.widget_prototype(form.tags, 'Remove tag')|escape }}">
                {% for widget in form.tags.children %}
                    {{ _self.widget_prototype(widget, 'Remove tag') }}
                {% endfor %}
            </div>
            
            <a class="btn-add" data-target="post_tags">Add tag</a>
        </fieldset>
        
        {{ form_widget(form._token) }}
        
        <input type="submit" value="Add post" />
    </form>
  javascript: |
    $('.btn-add').click(function(event) {
        var collectionHolder = $('#' + $(this).attr('data-target'));
        var prototype = collectionHolder.attr('data-prototype');
        var form = prototype.replace(/__name__/g, collectionHolder.children().length);
    
        collectionHolder.append(form);
    
        return false;
    });
    $('.btn-remove').live('click', function(event) {
        var name = $(this).attr('data-related');
        $('*[data-content="'+name+'"]').remove();
    
        return false;
    });
---

{{ page.excerpt }}

## The form types

{% highlight php %}
{{ page.templates.post_type }}
{% endhighlight %}

{% highlight php %}
{{ page.templates.tag_type }}
{% endhighlight %}

## The prototype macro

I added a macro to handle the prototyping in `Twig` templates.

This macro renders the `prototype` and the actual `widget` the same way.
Therefore the resulting usage code is very little and required javascript code just works for all collections.

{% highlight jinja %}
{{ page.templates.macro }}
{% endhighlight %}

## Example usage

You should - at least on more advanced forms - render each row or widget manually.
The example shows how to make use of the given macro. You can easily add parameters to the macro to further customize the actual result depending on your needs.

{% highlight jinja %}
{{ page.templates.usage }}
{% endhighlight %}

The javascript required to handle the `add` and `delete` of a tag is very small.
The script is very basic, you might want to check for existing objects, verify related items and much more.

Using `jQuery` it comes down to this:

{% highlight javascript %}
{{ page.templates.javascript }}
{% endhighlight %}

The relation between the add button and the collection is built by the `data-target` of the link and the `id` attribute of the container.

The relation between the remove buttons and their respective content is built by the `data-content` of the container and `data-target` of the link.
This relation is built by the macro itself. This allows to customize the resulting html even more and does not rely on the actual element nesting.
However you should take care about removing the link itself, if you put it outside of the content!

It's important to use the `live` binding of the `click` event. This is required to have the binding apply on newly created links!
