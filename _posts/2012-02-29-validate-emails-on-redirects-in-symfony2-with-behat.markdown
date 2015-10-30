---
layout: post
title: "Validate emails on redirects in Symfony2 with Behat"
tags:
    - symfony
    - behat
    - tutorial
    - how-to
---

## Contexts

Before we can actually start, we need some more step definitions. As we follow DRY("Don't Repeat Yourself"), we are going to use [Behat\CommonContexts]. There are several Contexts given, we can make use of. In particular we need two of them. The `MinkRedirectContext` for the redirects and `SymfonyMailerContext` to verify the mailers behavior.

### Add Contexts

In the documentation you can see, how to add those contexts to your current context:

{% highlight php %}
<?php

namespace Acme\Bundle\DemoBundle\Features\Context;

use Behat\BehatBundle\Context\MinkContext;

class FeatureContext extends MinkContext
{
    public function __construct($kernel)
    {
        $this->useContext('symfony_mailer', new \Behat\CommonContexts\SymfonyMailerContext($kernel));
        $this->useContext('mink_redirect', new \Behat\CommonContexts\MinkRedirectContext($kernel));

        parent::__construct($kernel);
    }
}
{% endhighlight %}

If you now issue `php app/console behat -e test -dl @AcmeDemoBundle` you will notice some more step definitions.

That's all for the setup.

## Feature Definition

Let's see, what our expected behavior is. As an example we take a look at the [RegistrationController] of the [FOSUserBundle]. If you enable registration confirmation the expected behavior would be:

1. The user opens the registration page and gets a registration form.
2. The form gets filled by the user and submitted with valid data.
3. The registration process will redirect the user to a confirmation site.
4. Meanwhile, an email has been sent to the user containing a confirmation link.

## Step Definitions

Now it's time to take a look at the step definitions to verify this behavior using Behat. The first two steps are very common and you should already be familiar with them:

{% highlight gherkin %}
Feature: User Registration
    In order to become a registered user
    As an anonymous user
    I need to be able to register a new user account

    Scenario: Sending form with valid data
        Given I am on "/register/"
         When I fill in the following:
             | fos_user_registration_form[username]              | havvg |
             | fos_user_registration_form[email]                 | example@example.com |
             | fos_user_registration_form[plainPassword][first]  | 123456 |
             | fos_user_registration_form[plainPassword][second] | 123456 |
          And I press "Register"
         Then the response status code should be 200
          And the response should contain "The user has been created successfully"
{% endhighlight %}

This will fill out the form and submit it and expects the user to see the confirmation site.

### Adding email verification

`And email with subject "Welcome havvg!" should have been sent to "example@example.com"`

By simply adding this expectation to the scenario, the scenario will fail.
Why that? It's because the email has been sent before the user has been redirected to the confirmation site. So, we need to add some steps related to the redirect. Those are:

* `When I do not follow redirects`
* `When I am redirected to ".."`

The first one will not immediately follow a redirect and allows for inspection of this request. The second expects a redirect to a given URL and follows it. By adding those two correctly, we will have access to the mailer on the correct request.

{% highlight gherkin %}
Feature: User Registration
    In order to become a registered user
    As an anonymous user
    I need to be able to register a new user account

    Scenario: Sending form with valid data
        Given I am on "/register/"
         When I fill in the following:
             | fos_user_registration_form[username]              | havvg |
             | fos_user_registration_form[email]                 | example@example.com |
             | fos_user_registration_form[plainPassword][first]  | 123456 |
             | fos_user_registration_form[plainPassword][second] | 123456 |
          And I do not follow redirects
          And I press "Register"
         Then the response status code should be 302
          And email with subject "Welcome havvg!" should have been sent to "example@example.com"
         Then I should be redirected to "/register/check-email"
          And the response status code should be 200
          And the response should contain "The user has been created successfully"
{% endhighlight %}

[Behat\CommonContexts]: https://github.com/Behat/CommonContexts
[FOSUserBundle]: https://github.com/FriendsOfSymfony/FOSUserBundle
[RegistrationController]: https://github.com/FriendsOfSymfony/FOSUserBundle/blob/8813d135ab1770296f47ebfaeb45e11daa5da9a4/Controller/RegistrationController.php
