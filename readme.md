# Meteor Service Worker - An universal Service Worker for meteor apps.

Long story short : if you want this to be a package upvote
[@mitar's proposal](https://github.com/meteor/meteor-feature-requests/issues/19)

## The problem

By default, Meteor has mechanisms to keep working once offline :
- Methods : If the client is disconnected, methods will resume once logged again (if the tab
is not closed) :
> If a client calls a method and is disconnected before it receives a
response, it will re-call the method when it reconnects

- Each client has a offline database (minimongo)
synced with online's one when the client is connected to the server.
- Pages can be generated offline with a client-side router as FlowRouter.

So you can be disconnected of the server and your application is working 
perfectly and synchronise to the server **as long as you don't close your tab**. But if
the client isn't connected, for whatever reasons (server down, no connection),
he cannot use your website.

## The solution

To make Meteor working offline we just need to cache javascript and
CSS files so we can return them from the cache if the user cannot connect to the server.

**Service Worker** is the solution to make the website working offline.
Due to specificities of Meteor, usual snippets of Service Worker (SW) don't work with Meteor.
Service Worker caches JS files (mandatory for any Meteor app) but also the
CSS, fonts, images or whatever asset that is requested from your server or another one
 at least once by your webiste.
The Service Worker caches assets **not databases**, in order to cache databases 
you need [ground:db](https://github.com/GroundMeteor/db)

The SW returns cached version even when online, so you're app is faster.
This cache is more powerful than simply caching with proper headers
(leverage browser caching) as SW has an higher priority.
If one or multiple CSS/JS files have changed the SW detect it and replace the old 
JS/CSS by the new one.

## <a name="how"></a>How the Service Worker functions

The SW is basically a network proxy so every request made by the website go through 
the SW.
So here's how this Service Worker is dealing with Meteor :

1. The Service Worker asks the server the HTML which with Meteor is really the same
whatever the URL is and is *only* composed of `<link>` and `<script>` requesting CSS and
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
  .catch(error => console.log('ServiceWorker registration failed: ', err));
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

Service Worker is pretty new so the support may not be full. All major
browsers either support Service Worker or states that it's in their plan.
Support can be check on [caniuse.com](http://caniuse.com#feat=serviceworkers)

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
otherwise it will create an infinite loop if hot reload is enabled : if the HTML the SW serves
is different than the one on the server
(e.g : you changed a CSS file so the hash of the href of the `<link>` tag changes), old
JS/CSS are asked to the server and hot reload package is going to refresh your browser so you can
get the new HTML with `<script>` and `<link>` with href targeting URLs to new JS/CSS files. But if
we carry on serving an old cache we create an infinite loop.

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

### About the repository itself

I would be glad to have any contribution : PR, open issues etc.

I would like to make this SW a package so it could be dramatically improved (see todo list for some ideas I could implement)
but as for now Meteor don't allow to make a package that register a worker. @Mitar has proposed
to make a PR but Meteor's team refuses it because there's no enough support for this features.
So if you want to have Meteor packages that can register workers so, for instance,
I could make a package that would make the SW easier to install with a constructor which accept 
option so the SW can be modular please upvote Mitar's post (https://github.com/meteor/meteor/issues/6222).
