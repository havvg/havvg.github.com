---
layout: post
title: git checkout name in bash primary prompt
---
You want to have an overview of your current git checkout in your bash prompt? Then read on!

```bash
parse_git_branch () {
  git name-rev HEAD 2> /dev/null | sed -e 's/\^0$//' | sed 's#HEAD\ \(.*\)# (\1)#'
}
 
BLACK="\[\033[0;38m\]"
RED="\[\033[0;31m\]"
RED_BOLD="\[\033[01;31m\]"
BLUE="\[\033[01;34m\]"
GREEN="\[\033[0;32m\]"
 
export PS1="$BLACK\u@\h:$GREEN\w$RED_BOLD\$(parse_git_branch)$BLACK \$ "
```

Here some explanation, on what's going on. The obvious one is the `git name-rev HEAD` command, which will retrieve a named revision for you. The first usage of the stream editor (sed) simply strips the "^0" at the end of the name, which means in git terms, that's the exact commit of the name, it's prefixed to. Any other refs will be shown, so if you are one commit before the tag, it will be shown with a "^1". The second sed command strips some more output from the orignal. It turns "HEAD tags/3.5.5" into "tags/3.5.5" by simply stripping "HEAD ".

The next part is a set of color declarations. If you don't like colors, omit this part. The last - and most important - part is the setting of the primary prompt of your bash. Stripping all the colors, this would be: `export PS1="\u@\h:\w\$(parse_git_branch) \$ "` This would lead to a bash prompt like: `havvg@havvgbook:~/Web Development/phpunit (tags/3.5.5) $ ` You can find some more information on what's available for the bash prompts and where to put the code above properly [on linuxselfhelp.com](http://www.linuxselfhelp.com/howtos/Bash-Prompt/Bash-Prompt-HOWTO-2.html#bpescapes)
