import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PlaylistsService } from './playlists.service';
import { PlaylistSongsService } from './playlist_songs.service';
import { SongService } from './song.service';

import { PlaylistsComponent } from './playlists.component';
import { PlaylistSongsComponent } from './playlist_songs.component';
import { SongComponent } from './song.component';

const ROUTES = [
  {
    path: 'playlists',
    component: PlaylistsComponent,
  },
  {
    path: 'playlist_songs/:user_id/:playlist_id',
    component: PlaylistSongsComponent,
  },
   {
    path: 'song/:track_id',
    component: SongComponent,
  }
];

@NgModule({
  declarations: [
    AppComponent,
    PlaylistsComponent,
    PlaylistSongsComponent,
    SongComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
  ],
  providers: [
    PlaylistsService,
    PlaylistSongsService,
    SongService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
