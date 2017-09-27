import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Location }                 from '@angular/common';
import { SongService } from './song.service';
import { Tag } from './Tag'
import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  styleUrls: ['./song.component.css']
})
export class SongComponent implements OnInit {
  name: String;
  waveSurfer: Wavesurfer;
  pendingTag: Function;

  constructor(private songsService: SongService,
    private route: ActivatedRoute,
    private location: Location,
    public newTag: Tag) { }

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
    console.log("in tag")
    let currentPostion = document.getElementById("waveform").children[0].children[0].clientWidth;
    let waveWidth = document.getElementById("waveform").children[0].children[1].clientWidth;
    let tagPosition = (currentPostion / waveWidth) * 100; 
    this.pendingTag = this.createTag(tagPosition, this.waveSurfer.getCurrentTime());
    console.log("pendign taf", this.pendingTag);
  }

  submitText(text: string): void {
    let tag = this.pendingTag(text);
    console.log("tag?", tag);
    this.renderTag(tag);
  }

  createTag(postion: number, time: number ): Function {
    console.log("in createTag")
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
    let newTag = document.createElement('div');
    newTag.className = 'circle';
    newTag.style.position = "absolute";
    newTag.style.left = tag.position+"%";
    newTag.style.width = '10px';
    newTag.style.height = '10px';
    newTag.style.borderRadius = '50%';
    newTag.style.backgroundColor = 'black';
    document.getElementById('tags').appendChild(newTag);
  }
}