---
layout: post
title: config.xml and build.xml for phpUnderControl building a symfony project hosted on github
excerpt: |
  Well yesterday [I moved to PHPUnit](http://toni.uebernickel.info/development/add-a-project-wide-testcase-to-sfphpunit2plugin/) and I just felt the way I want to use [phpUnderControl](http://phpundercontrol.org/) as continuous integration server. The installation part was the easiest one, gathering all the information spread among several websites was not that easy. Especially for me not having used [CruiseControl](http://cruisecontrol.sourceforge.net/) either.
  
  I don't want to take you into the installation of either [PHPUnit](http://www.phpunit.de/manual/current/en/installation.html), [phpUnderControl](http://phpundercontrol.org/documentation/installation.html) or [CruiseControl](http://cruisecontrol.sourceforge.net/main/install.html). These steps are pretty easy and straight forward.
  
  Let me explain, what my setup looks like. I'm hosting the project on [github.com](https://github.com/) as a private repository. Side note: add the public key of your CI to your account to be able to clone these. This project uses symfony with Propel and PHPUnit.
---
Well yesterday [I moved to PHPUnit](http://toni.uebernickel.info/development/add-a-project-wide-testcase-to-sfphpunit2plugin/) and I just felt the way I want to use [phpUnderControl](http://phpundercontrol.org/) as continuous integration server. The installation part was the easiest one, gathering all the information spread among several websites was not that easy. Especially for me not having used [CruiseControl](http://cruisecontrol.sourceforge.net/) either.

I don't want to take you into the installation of either [PHPUnit](http://www.phpunit.de/manual/current/en/installation.html), [phpUnderControl](http://phpundercontrol.org/documentation/installation.html) or [CruiseControl](http://cruisecontrol.sourceforge.net/main/install.html). These steps are pretty easy and straight forward.

Let me explain, what my setup looks like. I'm hosting the project on [github.com](https://github.com/) as a private repository. Side note: add the public key of your CI to your account to be able to clone these. This project uses symfony with Propel and PHPUnit.

{% highlight xml %}
<cruisecontrol>
  <project name="megacomplex" buildafterfailed="false">
    <schedule interval="60">
      <ant anthome="apache-ant-1.7.0" buildfile="projects/${project.name}/build.xml"/>
    </schedule>
    <listeners>
      <currentbuildstatuslistener file="logs/${project.name}/status.txt"/>
    </listeners>
    <modificationset quietperiod="60">
      <git localWorkingCopy="projects/${project.name}/source/" />
    </modificationset>
    <bootstrappers>
      <gitbootstrapper localWorkingCopy="projects/${project.name}/source/" />
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

This is the config.xml for CruiseControl. The important parts are the `<bootstrappers>` and `<modificationset>`. These two are required to make usage of the git hosting. These two point to a source directory, where I am cloning the repository into.

The publishers are well documented. The first one is for the output of PHPDocumentor and the second one for the coverage report of PHPUnit.

{% highlight xml %}
<?xml version="1.0" encoding="UTF-8"?>
<project name="Megacomplex" default="build" basedir=".">
  <property name="git-repository" value="git@github.com:havvg/Megacomplex.git" />
  <property name="gitcommitid" value="master" />
  <property name="source-dir" value="${basedir}/source" />
  <property name="api-dir" value="${basedir}/build/api" />
  <property name="mysql-test-db" value="mcx-test" />
 
  <target name="build" depends="clean-build,setup-symfony,php-doc,phpunit" />
 
  <target name="clone" depends="clean-source">
    <mkdir dir="${source-dir}" />
    <!-- master branch is checked out by default. -->
    <exec executable="git" dir="${source-dir}">
      <arg line="clone ${git-repository} ." />
    </exec>
    <!-- This is only required for bi-secting. -->
    <!--
    <exec executable="git" dir="${source-dir}">
      <arg line="checkout ${gitcommitid}" />
    </exec>
    -->
  </target>
 
  <target name="clean-source">
    <delete dir="${source-dir}" />
  </target>
 
  <target name="clean-build">
    <delete dir="${basedir}/build" />
  </target>
 
  <target name="setup-symfony" depends="clone">
    <mkdir dir="${source-dir}/log" />
    <mkdir dir="${source-dir}/cache" />
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony project:permission" />
    </exec>
 
    <!-- because PHPUnit does not use symfony autoloader  -->
    <delete file="${source-dir}/plugins/sfPHPUnit2Plugin/lib/test/sfPHPUnitBaseTestCase.class.php" />
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony propel:build-model" />
    </exec>
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony propel:build-forms" />
    </exec>
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony propel:build-filters" />
    </exec>
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony propel:build-sql" />
    </exec>
 
    <exec executable="mysql" dir="${source-dir}" failonerror="on">
      <arg line="--delimiter=';' -e 'DROP DATABASE IF EXISTS `${mysql-test-db}`;'" />
    </exec>
 
    <exec executable="mysqladmin" dir="${source-dir}" failonerror="on">
      <arg line="create ${mysql-test-db}" />
    </exec>
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony propel:insert-sql --no-confirmation --env=test" />
    </exec>
 
    <exec executable="php" dir="${source-dir}" failonerror="on">
      <arg line="symfony cc" />
    </exec>
  </target>
 
  <target name="php-doc">
    <mkdir dir="${api-dir}" />
    <exec executable="phpdoc" dir="${source-dir}">
      <arg line="-q -i cache,data,log,lib/model/*/om/,lib/model/*/map/,lib/form/*/base,lib/filter/*/base,lib/vendor,test,web -t ${api-dir} -tb /usr/share/php/data/phpUnderControl/data/phpdoc -o HTML:Phpuc:phpuc -d ."/>
    </exec>
  </target>
 
  <target name="phpunit">
    <mkdir dir="${basedir}/build/logs" />
    <mkdir dir="${basedir}/build/coverage" />
    <exec executable="phpunit" dir="${source-dir}" failonerror="on">
      <arg line="--log-junit ${basedir}/build/logs/phpunit.xml
        --coverage-clover ${basedir}/build/logs/phpunit.coverage.xml
        --coverage-html ${basedir}/build/coverage
        --configuration ${source-dir}/phpunit.xml.dist" />
    </exec>
  </target>
</project>
{% endhighlight %}

The build.xml contains all commands being execute to build the software once. The first part is the setup of some properties being used by this build file. It removes source and build directory to have a clean environment to start. The git `<modificationset>` passes a "gitcommitid" to the build file as a property. This can be used (see comment) while bi-secting your project. By default this is set with the master branch, which I'm running this build on. To add another branch, setup another project in CruiseControl with the other branch.

Having created a clean environment of the git repository. It's time to setup symfony here. This is done by the "setup-symfony" target. It does everything necessary to run the project. Since I'm using the [sfPHPUnit2Plugin](http://www.symfony-project.org/plugins/sfPHPUnit2Plugin) I need to remove one file of it, because PHPUnit is not using the symfony autoloader mechanism. Having down this, we can now fire up PHPUnit and PHPDoc. Both tools create some results, that are saved in a given place. Look into the config.xml again. These are exactly the directory the artifact-publishers are looking for.

The only thing that's left and only needs to be done once: set up the database defined in your projects test environment.

I don't use PHP CodeSniffer or PHPUnit PMD, therefore I didn't set things up for those two, yet.
