---
layout: post
title: "How to extend form fields in Symfony2 using extensions"
tags:
    - symfony
    - form
    - form-component
    - form-extension
    - tutorial
    - how-to
excerpt: |
  This blogpost explains on the example of adding a "help" message to widgets how to use form type extensions.
templates:
  field_widget: |
    {% block field_widget %}
      {{ block('base_field_widget') }}

      {% if help is defined %}
          <span class="help">{{ help }}</span>
      {% endif %}
    {% endblock %}
---

**Update: For Symfony2.1 update please take a look at the [updated post].**

In case you have read [the form documentation], you will have noticed, that the example won't work out of the box.

```jinja
{{ page.templates.field_widget }}
```

## What are form extensions?

Put simple form extensions are classes providing additional options, services, behaviors or in general: extensions on the [form component of Symfony2].
There are several extension types available, such as validators, data transformers and types.
The `FormTypeExtensionInterface` specifies an interface to extend `FormType`s.
A `FormType` is a class representation of a form input, being it a simple `text` field or a more complex `date` input containing several inputs.

So, in order to be able to apply a help message to existing `FormType` a `FormTypeExtension` is required.
The following code illustrates a possible implementation of a `HelpMessageTypeExtension`.
It's very basic, it allows to set a `help` option, which was not found.
The `option` - or `attribute` on the builders side - gets defined and defaults to `null`.
The `getExtendedType` method defines on which `FormType`s this extension may be applied.
To allow every `FormType` be extended by this extensions, it return `field` the base `FormType`.

```php
<?php

namespace Acme\Bundle\DemoBundle\Form\Extension;

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
?>
```

## Dependency Injection

Now that the extension is defined, and will be found by the autoloader, it's required to register it with the framework.
To achieve this task, it's only one `service` definition that's missing.

Important for this definition are two things.

1. A `tag` is required so the service gets injected at the correct points.
   To add a `FormTypeExtension`, the tag `form.type_extension` is defined.
2. As mentioned there are several types of extensions, so another specification is required.
   To have the extension being applied on fields, the `alias` will be `field`.

```yaml
services:
    form.type_extension.help_message:
        class: Acme\Bundle\DemoBundle\Form\Extension\HelpMessageTypeExtension
        tags:
          - { name: "form.type_extension", alias: "field" }
```

## Example Form

Now that the extension is written and made available to the `Form` component of Symfony2, the `help` option is available - see the example form built below.

```php
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
?>
```

Note: `$this->trans()` is a shortcut method calling `trans()` on the `translator` service.

Using `Twitter Bootstrap` this is how it would look like.

![A form with help messages](/images/2011/11/Symfony2-example-form-with-help-messages.png "A form with help messages")

[updated post]: /2012/11/03/how-to-extend-form-fields-in-symfony2.1.html
[the form documentation]: https://symfony.com/doc/2.0/cookbook/form/form_customization.html#adding-help-messages
[form component of Symfony2]: https://github.com/symfony/Form
