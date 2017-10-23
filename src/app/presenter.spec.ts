import { Presenter } from './presenter.module';
import { Observable, Subject, Subscription } from 'rxjs';

fdescribe("Presenter Behavior", function() {
  let originalTimeout;

  let tags = [{
      "_id":"59ecf7d08e123ca45278e6b6",
      "position":16.796875,
      "text":"awesome riff!",
      "time":2
    },
    {
      "_id":"59ecf7d08e123ca45278e6b7",
      "position":34.296875,
      "text":"check out this drum solo",
      "time":6
    }]

  let togglePlayback = () => {
    playbackToggled = true;
    playbackState = !playbackState;
  }

  let getPlaybackStats = () => {
    return {
      currentTime: playbackTime,
      playbackState : playbackState
    }
  }

  let presenter = new Presenter();
  presenter.setTags(tags);
  
  let playbackTime,
      playbackState,
      playbackToggled,
      uiActions = [];

  beforeEach(function() {
      uiActions = [];
      playbackToggled = false;
      playbackState = false;
      playbackTime = 0;

      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
  });
  afterEach(function() {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });

  //always call these two beforeEach in each test that sets these to maek test work
  let given_playback_is_at_position = (time) => {
    playbackTime = time;
  }

  let and_given_player_is_playing = (state) => {
    playbackState = state;
  }

  let when_the_user_toggles_playback = () => {
    return Observable.of("togglePlaybackEvent");
  }

  let recordEmissions = (uiAction) => {
    uiActions.push(uiAction);
  }

  it("hides all tags and shows each tag at the correct time when playing from 0", function(done) {
    given_playback_is_at_position(0);
    and_given_player_is_playing(false);
    presenter.getViewActions(when_the_user_toggles_playback(), getPlaybackStats, togglePlayback)
      .subscribe(
        recordEmissions, 
        error => console.log(""), 
        () => {
          expect(playbackToggled).toBe(true);
          expect(uiActions.length).toBe(5);
          expect(uiActions[0]).toEqual({"tag": null, "action": "hideAll"});
          expect(uiActions[1]).toEqual({"tag": tags[0], "action": "show"});
          expect(uiActions[2]).toEqual({"tag": tags[0], "action": "hide"});
          expect(uiActions[3]).toEqual({"tag": tags[1], "action": "show"});
          expect(uiActions[4]).toEqual({"tag": tags[1], "action": "hide"});
          done();
      });
      
  });

  it("hides all tags and shows only upcoming tags at the correct time when playing from 4", function(done) {
    given_playback_is_at_position(4);
    and_given_player_is_playing(false);

    presenter.getViewActions(when_the_user_toggles_playback(), getPlaybackStats, togglePlayback)
      .subscribe(
        recordEmissions, 
        error => console.log(""), 
        () => {
          expect(playbackToggled).toBe(true);
          expect(uiActions.length).toBe(3);
          expect(uiActions[0]).toEqual({"tag": null, "action": "hideAll"});
          expect(uiActions[1]).toEqual({"tag": tags[1], "action": "show"});
          expect(uiActions[2]).toEqual({"tag": tags[1], "action": "hide"});
          done();
      });
  });

  it("shows 2 hide all events if user presses play and then pause immediately", function(done) {
    given_playback_is_at_position(0);
    and_given_player_is_playing(false);

    let userEvents = when_the_user_toggles_playback()
      .concat(when_the_user_toggles_playback());
    presenter.getViewActions(userEvents, getPlaybackStats, togglePlayback).subscribe(
      recordEmissions, 
      error => console.log(""), 
      () => {
        expect(playbackToggled).toBe(true);
        expect(uiActions.length).toBe(2);
        expect(uiActions[0]).toEqual({"tag": null, "action": "hideAll"});
        expect(uiActions[1]).toEqual({"tag": null, "action": "hideAll"});
        done();
      });
  });

  it("shows hide all, then first tag when a user presses play, followed by a hide all when the user presses pause", function(done) {
    given_playback_is_at_position(0);
    and_given_player_is_playing(false);

    let userEvents = when_the_user_toggles_playback()
      .concat(when_the_user_toggles_playback().delay(2500));
    presenter.getViewActions(userEvents, getPlaybackStats, togglePlayback).subscribe(
      recordEmissions, 
      error => console.log(""), 
      () => {
        expect(playbackToggled).toBe(true);
        expect(uiActions.length).toBe(3);
        expect(uiActions[0]).toEqual({"tag": null, "action": "hideAll"});
        expect(uiActions[1]).toEqual({"tag": tags[0], "action": "show"});
        expect(uiActions[2]).toEqual({"tag": null, "action": "hideAll"});
        done();
      });
  });
});
