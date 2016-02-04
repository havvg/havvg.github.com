---
layout: post
title: dynamic values in forms with symfony
excerpt: Let's imagine you have a form set up and want to add some dynamic values to the object being saved by this form after the form has been submitted by the visitor.
---
Let's imagine you have a form set up and want to add some dynamic values to the object being saved by this form after the form has been submitted by the visitor.

The example model (`wspNopasteEntry`) below has a property `created_by` which refers to a `sfGuardUser` (or anonymous). So, at first you have to unset the form field for the user using [the inherited setup() method of the form](http://www.symfony-project.org/api/1_2/sfForm#method_setup "symfony API » sfForm Class") itself.

```php
<?php
/**
 * set up the form
 */
public function setup()
{
  parent::setup();
  unset($this['created_by']);
}
```

Now, the user has no field to enter any kind of user id. While processing the form, right before you save the created instance of your object to the database, you can modify the object using [the getObject() method of sfFormPropel](http://www.symfony-project.org/api/1_2/sfFormPropel#method_getobject "symfony API » sfFormPropel Class").

```php
<?php
/**
 * process the form submitted by the user
 *
 * @param sfWebRequest $request
 * @param sfFormPropel $form
 */
protected function processForm(sfWebRequest $request, sfFormPropel $form)
{
  $form->bind(
    $request->getParameter($form->getName()),
    $request->getFiles($form->getName())
  );
 
  if ($form->isValid())
  {
    if ($this->getUser()->getGuardUser())
    {
      $userId = $this->getUser()->getGuardUser()->getId();
    }
    else
    {
      $userId = 0;
    }
    $form->getObject()->setCreatedBy($userId);
    $form->save();
 
    $this->redirect($this->generateUrl('wsp_nopaste_entry_permalink', $form->getObject()));
  }
  else
  {
    $this->getUser()->setFlash(sfConfig::get('sf_validation_error_class'), sfConfig::get('app_wsp_nopaste_plugin_form_error', 'The form is invalid.'), false);
  }
}
```
