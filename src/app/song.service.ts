import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class SongService {

  constructor(private http: Http) { }
  // Get all posts from the API

  getSong(track_id: string ) {
    let url = `/api/playlist_songs/${track_id}/`;
    return this.http.get(url)
      .map(res => res.json());
  }
  
   saveTags(tags, song_id) {
    return this.http.post('/api/tags/'+song_id, tags)
  }
}