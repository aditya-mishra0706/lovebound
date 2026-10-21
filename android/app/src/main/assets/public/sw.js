/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "c0d0384b17c037c07a1b10c905a2eb02"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ba4fe918c3dc9d039bdfbd6650c3990c"
  }, {
    "url": "pwa-192x192.png",
    "revision": "e29104ccb4d99335116b178084365fec"
  }, {
    "url": "index.html",
    "revision": "39c8320b6eec26d77876ef31eec10ecf"
  }, {
    "url": "icon.svg",
    "revision": "e0ef099540390f8a8b7897d0059957c2"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "de1b52465c9157b137bd6a23518b063e"
  }, {
    "url": "assets/index-Dz941a8D.js",
    "revision": null
  }, {
    "url": "assets/index-BV7V3r6L.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "de1b52465c9157b137bd6a23518b063e"
  }, {
    "url": "icon.svg",
    "revision": "e0ef099540390f8a8b7897d0059957c2"
  }, {
    "url": "pwa-192x192.png",
    "revision": "e29104ccb4d99335116b178084365fec"
  }, {
    "url": "pwa-512x512.png",
    "revision": "ba4fe918c3dc9d039bdfbd6650c3990c"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "c0d0384b17c037c07a1b10c905a2eb02"
  }, {
    "url": "manifest.webmanifest",
    "revision": "6c7353ed0cb8a7834e913f50f1365bd1"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
