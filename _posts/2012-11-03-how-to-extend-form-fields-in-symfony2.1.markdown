---
layout: post
title: "How to extend form fields in Symfony2.1 using extensions"
tags:
    - symfony
    - form
    - form-component
    - form-extension
    - tutorial
    - how-to
excerpt: |
  This blogpost explains on the example of adding support for the "autocomplete" attribute to widgets how to use form type extensions.
  It also illustrates changes required when upgrading from Symfony 2.0 to 2.1.
---

The [previous post] on `FormTypeExtensionInterface` is outdated for the current Symfony version 2.1.
As requested multiple times, I want to share an updated version on how to create such an extension.

The only main differences between the previous posts state and the current version are:

1. The extensions are now using `Interfaces` instead of implementations (classes).
2. There are changes on how to setup the available options.
3. There is no "field" type anymore.

The basic understanding of what those extensions are for are described in [the form documentation] and my [previous post].

Now let's get to the changes from Symfony 2.0 to 2.1 on this matter.

## Interfaces instead of implementations

The first change is the type hinting on `Interfaces` instead of actual classes (implementations).
PHP will throw you the errors, as the methods signature do not match anymore, when updating.

This should be very trivial to fix, you only need to add the `use` statements for the missing interfaces (replacing the `FormBuilder` for example with `FormBuilderInterface`) and the type-hints until PHP is fine with loading the class file.

## The OptionsResolverInterface

A major change is made by using the `OptionsResolverInterface`, which is part of its respective component.
This resolver deprecates the `getDefaultOptions` method of the `AbstractTypeExtension`.

The `FormTypeExtensionInterface` does not declare this method anymore.
If you used the interface before instead of the abstract implementation of it, you will at least be notified by PHP on the missing implementation of the `setDefaultOptions` method.
A very basic implementation of this method looks like this, and resembles the previous `getDefaultOptions`.

```php
<?php
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'help' => null,
        ));
    }
?>
```

## The field is gone

There is no `FieldType` anymore (well it's deprecated until 2.3).
There are two places where you have to exchange "field" with "form" and everything is fine again.

1. In the respective tag of the service definition.
2. The `getExtendedType` method of the extension.

```yaml
services:
    form.type_extension.help_message:
        class: Acme\Bundle\DemoBundle\Form\Extension\HelpMessageTypeExtension
        tags:
          - { name: "form.type_extension", alias: "form" }
```

```php
<?php
    public function getExtendedType()
    {
        return 'form';
    }
?>
```

## The HelpMessageTypeExtension

This is the updated version of the `HelpMessageTypeExtension`.
It resembles the previous behavior as much as possible, although it's not required to do it that way in Symfony 2.1.

```php
<?php

namespace Acme\Bundle\DemoBundle\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class HelpMessageTypeExtension extends AbstractTypeExtension
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->setAttribute('help', $options['help']);
    }

    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        $view->vars['help'] = $form->getConfig()->getAttribute('help');
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'help' => null,
        ));
    }

    public function getExtendedType()
    {
        return 'form';
    }
}
?>
```

## The AutocompleteExtension

This extension adds additional HTML attributes to your input fields.
Those attributes define the type of content the browser should provide when automatically filling the input field.
See [autocomplete at whatwg] for more details on which types are available.

This version removes the setting of an attribute on the form.
This is possible, because the `buildView` now retrieves the provided `$options` directly, so no need to store the information twice, anymore.

```php
<?php

namespace Acme\Bundle\DemoBundle\Form\Extension;

use Symfony\Component\Form\AbstractTypeExtension;
use Symfony\Component\Form\FormInterface;
use Symfony\Component\Form\FormView;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class AutocompleteExtension extends AbstractTypeExtension
{
    public function buildView(FormView $view, FormInterface $form, array $options)
    {
        if (false === $options['autocomplete']) {
            $options['autocomplete'] = 'off';
        }

        // It doesn't hurt even if it will be left empty.
        if (empty($view->vars['attr'])) {
            $view->vars['attr'] = array();
        }

        if (null !== $options['autocomplete']) {
            $view->vars['attr'] = array_merge(array(
                'autocomplete' => $options['autocomplete'],
                'x-autocompletetype' => $options['autocomplete'],
            ), $view->vars['attr']);
        }
    }

    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'autocomplete' => null,
        ));
    }

    public function getExtendedType()
    {
        return 'form';
    }
}
?>
```

```yaml
services:
    form.type_extension.autocomplete:
        class: Acme\Bundle\DemoBundle\Form\Extension\AutocompleteExtension
        tags:
          - { name: "form.type_extension", alias: "form" }
```

[previous post]: /2011/11/25/how-to-extend-form-fields-in-symfony2.html
[the form documentation]: https://symfony.com/doc/2.1/cookbook/form/form_customization.html#adding-help-messages
[autocomplete at whatwg]: https://wiki.whatwg.org/wiki/Autocomplete_Types
