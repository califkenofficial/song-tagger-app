import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Location }                 from '@angular/common';
import { SongService } from './song.service';
import Wavesurfer from 'wavesurfer.js';

@Component({
  selector: 'app-song',
  templateUrl: './song.component.html',
  //styleUrls: ['./playlists.component.css']
})
export class SongComponent implements OnInit {
  name: String;
  waveSurfer: Wavesurfer;

  constructor(private songsService: SongService,
    private route: ActivatedRoute,
    private location: Location) { }

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
    console.log(this.waveSurfer.getCurrentTime());
  }

}