# React-redux boilerplate for laravel app

This boilerpalte could be used for React-redux apps based on laravel framework.

Inside of this we have:
* gulp for build and task running
* livereload for page updates
* webpack for js bundle
* Babel es2015 preset for js transformations to es5
* Sass for css preprocessing
* Zurb-emails with inky for email creating
* Mocha for testing
* Expect.js for assertation

## Use it
Install:
```sh
$ npm i
```

Testing:
```sh
$ npm test
```

Dev build:
```sh
$ npm run dev
```

Produciton build
```sh
$ npm run build
```

Emails-dev build:
```sh
$ npm run email-dev
```

Emails-produciton build
```sh
$ npm run email
```

## Paths
All dev files paths based on
```
./resources/assets
```

Build path for front-end based on
```
./public/build
```

Production path for emails based on
```
./resources/views/emails
```

Webpack can resolve paths based on
```
./resources/assets/jsx
```
so, in your front-end app you could use any file structure which you want. Example:
```
+-- jsx
|   +-- actions
|       +-- index.js
|       +-- Types.js
|   +-- components
|       +-- Elements
|           +-- StateButton.jsx
|       +-- Layouts
|           +-- App.jsx
|           +-- Sidebar.jsx
|       +-- index.js
|   +-- containers
|       +-- App.js
|       +-- FriendListApp.js
|   +-- reducers
|       +-- index.js
|       +-- friendlist.js
|   +-- utils
|   +-- index.js
+-- js
+-- sass
```
If you want require **Elements/StateButton.jsx** in **Layouts/App.jsx** you could do this like:
```js
const StateButton = require('../Elements/StateButton');
// or
const StateButton = require('components/Elements/StateButton');
```
And don't think about levels of files structure.

## Revisions of files
Is's also includes revisions of files in production build via
```
./public/build/manifest.json
```
As result you must use it in your views as
```html
<script src="{{elixir('js/index.js')}}"></script>
```
Result of elixir function is
```
/build/js/index-[hash].js
```

## License

This is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT).
