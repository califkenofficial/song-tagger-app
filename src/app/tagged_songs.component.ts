import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { TaggedSongsService } from './tagged_songs.service';


@Component({
  selector: 'app-tagged-songs',
  templateUrl: './tagged_songs.component.html',
  styles: [`.container{ margin-top: 20px; }`]
})
export class TaggedSongsComponent implements OnInit {
  constructor(
    private taggedSongsService : TaggedSongsService,
    private router : Router
   ){}
  
  songs: any [];

  ngOnInit(): void {
    this.taggedSongsService.getAllTaggedSongs().subscribe(songs => {
      this.songs = songs.tracks;
    });
  }

  goToTaggedSong(song) : void {
    this.router.navigate(['/tagged_song', song.id, song.name, song.preview_url]);
  }
}