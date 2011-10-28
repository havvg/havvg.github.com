---
layout: post
title: CruiseControl git modificationset errors
excerpt: |
  I encountered some errors while configuring my [phpUnderControl](http://phpundercontrol.org). One of the errors were the `<git>` `<modificationset>` not returning results, but the gitbootstrapper actually updated the git repository. In my case, this was because the user running [CruiseControl](http://cruisecontrol.sourceforge.net/) has set up colorful output in its git config. This option changes the output of the git-log command. The problem with that? The patterns the modificationset looks for do not match! I opened a [change request on Thoughtworks](http://jira.public.thoughtworks.org/browse/CC-1020) for that - hopefully this will be fixed in the next release of CruiseControl.
  
  The other error was about this warning `Git - warning: Log for '' only goes back to [date]`. This warning is thrown when you don't have _a local reflog_ back to that given date. This happened to me, because I removed the git repository within my build and cloned it on each build. This warning is no problem for the modificationset. However, I didn't want this warning, so I updated my config.xml to use a cleanroom for the bootstrapper and the modificationset. Once built this warning should not occur another time, because you are not loosing the reflog of git anymore. I still clone the repository on each build, but this cleanroom won't be touched anytime.
---
I encountered some errors while configuring my [phpUnderControl](http://phpundercontrol.org). One of the errors were the `<git>` `<modificationset>` not returning results, but the gitbootstrapper actually updated the git repository. In my case, this was because the user running [CruiseControl](http://cruisecontrol.sourceforge.net/) has set up colorful output in its git config. This option changes the output of the git-log command. The problem with that? The patterns the modificationset looks for do not match! I opened a [change request on Thoughtworks](http://jira.public.thoughtworks.org/browse/CC-1020) for that - hopefully this will be fixed in the next release of CruiseControl.

The other error was about this warning `Git - warning: Log for '' only goes back to [date]`. This warning is thrown when you don't have _a local reflog_ back to that given date. This happened to me, because I removed the git repository within my build and cloned it on each build. This warning is no problem for the modificationset. However, I didn't want this warning, so I updated my config.xml to use a cleanroom for the bootstrapper and the modificationset. Once built this warning should not occur another time, because you are not loosing the reflog of git anymore. I still clone the repository on each build, but this cleanroom won't be touched anytime.

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<cruisecontrol>
  <project name="megacomplex" buildafterfailed="false">
    <schedule interval="60">
      <ant anthome="apache-ant-1.7.0" buildfile="projects/${project.name}/build.xml"/>
    </schedule>
    <listeners>
      <currentbuildstatuslistener file="logs/${project.name}/status.txt"/>
    </listeners>
    <modificationset quietperiod="60">
      <git localWorkingCopy="projects/${project.name}/cleanroom/" />
    </modificationset>
    <bootstrappers>
      <gitbootstrapper localWorkingCopy="projects/${project.name}/cleanroom/" />
    </bootstrappers>
    <log dir="logs/${project.name}">
      <merge dir="projects/${project.name}/build/logs/"/>
    </log>
    <publishers>
      <artifactspublisher dir="projects/${project.name}/build/api"
        dest="artifacts/${project.name}"
        subdirectory="api"/>
      <artifactspublisher dir="projects/${project.name}/build/coverage"
        dest="artifacts/${project.name}"
        subdirectory="coverage"/>
      <execute command="phpuc graph logs/${project.name} artifacts/${project.name}"/>
    </publishers>
  </project>
</cruisecontrol>
{% endhighlight %}
