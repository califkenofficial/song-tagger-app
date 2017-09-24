import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class PlaylistSongsService {

  constructor(private http: Http) { }
  // Get all posts from the API

  getAllPlaylistSongs(user_id: string, playlist_id: string ) {
    let url = `/api/playlist_songs/${user_id}/${playlist_id}`;
    console.log(url)
    return this.http.get(url)
      .map(res => res.json());
  }
}
