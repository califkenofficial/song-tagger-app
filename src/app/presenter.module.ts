//takes observables for userIntents and returns Observable for uiActions
import { Observable, Subject, Subscription } from 'rxjs';

let createTagCommands = (userEvents, playbackStats, togglePlayback) => {
  return Observable.from(userEvents)
    .do(userEvent => {
      if (userEvent == "togglePlaybackEvent") {
        togglePlayback();
      }   
    })
    .map(_ => {
      let stats = playbackStats();
      return {
        currentTime: stats.currentTime,
        action: stats.playbackState ? 'startTagsPlayback' : 'stopTagsPlayback'
      }
    });
}

let createShowTagsActions = (currentTime, tags) => {

  let tagsObservable = Observable.empty();
  tags.filter(tag => tag.time > currentTime)
  .forEach(tag => {
    let tagObservable = createTagDisplayObservable(tag, currentTime);
    tagsObservable = Observable.merge(tagObservable, tagsObservable);
  })
  return tagsObservable;
}

let createTagDisplayObservable = (tag, currentTime) => {
  let showTagObservable = Observable.of(tag).delay((currentTime - tag.time) * 1000)
  .map(tag => {
    return {'tag': tag, 'action': 'show'};
  });
  let hideTagObservable = Observable.of(tag).delay(2000)
  .map(tag => {
    return {'tag': tag, 'action': 'hide'};
  });
  return Observable.concat(showTagObservable, hideTagObservable);
}

let savedTags;

export class Presenter {

  getViewActions(userEvents, playbackStats, togglePlayback) {

    let tagsCommands = createTagCommands(userEvents, playbackStats, togglePlayback);
    
    return tagsCommands
      .switchMap(cmd => {
        let hideAll = Observable.of({tag: null, action: 'hideAll'});
        if(cmd.action === 'startTagsPlayback') {
          return Observable.concat(hideAll, createShowTagsActions(cmd.currentTime, savedTags));
        } else {
          return hideAll;
        }
      });
  }

  setTags(tags){
    savedTags = tags;
  }
}