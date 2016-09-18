# Meteor service worker
An universal Service Worker for meteor apps

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
**SERVICE WORKER** is the solution. Due to specificities of Meteor,
some changes to basic snippets has been made.

## How the service worker is working
So here's how this service worker is really working, once it's installed
(after the client has visited your website once) :

1. The browser asks for a specific url (for instance http://facebook.com)
2. The service worker tries to ask the server the HTML (which with Meteor
is *only* composed of request (`<link>` and `<script>`) to CSS and
Javascript files.
  * The server answers with HTML and so the service worker go the third
  step
  * The server doesn't respond, so the service worker return a cached
  version of the HTML (which contains the list of CSS/JS to fetch) and
  the service worker goes to the third step
3. The browser has the HTML and so ask to the service worker JS/CSS
files of `<link>` and `<script>`. With Meteor a file is in the format
`file.js?hash=` where the hash is a unique kind of ID of the
file. The service worker extract the hash and check if the hash is newer
to the hash of cached file, if it is newer he tries to ask the server
for the new version and cache it, otherwise he just serves the cached asset.
Once the browser has the CSS/JS files he can start rendering your app.

## How to get the service worker for my Meteor website ?
1. Download sw.js and put it in your /public folder.
2. Register your service worker to the client by putting 
  `navigator.serviceWorker.register('/sw.js').then()
  .catch(error => console.log(error));`
  into a `Meteor.startup()` loaded **client-side only**.  
  
## Special informations  

### Compatibility 
Service worker is pretty new so the support may not be full. All major
browsers either support service worker or states that it's in their plan.
Support can be check on [caniuse.com](http://caniuse.com#feat=serviceworkers)

### Special information  
  
`HTMLToCache` is the URL the service worker will first ask to the server
to get the HTML, which is the same in any page of your website, it just
contains the `<script>` and the `<head>` to make the browser loads
required CSS/JS files. If for whatever reasons your website is not
accessible by the default value of HTMLToCache (which is the URL of your
website with / at the end). You can change the value of the variable to
another relative url (as '/index').
