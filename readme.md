# Meteor Service Worker - An universal Service Worker for meteor apps.

The Service Worker caches assets (e.g : JS, CSS, fonts, medias) **not databases**, in order to cache databases 
you need [ground:db](https://github.com/GroundMeteor/db)

The SW returns cached version even when online, so your app is faster.
If one or multiple CSS/JS files have changed the SW detect it and replace the old 
JS/CSS by the new one.

1. The Service Worker asks the server the HTML. Whatever the URL the HTML is the same is and is *only* composed of `<link>` and `<script>` requesting CSS and
Javascript files.
- If the server didn't give the HTML, the SW returns the cached version of it.
2. The browser has the HTML, so it ask for CSS/JS which are in the format
`file.js?hash=XXX` where XXX is the hash.
The Service Worker extracts the hash so it knows if it has the latest version of the file so if 
it the case the SW returns the cached version otherwise it asks for a new version to the server
and caches it.

Once the browser has the CSS/JS files he can start rendering your app.

For other assets than CSS/JS (e.g : http://test.com/img.png) the SW caches the asset and returns
the cached version each time it's asked by the website.

## How to get the Service Worker on my Meteor App ?

1. Download sw.js and put it in the **root** of the /public folder.
2. Register your Service Worker to the client in your client : 
  `Meteor.startup(() => {
  navigator.serviceWorker.register('/sw.js')
  .then()
  .catch(error => console.log('ServiceWorker registration failed: ', error));
  });`
Service Workers are only available to **secure origins**. So be sure your server has
https (localhost is considered as secure). And that the website you made request to are
considered as secure. So your subdomain or your CDN must have HTTPS enabled.

  
## Special information

### Debugging Information (Chrome)
All instructions below require you to to launch your Developer Tools (Ctrl-Shift-I in Linux)

In your Developer Tools, you will notice that assets are loaded from `(Service Worker)`
To see what is cached click on Application -> Cache Storate
To debug the SW script, go to `chrome://serviceworker-internals/` and check `Open Dev Tools ...` which will start the Service Worker in its own Developer Tools 

### Compatibility 
Every modern browsers support Service Workers.
Support can be check at [caniuse.com](http://caniuse.com#feat=serviceworkers)

### Request from an external website URL 

- If you want a request from a third-party URL to be cached, you must make a cross-origin request and
and the resource you're requesting must returns proper headers to allow requests.

### More explanation

- `HTMLToCache` is the URL the Service Worker will first ask to the server
to get the HTML, which is the same in any page of your website, it just
contains the `<script>` and the `<head>` to make the browser loads
required CSS/JS files. If for whatever reasons your website is not
accessible by the default value of HTMLToCache (which is the URL of your
website with / at the end). You can change the value of the variable to
another relative url (as '/index').

- The SW caches only one HTML for all the website
because it's always the same. It does **not** contain the DOM, JS files 
create the DOM. Also the SW never returns cached HTML if the client is online because
otherwise it will create an infinite loop if hot reload is enabled as the cached HTML may ask for older JS which triggers a refresh.

### <a name="version"></a> Changelog

+ 0.1 First version.
+ 0.1.1 Very light refactoring to better match ES6 and Airbnb's guideline.
+ 0.2
    - Add Readme.md.
    - Service worker now caches one HTML file and update it if needed.
+ 0.3 Major update. <a name="head1234"></a>
    - Full refactoring (e.g : properer and more separated code).
    - When variable 'version' changes, the SW cleans old caches so it keeps
    only the new cache.
    - If the SW has downloaded a new version from the server of an asset 
     with ?hash in its URL (e.g CSS/JS) it deletes old versions of the file.
    - Service worker now directly takes control of all the clients and skip
     its installation (basically, by default a SW doesn't takes control
     before user closes all its tabs with the website open in it).
    - If the SW doesn't have a cached requested file and user isn't connected,
    it now returns a `new Response()` with a 503 code.
    - Update readme.md, including by noticing that the SW delivers requests
    from cache even when there's connection with the server (if name, including
    hash= didn't changed).
    - Add a license (please do not delete it).
+ 0.3.1 - Update Readme.md  
+ 0.3.2 - Updated Readme.md with new @mitar's proposal, instead of [(previous proposal)](https://github.com/meteor/meteor/issues/6222).
## Status of this project
I do not use Meteor anymore for multiple years therefore I do not maintain this project actively anymore. I am open to accept a motivated maintainer. I may still review PR and issues from times to times.
