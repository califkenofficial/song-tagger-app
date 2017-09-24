import { Component, OnInit } from '@angular/core';
import { PlaylistsService } from './playlists.service';

@Component({
  selector: 'app-playlists',
  templateUrl: './playlists.component.html',
  //styleUrls: ['./playlists.component.css']
})
export class PlaylistsComponent implements OnInit {
  // instantiate playlists to an empty array
  playlists: any = [];

  constructor(private playlistsService: PlaylistsService) { }

  ngOnInit() {
    // Retrieve playlists from the API
    this.playlistsService.getAllPlaylists().subscribe(playlists => {
      this.playlists = playlists;
    });
  }
}