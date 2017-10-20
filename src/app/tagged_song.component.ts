import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, Renderer, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, Subscription } from 'rxjs';

import { TaggedSongService } from './tagged_song.service';
import { SongService } from './song.service';
import { ReadableTagComponent } from './readable_tag.component';
import { ReadableTagService } from './readable_tag.service';

import { Presenter } from './presenter.module';

import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-tagged-song',
  templateUrl: './tagged_song.component.html',
  styleUrls: ['./tagged_song.component.css']
})
export class TaggedSongComponent implements OnInit {
  @ViewChild('tags', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild('playbutton') playButton;
  @ViewChild('pausebutton') pauseButton;
  clicks$: Observable<any>;
  seekEvents: Subject<any> = new Subject();
  waveSurfer: Wavesurfer;
  song: any;
  name: string;
  artist: string;
  image: string; 
  tags : any;

  constructor(
    private taggedSongService : TaggedSongService,
    private songService : SongService,
    private router : Router,
    private route: ActivatedRoute,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer,
    private presenter: Presenter){}

  ngOnInit(): void {
    this.waveSurfer = Wavesurfer.create({
      container: '#waveform',
      waveColor: 'green',
      progressColor: 'blue'
    });
    
    // this.name = this.route.snapshot.params['track_title'];
    this.waveSurfer.load(this.route.snapshot.params['preview']);  
    this.songService.getSong(this.route.snapshot.params['track_id'])
      .subscribe(song => {
        this.song = song.name;
        this.image = song.album.images[1].url;
        this.artist = song.artists[0].name;
        this.waveSurfer.load(song.preview_url);   
    });
    this.taggedSongService.getTags(this.route.snapshot.params['track_id'])
      .subscribe(tags => {
        this.tags = tags;
        this.presenter.setTags(tags);
        this.renderTags(this.tags);
      });

    //commands
    this.waveSurfer.on('seek', value => {
      if(this.waveSurfer.isPlaying()){
        this.seekEvents.next({
          currentTime: this.waveSurfer.getCurrentTime(),
          action: 'startTagsPlayback'
        });
      } else {
        this.seekEvents.next({
          currentTime: 0,
          action: 'stopTagsPlayback'
        });
      }
    });

    let playEvents = Observable.fromEvent(this.playButton.nativeElement, 'click')
      .map(_ => 'play');

    let uiActions = this.presenter.getViewActions(playEvents, this.seekEvents, this.waveSurfer);

    //commands become actions
    //let uiActions = this.createUiActions(this.createTagCommands(playEvents, pauseEvents, this.seekEvents))

    //subscribe to actions 
    uiActions.subscribe(tagAction => {  
      console.log(tagAction)
      if(tagAction['action'] === 'hideAll') {
        this.hideTags();
      }
      else if(tagAction['action'] === 'show'){
        this.renderer.setElementStyle(document.getElementsByClassName((tagAction['tag'].time).toString())[0].children[1], 'display', 'block');
      } else {
        this.hideTag(tagAction['tag']);
      }
    }, error => console.log(error));
  }

  getTags() {
    return this.tags;
  }

  //combine all types of commands and associated actions into one observable
  // createTagCommands(playEvents, pauseEvents, seekEvents) : Observable<any>{
  //   let tagCommands = Observable.merge(playEvents, pauseEvents)
  //     .distinctUntilChanged()
  //     .do(_ => {
  //       this.waveSurfer.playPause();
  //     })
  //     .map(intent => {
  //       if(intent === 'play'){
  //         return {
  //           currentTime: this.waveSurfer.getCurrentTime(),
  //           action: 'startTagsPlayback'
  //         }
  //       } else {
  //         return {
  //           currentTime: 0,
  //           action: 'stopTagsPlayback'
  //         }
  //       }
  //     });
  //   return Observable.merge(tagCommands, seekEvents);
  // }

  // //takes the commands observable and returns a uiAction based on action
  // createUiActions(tagsCommands):Observable<any>{
  //   return tagsCommands
  //     .switchMap(cmd => {
  //       if(cmd.action === 'startTagsPlayback') {
  //         return Observable.concat(Observable.of({tag: null, action: 'hideAll'}), this.getNewTimes(cmd.currentTime))
  //       } else {
  //         return Observable.of({tag: null, action: 'hideAll'});
  //       }
  //     });
  // }

  hideTags():void {
    this.tags.forEach(tag => this.hideTag(tag))
  }

  hideTag(tag):void {
    this.renderer.setElementStyle(document.getElementsByClassName((tag.time).toString())[0].children[1], 'display', 'none');
  }

  //every time an action comes in, create a new observable with updated show times and hide emissions
  // getNewTimes(currentTime): Observable<any>{
  //   let tags = this.tags;
  //   let tagsObservable = Observable.empty();
  //   tags.filter(tag => tag.time > currentTime)
  //   .forEach(tag => {
  //     let tagObservable = this.createTagDisplayObservable(tag, currentTime);
  //     tagsObservable = Observable.merge(tagObservable, tagsObservable);
  //   })
  //   return tagsObservable;
  // }

  //create two observables and concat: one to determine when to show tag and the other to hide it
  // createTagDisplayObservable(tag, currentTime) : Observable<any> {
  //   let showTagObservable = Observable.of(tag).delay((currentTime - tag.time) * 1000)
  //   .map(tag => {
  //     return {tag: tag, action: 'show'};
  //   });
  //   let hideTagObservable = Observable.of(tag).delay(2000)
  //   .map(tag => {
  //     return {tag: tag, action: 'hide'};
  //   });
  //   return Observable.concat(showTagObservable, hideTagObservable);
  // }

  renderTags(tags) {
    tags.forEach(tag => {
      let tagHolder = document.getElementById('tags');
      const factory = this.componentFactoryResolver.resolveComponentFactory(ReadableTagComponent);
      const ref = this.viewContainer.createComponent(factory);
      this.renderer.setElementClass(ref.location.nativeElement, (tag.time).toString(), true);
      this.renderer.setElementStyle(ref.location.nativeElement, 'position', 'absolute')
      this.renderer.setElementStyle(ref.location.nativeElement, 'left', tag.position+'%');
      this.renderer.createText(ref.location.nativeElement.children[1].children[0], tag.text || "");
      this.renderer.setElementAttribute(ref.location.nativeElement.children[1].children[0].children[0], "src", tag.picture || "https://openclipart.org/image/25px/svg_to_png/250353/icon_user_whiteongrey.png");
      this.renderer.setElementAttribute(ref.location.nativeElement.children[1].children[0].children[0], "title", tag.name || "unknown");
    });   
  }

}