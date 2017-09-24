import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Location }                 from '@angular/common';
import { PlaylistSongsService } from './playlist_songs.service';

@Component({
  selector: 'app-playlist-songs',
  templateUrl: './playlist_songs.component.html',
  //styleUrls: ['./playlists.component.css']
})
export class PlaylistSongsComponent implements OnInit {
  // instantiate playlists to an empty array
  songs: any = [];

  constructor(private playlistSongsService: PlaylistSongsService,
    private route: ActivatedRoute,
    private location: Location) { }

  ngOnInit(): void {
    this.route.params
      .switchMap(params => 
        this.playlistSongsService.getAllPlaylistSongs(params['user_id'], params['playlist_id'])
      )
      .subscribe(songs => {
        console.log(songs)
        this.songs = songs.items;
      }, error => console.log(error));
  }

}