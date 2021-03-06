/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');

  var notes = new Firebase("https://handbellchoir.firebaseio.com/config/notes");
  notes.set(MIDI.noteToKey);

  //var notesClaimO = {};
  //for(var i = 21; i <= 108; i++) {
  //  notesClaimO[i] = {
  //    k: MIDI.noteToKey[i]
  //  };
  //}
  //var notesClaim = new Firebase("https://handbellchoir.firebaseio.com/notes");
  //notesClaim.set(notesClaimO);

  var launchTime = new Date().getTime();

  var plays = new Firebase("https://handbellchoir.firebaseio.com/plays");
  plays.on('child_added', function(play, prevChildKey) {
    var p = play.val();
    if (p.t > launchTime) {
      console.log(p.t, p.n);
      var delay = 0; // play one note every quarter second
      var note = MIDI.keyToNote[p.n]; // the MIDI note
      var velocity = 127; // how hard the note hits
      MIDI.noteOn(0, note, velocity, delay);
      MIDI.noteOff(0, note, delay + 0.75);
    } else {
      play.ref().remove();
    }
  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  window.addEventListener('paper-header-transform', function(e) {
    var appName = Polymer.dom(document).querySelector('#mainToolbar .app-name');
    var middleContainer = Polymer.dom(document).querySelector('#mainToolbar .middle-container');
    var bottomContainer = Polymer.dom(document).querySelector('#mainToolbar .bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

  // Close drawer after menu item is selected if drawerPanel is narrow
  app.onDataRouteClick = function() {
    var drawerPanel = Polymer.dom(document).querySelector('#paperDrawerPanel');
    if (drawerPanel.narrow) {
      drawerPanel.closeDrawer();
    }
  };

  // Scroll page to top and expand header
  app.scrollPageToTop = function() {
    app.$.headerPanelMain.scrollToTop(true);
  };

  var instrumentName = "tubular_bells";//"acoustic_guitar_steel";//"acoustic_grand_piano";

  MIDI.loadPlugin({
    soundfontUrl: "bower_components/MIDI.js Soundfonts/FluidR3_GM/",
    instrument: instrumentName,
    onprogress: function(state, progress) {
      console.log(state, progress);
    },
    onsuccess: function() {
      MIDI.setVolume(0, 127);
      MIDI.programChange(0, MIDI.GM.byName[instrumentName].number);
    }
  });

})(document);
