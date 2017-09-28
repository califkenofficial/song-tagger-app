import { Component, OnInit, ViewContainerRef, ComponentFactoryResolver, ViewChild, Renderer } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Location }                 from '@angular/common';
import { SongService } from './song.service';
import { Tag } from './Tag'
import { ReadableTagComponent } from './readable_tag.component';
import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit {
  @ViewChild('tags', {read: ViewContainerRef}) viewContainer: ViewContainerRef;
  name: String;
  waveSurfer: Wavesurfer;
  pendingTag: Function;

  constructor(private songsService: SongService,
    private route: ActivatedRoute,
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
      .switchMap(params => 
        this.songsService.getSong(params['track_id'])
      )
      .subscribe(song => {
        this.name = song.name;
        this.waveSurfer.load(song.preview_url);
      }, error => console.log(error));
  }

  playPause(): void {
    this.waveSurfer.playPause();
  }

  tag(): void {
    let currentPostion = document.getElementById("waveform").children[0].children[0].clientWidth;
    let waveWidth = document.getElementById("waveform").children[0].children[1].clientWidth;
    let tagPosition = (currentPostion / waveWidth) * 100; 
    this.pendingTag = this.createTag(tagPosition, this.waveSurfer.getCurrentTime());
  }

  submitText(text: string): void {
    let tag = this.pendingTag(text);
    this.renderTag(tag);
  }

  createTag(postion: number, time: number ): Function {
    this.newTag = new Tag();
    this.newTag.position = postion;
    this.newTag.time = time;

    return (text) => {
      this.newTag.text = text;
      return this.newTag;
    }
  }

  renderTag(tag): void {
    //create tag component and render it
    let tagHolder = document.getElementById('tags');
    const factory = this.componentFactoryResolver.resolveComponentFactory(ReadableTagComponent);
    const ref = this.viewContainer.createComponent(factory);
    this.renderer.setElementStyle(ref.location.nativeElement, 'position', 'absolute')
    this.renderer.setElementStyle(ref.location.nativeElement, 'left', tag.position+'%');
    this.renderer.createText(ref.location.nativeElement.children[1], tag.text);
  }
}