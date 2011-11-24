---
layout: post
title: "How to extend form fields in Symfony2 using extensions"
excerpt: |
  This blogpost explains on the example of adding a "help" message to widgets how to use form extensions.
templates:
  field_widget: |
    {% block field_widget %}
      {{ block('base_field_widget') }}
    
      {% if help is defined %}
          <span class="help">{{ help }}</span>
      {% endif %}
    {% endblock %}
---

In case you have read [the form documentation], you will have noticed, that the example won't work out of the box.

{% highlight jinja %}
{{ page.templates.field_widget }}
{% endhighlight %}

# TODO

* What are form extensions?
* How to use injected form extensions to extend all types?

## Dependency Injection

{% highlight yaml %}
    form.type_extension.help_message:
        class: Ormigo\Bundle\OrmigoBundle\Form\Extension\HelpMessageTypeExtension
        tags:
          - { name: "form.type_extension", alias: "field" }
{% endhighlight %}

## Extension

{% highlight php %}
<?php

namespace Ormigo\Bundle\OrmigoBundle\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\FormBuilder;

class HelpMessageTypeExtension extends AbstractTypeExtension
{
    public function buildForm(FormBuilder $builder, array $options)
    {
        $builder->setAttribute('help', $options['help']);
    }

    public function buildView(FormView $view, FormInterface $form)
    {
        $view->set('help', $form->getAttribute('help'));
    }

    public function getDefaultOptions(array $options)
    {
        return array(
            'help' => null,
        );
    }

    public function getExtendedType()
    {
        return 'field';
    }
}
{% endhighlight %}

## Example Form

{% highlight php %}
<?php
$form = $this->createFormBuilder()
    ->add('name', 'text', array(
        'help' => $this->trans('form.demo.name.help'),
    ))
    ->add('birthday', 'birthday', array(
        'help' => $this->trans('form.demo.birthday.help'),
        'attr' => array('class' => 'small'),
    ))
    ->add('email', 'email')
    ->getForm();
{% endhighlight %}

[the form documentation]: http://symfony.com/doc/current/cookbook/form/form_customization.html#adding-help-messages
