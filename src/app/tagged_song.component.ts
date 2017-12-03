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
    this.waveSurfer.on('seek', _ => {
      this.seekEvents.next('seekEvent')
    });

    let togglePlaybackEvents = Observable.fromEvent(this.playButton.nativeElement, 'click')
      .map(_ => 'togglePlaybackEvent');

    let userEvents = Observable.merge(togglePlaybackEvents, this.seekEvents);
    let uiActions = this.presenter.getViewActions(userEvents, 
       () => { 
         return { 
           currentTime: this.waveSurfer.getCurrentTime(), 
           playbackState: this.waveSurfer.isPlaying()
         }
       },
       () => this.waveSurfer.playPause());

    uiActions.subscribe(tagAction => {  
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

  hideTags():void {
    this.tags.forEach(tag => this.hideTag(tag))
  }

  hideTag(tag):void {
    this.renderer.setElementStyle(document.getElementsByClassName((tag.time).toString())[0].children[1], 'display', 'none');
  }

  renderTags(tags) {
    tags.forEach(tag => {
      let tagHolder = document.getElementById('tags');
      const factory = this.componentFactoryResolver.resolveComponentFactory(ReadableTagComponent);
      const ref = this.viewContainer.createComponent(factory);
      this.renderer.setElementClass(ref.location.nativeElement, (tag.time).toString(), true);
      this.renderer.setElementStyle(ref.location.nativeElement, 'position', 'absolute')
      this.renderer.setElementStyle(ref.location.nativeElement, 'left', tag.position+'%');
      this.renderer.createText(ref.location.nativeElement.children[1].children[1], tag.text || "");
      this.renderer.createText(ref.location.nativeElement.children[1].children[0], tag.user || "unknown");
      this.renderer.setElementAttribute(ref.location.nativeElement.children[0].children[0], "src", tag.picture || "https://openclipart.org/image/25px/svg_to_png/250353/icon_user_whiteongrey.png");
    });   
  }
}