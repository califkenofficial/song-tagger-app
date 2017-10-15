import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, Renderer } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router }         from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Observable, Subject } from 'rxjs';
import { Location }                 from '@angular/common';
import { SongService } from './song.service';
import { Tag } from './Tag'
import { ReadableTagComponent } from './readable_tag.component';
import { ReadableTagService } from './readable_tag.service';

import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit {
  @ViewChild('tags', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  @ViewChild('tagbutton') button;
  @ViewChild('input') text_box;
  clicks$: Observable<any>;
  tagTextSubject:Subject<any> = new Subject();
  song: any;
  image: string;
  artist: string;
  songId: string;
  waveSurfer: Wavesurfer;
  tagsArray: any[][] = new Array();

  constructor(private songService: SongService,
    private readableTagService: ReadableTagService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    public newTag: Tag,
    private componentFactoryResolver: ComponentFactoryResolver,
    private viewContainerRef: ViewContainerRef,
    private renderer: Renderer) { }

  ngOnInit(): void {
    this.waveSurfer = Wavesurfer.create({
      container: '#waveform',
      waveColor: 'red',
      progressColor: 'purple'
    });

    this.route.params
      .switchMap(params => {
        this.songId = params['track_id'];
        return this.songService.getSong(this.songId);
      })
      .subscribe(song => {
        this.song = song.name;
        this.image = song.album.images[1].url;
        this.artist = song.artists[0].name;
        this.waveSurfer.load(song.preview_url);
      }, error => console.log(error));

    let mapper = this.toCurrentPosition();
    this.clicks$ = Observable.fromEvent(this.button.nativeElement, 'click')
      .do(_ => {
        this.renderer.setElementStyle(this.text_box.nativeElement, 'left', this.getTagPosition()+'%');
        this.renderer.setElementStyle(this.text_box.nativeElement, 'display', 'inline-table');
      })
      .map(mapper);

    const zipTagInfo = Observable
    .zip(
      this.clicks$,
      this.tagTextSubject,
      (position, tagText) => {
        return {
          position: position,
          text: tagText
        }
      }
    );
    const createTag = zipTagInfo.subscribe(val => {
      this.renderAndStoreTag(val)
    });

  }

  curryWaveSurfer(waveSurfer){
    return _ => {
      let waveInfo = {
        time: waveSurfer.getCurrentTime(),
        currentPosition: this.getTagPosition()
      };
      return waveInfo;
    }
  }
  
  toCurrentPosition() {
    return this.curryWaveSurfer(this.waveSurfer);
  }

  getTagPosition() {
    let currentPostion = document.getElementById("waveform").children[0].children[0].clientWidth;
    let waveWidth = document.getElementById("waveform").children[0].children[1].clientWidth;
    return (currentPostion / waveWidth) * 100; 
  }

  submitText(text: string): void {
    this.tagTextSubject.next(text);
  }


  playPause(): void {
    this.waveSurfer.playPause();
  }

  renderAndStoreTag(tagObj): void {
    //create tag component and render it
    this.renderer.setElementStyle(this.text_box.nativeElement, 'display', 'none');

    this.tagsArray.push(tagObj);
    let tagHolder = document.getElementById('tags');
    const factory = this.componentFactoryResolver.resolveComponentFactory(ReadableTagComponent);
    const ref = this.viewContainer.createComponent(factory);
    this.renderer.setElementStyle(ref.location.nativeElement, 'position', 'absolute')
    this.renderer.setElementStyle(ref.location.nativeElement, 'left', tagObj.position.currentPosition+'%');
    this.renderer.createText(ref.location.nativeElement.children[1], tagObj.text);
  }

  saveTagsToSong() {
    this.readableTagService.saveTags(this.tagsArray, this.songId)
      .subscribe(
      result => {
        this.router.navigate(['/playlists']);
      },
      error => {
        alert("Looks like something went wrong...")
      }
    );
  }

}