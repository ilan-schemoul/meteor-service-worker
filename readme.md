# Meteor Service Worker
An universal Service Worker for meteor apps.

Version [0.3](#head1234). If you have a lower version please update to 0.3 (at least),
because old versions didn't clean not used file (notice that the new version
will recreate a new cache and delete the old one so update the code will
be enough to free wasted spaces).

## The problem

By default Meteor handles well disconnections. For instance if you don't
close the tab of your browser and your being disconnected, Meteor
handles methods.
> If a client calls a method and is disconnected before it receives a
response, it will re-call the method when it reconnects

With Meteor each client has a offline database, thanks to minimongo,
synced with online's one when the client is connected to the server.
And pages can be generated offline with client-side routing as FlowRouter.
So you can be disconnected of the server and your application is working 
perfectly. The problem is that by default Meteor doesn't save
anything in the cache of the browser.

## The solution

To make Meteor working fully offline we just need to save javascript and
CSS files into browser cache and serve it from the cache if the user
isn't connected to your server.
**Service Worker** is the solution to make the website working offline.
Due to specificities of Meteor, some changes to basic snippets has been made.
Service Worker caches JS (necessary to render the website) but also
CSS, fonts, images or whatever your websites needs. **BUT DOES NOT CACHE
DATABASE**, to cache the database you need [ground:db](https://github.com/GroundMeteor/db)

The SW returns cached version even when online, so you're app is faster.
This cache is more powerful than caching with proper headers
(leverage browser caching) as SW has an higher priority.
Do not worry, if a CSS/JS has changed, the SW will do ask a new version
if online.

## <a name="how"></a>How the Service Worker is working

So here's how this Service Worker is really working, once it's installed
(after the client has visited your website once) :

1. The browser asks for a specific url (for instance http://facebook.com)
2. The Service Worker tries to ask the server the HTML (which with Meteor
is *only* composed of request (`<link>` and `<script>`) to CSS and
Javascript files.
  * The server answers with HTML and so the Service Worker go the third
  step
  * The server doesn't respond, so the Service Worker return a cached
  version of the HTML (which contains the list of CSS/JS to fetch) and
  the Service Worker goes to the third step
3. The browser has the HTML and so ask to the Service Worker JS/CSS
files of `<link>` and `<script>`. With Meteor a file is in the format
`file.js?hash=` where the hash is a unique kind of ID of the
file. The Service Worker extract the hash and check if the hash is newer
to the hash of cached file, if it is newer he tries to ask the server
for the new version and cache it, otherwise he just serves the cached asset.
Once the browser has the CSS/JS files he can start rendering your app.

## How to get the Service Worker for my Meteor website ?

1. Download sw.js and put it in your /public folder.
2. Register your Service Worker to the client by putting 
  `navigator.serviceWorker.register('/sw.js').then()
  .catch(error => console.log(error));`
  into a `Meteor.startup()` loaded **client-side only**.  
3. Service Workers are only available to **secure origins** as HTTPS or
localhost (the URL you access when you make local development). So as
the Service Worker will only cache secure origin be sure that **all domain**
you made request from, even subdomain or CDN, have HTTPS enabled.
  
## Special information

### Compatibility 

Service Worker is pretty new so the support may not be full. All major
browsers either support Service Worker or states that it's in their plan.
Support can be check on [caniuse.com](http://caniuse.com#feat=serviceworkers)

### Special information  
  
- `HTMLToCache` is the URL the Service Worker will first ask to the server
to get the HTML, which is the same in any page of your website, it just
contains the `<script>` and the `<head>` to make the browser loads
required CSS/JS files. If for whatever reasons your website is not
accessible by the default value of HTMLToCache (which is the URL of your
website with / at the end). You can change the value of the variable to
another relative url (as '/index').

- The service worker will cache URL

- If you want third-party URL to be cache, it needs to have CORS enabled.

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

I will be very happy to see pull requests. Open an issue if you have a problem.

TODO :
- Handle responsive images
- Maybe add an option to fetch from the server a new version in the same
time as the SW returns a cached version, so even if the name of a file didn't change 
the user has the new version (after having cached version probably).