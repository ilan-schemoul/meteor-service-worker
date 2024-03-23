# Meteor Service Worker - An universal Service Worker for meteor apps.


## How to get the Service Worker on my Meteor App ?

1. Download sw.js and put it in the **root** of the /public folder.
2. Register your Service Worker to the client in your client : 
  `Meteor.startup(() => {
  navigator.serviceWorker.register('/sw.js')
  .then()
  .catch(error => console.log('ServiceWorker registration failed: ', error));
  });`
Service Workers are only available to **secure origins**. So be sure your server has https (localhost is considered as secure). And that the website you made request to are considered as secure. So your subdomain or your CDN must have HTTPS enabled.

## How it works
1. The SW makes a network request for the HTML (all HTML pages are the same with Meteor). If it receives no answer the SW returns the cached version.
2. The HTML requires files in the format `file.js?hash=XXX` where XXX is the hash. Thanks to this hash the SW knows if the cache has the latest version or if it has to make a network request.

## Can I cache my databases ?

No, service workers are for caching assets (images, videos, js, css etc.)

## Looking for maintainers

I do not use Meteor anymore. If an active user wants to be a maintainer I might consider him/her.

## Special information

### Debugging Information (Chromium browsers)

List of cached files are in Application -> Cache Storate
To debug the SW script, go to `chrome://serviceworker-internals/` and check `Open Dev Tools ...` which will start the Service Worker in its own Developer Tools 

### Compatibility 
Every modern browsers support Service Workers.
Support can be check at [caniuse.com](http://caniuse.com#feat=serviceworkers)

### Request from an external website URL 

- If you want a request from a third-party URL to be cached, you must make a cross-origin request and the resource you're requesting must returns proper headers to allow requests.
