import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, Renderer, QueryList } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject } from 'rxjs';

import { TaggedSongService } from './tagged_song.service';
import { ReadableTagComponent } from './readable_tag.component';
import { ReadableTagService } from './readable_tag.service';

import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-tagged-song',
  templateUrl: './tagged_song.component.html',
  styleUrls: ['./tagged_song.component.css']
})
export class TaggedSongComponent implements OnInit {
  @ViewChild('tags', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild('playbutton') button;
  clicks$: Observable<any>;
  tagsPlayback: Observable<any> = Observable.empty();
  waveSurfer: Wavesurfer;
  song: any;
  name: string; 
  tags : any;

  constructor(
    private taggedSongService : TaggedSongService,
    private router : Router,
    private route: ActivatedRoute,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer){}

  ngOnInit(): void {
    this.waveSurfer = Wavesurfer.create({
      container: '#waveform',
      waveColor: 'red',
      progressColor: 'purple'
    });
    
    this.name = this.route.snapshot.params['track_title'];
    this.waveSurfer.load(this.route.snapshot.params['preview']);   
    this.tags = this.taggedSongService.getTags(this.route.snapshot.params['track_id'])
    .subscribe(tags => {
       tags.forEach(tag => {
        let tagObservable = Observable.of(tag).delay(tag.time * 1000);
        this.tagsPlayback = Observable.merge(tagObservable, this.tagsPlayback);
        let tagHolder = document.getElementById('tags');
        const factory = this.componentFactoryResolver.resolveComponentFactory(ReadableTagComponent);
        const ref = this.viewContainer.createComponent(factory);
        this.renderer.setElementClass(ref.location.nativeElement, (tag.time).toString(), true);
        this.renderer.setElementStyle(ref.location.nativeElement, 'position', 'absolute')
        this.renderer.setElementStyle(ref.location.nativeElement, 'left', tag.position+'%');
        this.renderer.createText(ref.location.nativeElement.children[1], tag.text);
       })
    });

    Observable.fromEvent(this.button.nativeElement, 'click')
      .subscribe(_ => {  
        this.waveSurfer.playPause(); 
        this.tagsPlayback.subscribe(tag => {
          this.renderer.setElementStyle(document.getElementsByClassName((tag.time).toString())[0].children[1], 'display', 'block');
          setTimeout(() => {
            this.renderer.setElementStyle(document.getElementsByClassName((tag.time).toString())[0].children[1], 'display', 'none');
          }, 2000);
        });
      });
    //   .map(this.getCurrentTime());

    // this.clicks$.subscribe(time => console.log(time));
  }

  curryWaveSurfer(waveSurfer){
    return _ => {
      waveSurfer.playPause();
      let waveInfo = {
        time: waveSurfer.getCurrentTime(),
      };
      return waveInfo;
    }
  }

  getCurrentTime() {
    return this.curryWaveSurfer(this.waveSurfer);
  }

  pause(): void {
    this.waveSurfer.playPause();
  }

}