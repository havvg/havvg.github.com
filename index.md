---
layout: site
---

Just testing, please ignore .. so far.

{% highlight php %}
<?php

namespace SismoFinder;

use Symfony\Component\Finder\Finder as sfFinder;

class Finder
{
    /**
     * The list of files to look for within each project directory.
     *
     * The content of this list is ordered. The first file found within a project directory will be used.
     * Each file is contracted to return a \Sismo\Project to be added to the Sismo configuration.
     *
     * @var array
     */
    public static $configFiles = array(
       'sismo.config.php',
       'sismo.config.php.dist',
    );

    /**
     * The list of workspace directories.
     *
     * @var array
     */
    private $workspaces = array();

    /**
     * Constructor.
     *
     * @uses SismoFinder::addWorkspace
     *
     * @param array $workspaces A list of workspace directories to use.
     */
    public function __construct(array $workspaces = array())
    {
        foreach ($workspaces as $eachWorkspace) {
            $this->addWorkspace($eachWorkspace);
        }
    }

    /**
     * Add a directory to the list of workspaces.
     *
     * @throws InvalidArgumentException If the directory is invalid.
     *
     * @param string $dir The full path to the directory.
     *
     * @return SismoFinder $this
     */
    public function addWorkspace($dir)
    {
        if (!is_dir($dir)) {
            throw new \InvalidArgumentException('The given directory is not valid.');
        }

        if (!in_array($dir, $this->workspaces)) {
            $this->workspaces[] = $dir;
        }

        return $this;
    }

    /**
     * Returns the list of projects the finder can find.
     *
     * @return array of \Sismo\Project
     */
    public function getProjects()
    {
        $projects = array();

        if (count($this->workspaces)) {
            foreach ($this->workspaces as $eachWorkspace) {
                $projectDirectories = sfFinder::create()->directories()
                    ->depth('< 1')
                    ->in($eachWorkspace)
                ;

                foreach ($projectDirectories as $eachDir) {
                    if ($project = $this->loadSismoConfiguration($eachDir)) {
                        if (!is_array($project)) {
                            $project = array($project);
                        }

                        $projects = array_merge($projects, $project);
                    }
                }
            }
        }

        return $projects;
    }

    /**
     * Load the Sismo configuration file
     *
     * @param \SplFileInfo $dir The project directory within a workspace.
     *
     * @return \Sismo\Project | array
     */
    protected function loadSismoConfiguration(\SplFileInfo $dir)
    {
        $project = null;

        foreach (self::$configFiles as $eachConfigurationFile) {
            $files = sfFinder::create()->files()
                ->depth('< 2')
                ->name($eachConfigurationFile)
                ->in($dir->getPathname())
            ;

            try {
                foreach ($files as $eachFile) {
                    // The first file found, is fine, the list is ordered.
                    $project = include $eachFile->getPathname();
                    break 2;
                }
            } catch (\UnexpectedValueException $e) {
                // @codeCoverageIgnoreStart
                if (!(false !== strpos($e->getMessage(), 'Permission denied'))) {
                    throw $e;
                }
                // @codeCoverageIgnoreEnd
            }
        }

        return $project;
    }
}
{% endhighlight %}

...