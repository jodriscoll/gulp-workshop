# gulp-workshop
Gulp workshop using ECMA6 and Node.js

Installation
------------
1. Fork the repository https://github.com/jodriscoll/gulp-workshop
2. `cd` into a `sandbox/` directory, clone the forked repository, then configure a few parameters

```bash
composer self-update
$ sandbox
$ git clone git@github.com:YOUR-USERNAME/gulp-workshop.git
$ cd gulp-workshop/
$ git remote add upstream git@github.com:jodriscoll/gulp-workshop.git
$ git remote set-url upstream --push no-pushing
```
3. Set permissions
```bash
$ sandbox
$ cd gulp-workshop/
$ chown -R apache:apache .
$ chmod -R 775 dist/
```
