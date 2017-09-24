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

  constructor(private songsService: SongService,
    private route: ActivatedRoute,
    private location: Location) { }

  ngOnInit(): void {
    this.route.params
      .switchMap(params => 
        this.songsService.getSong(params['track_id'])
      )
      .subscribe(song => {
        this.name = song.name;
        
        var wavesurfer = Wavesurfer.create({
          container: '#waveform',
          waveColor: 'red',
          progressColor: 'purple'
        });
        wavesurfer.load(song.preview_url);
        wavesurfer.on('ready', function () {
            wavesurfer.play();
        });
      }, error => console.log(error));



    //var slider = document.querySelector('#slider');

    // slider.oninput = function () {
    //   var zoomLevel = Number(slider.value);
    //   wavesurfer.zoom(zoomLevel);
    // };
  }



}