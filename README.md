# gulp-workshop
Workshop using ECMA6 and Node.js to create a self contained build environment solely running through Gulps.js.

Requirements
------------
1. Node.js (`npm` responding to `-v`)
2. Gulp.js (4.0)
3. ECMA6/JavaScript comfort
4. Familiar with setting up bash shortcuts (ex: `sandbox`)
5. Familiar with setting up vhosts to reference
6. API Key for TinyPNG image compression (Free – tinypng.com/developers)

Installation
------------
1. **Fork** the repository: https://github.com/jodriscoll/gulp-workshop

2. **Change directory** into a `sandbox/` directory, **clone** your forked repository, then **define** your git stream parameters
```bash
$ git clone git@github.com:{YOUR-USERNAME}/gulp-workshop.git
$ cd gulp-workshop/
$ git remote add upstream git@github.com:jodriscoll/gulp-workshop.git
$ git remote set-url upstream --push no-pushing
```

3. Install **Node** modules through **npm**
```bash
$ cd gulp-workshop/
$ npm install
```

4. Install **gulp** (if not already installed)
```bash
$ npm install gulp-cli -g
$ npm install gulp -D
$ gulp -v
```

5. Run **Gulp.js**
```bash
$ cd gulp-workshop/
$ gulp
```
