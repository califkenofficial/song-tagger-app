import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import { Location } from '@angular/common';
import { PlaylistSongsService } from './playlist_songs.service';

@Component({
  selector: 'app-playlist-songs',
  templateUrl: './playlist_songs.component.html',
   styles: [`
  .container{ margin-top: 20px; max-width: 75%; }
  .table-songs,
  .table-songs thead th,
  .table-songs thead tr th,
  .table-songs tbody tr,
  .table-songs tbody tr td {
    color: #7d7e81;
    border-color: #1c1c1f;
    font-size: 12px;
  }

  .table-songs tbody tr:focus,
  .table-songs tbody tr:hover,
  .table-songs tbody tr.active td {
    background-color: #ebebeb;
  }

  .table-songs thead tr th {
    text-transform: uppercase;
    color: #7d7e81;
    font-weight: normal;
  }

  .table-songs tbody {
    overflow: scroll;
    height: 200px;
  }
  .table-songs .play-btn {
    color: transparent;
    font-size: 12px;
  }
  .table-songs .secondary-info {
    color: #7d7e81;
  }

  .table-songs tr.active .play-btn,
  .table-songs .play-btn:focus,
  .table-songs .play-btn:hover {
    color: #ebebeb;
    outline: none;
  }`]
})
export class PlaylistSongsComponent implements OnInit {
  // instantiate playlists to an empty array
  songs: any = [];

  constructor(private playlistSongsService: PlaylistSongsService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router) { }

  ngOnInit(): void {
    this.route.params
      .switchMap(params => 
        this.playlistSongsService.getAllPlaylistSongs(params['user_id'], params['playlist_id'])
      )
      .subscribe(songs => {
        this.songs = songs.filter(song => {
          return song.track.preview_url
        });
      }, error => console.log(error));
  }

  goToSong(song) : void {
    this.router.navigate(['/song', song.track.id ]);
  }

}