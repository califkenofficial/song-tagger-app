//takes observables for userIntents and returns Observable for uiActions
import { Observable, Subject, Subscription } from 'rxjs';

let createTagCommands = (playEvents, pauseEvents, seekEvents, waveSurfer) => {
  let tagCommands = Observable.merge(playEvents, pauseEvents)
    .distinctUntilChanged()
    .do(_ => {
      waveSurfer.playPause();
    })
    .map(intent => {
      if(intent === 'play'){
        return {
          currentTime: waveSurfer.getCurrentTime(),
          action: 'startTagsPlayback'
        }
      } else {
        return {
          currentTime: 0,
          action: 'stopTagsPlayback'
        }
      }
    });
  return Observable.merge(tagCommands, seekEvents);
}

let getNewTimes = (currentTime, tags) => {

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

  getViewActions(playEvents, pauseEvents, seekEvents, waveSurfer) {

    let tagsCommands = createTagCommands(playEvents, pauseEvents, seekEvents, waveSurfer);
    
    return tagsCommands
      .switchMap(cmd => {
        if(cmd.action === 'startTagsPlayback') {
          return Observable.concat(Observable.of({tag: null, action: 'hideAll'}), getNewTimes(cmd.currentTime, savedTags))
        } else {
          return Observable.of({tag: null, action: 'hideAll'});
        }
      });
  }

  setTags(tags){
    savedTags = tags;
  }
}