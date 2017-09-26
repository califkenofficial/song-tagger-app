import { Component, OnInit } from '@angular/core';
import { PlaylistsService } from './playlists.service';
import { Router }           from '@angular/router';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  //styleUrls: ['./playlists.component.css']
})
export class PlaylistsComponent implements OnInit {
  // instantiate playlists to an empty array
  playlists: any = [];

  constructor(private playlistsService: PlaylistsService, private router: Router) { }

  ngOnInit() {
    // Retrieve playlists from the API
    this.playlistsService.getAllPlaylists().subscribe(playlists => {
      this.playlists = playlists;
    });
  }

  goToPlaylist(playlist) : void {
    this.router.navigate(['/playlist_songs', playlist.owner.id, playlist.id]);
  }
}