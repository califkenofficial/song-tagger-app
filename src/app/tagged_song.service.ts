import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class TaggedSongService {

  constructor(private http: Http) { }
  // Get all posts from the API
  getTags(track_id: string ) {
    let url = `/api/tagged_song/${track_id}/`;
    return this.http.get(url)
      .map(res => res.json());
  }
}