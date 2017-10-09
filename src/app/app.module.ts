import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { Presenter } from './presenter.module';
import { PlaylistsService } from './playlists.service';
import { PlaylistSongsService } from './playlist_songs.service';
import { SongService } from './song.service';
import { ReadableTagService } from './readable_tag.service';
import { TaggedSongsService } from './tagged_songs.service';
import { TaggedSongService } from './tagged_song.service';
import { Tag } from './Tag';


import { PlaylistsComponent } from './playlists.component';
import { PlaylistSongsComponent } from './playlist_songs.component';
import { SongComponent } from './song.component';
import { LoginComponent } from './login.component';
import { DashboardComponent } from './dashboard.component';
import { ReadableTagComponent } from './readable_tag.component';
import { TaggedSongsComponent } from './tagged_songs.component';
import { TaggedSongComponent } from './tagged_song.component';



const ROUTES = [
 {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full' 
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
  },
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
  },
  {
    path: 'tagged_songs',
    component: TaggedSongsComponent,
  },
  {
    path: 'tagged_song/:track_id/:track_title/:preview',
    component: TaggedSongComponent,
  },
];

@NgModule({
  declarations: [
    AppComponent,
    PlaylistsComponent,
    PlaylistSongsComponent,
    SongComponent,
    LoginComponent,
    DashboardComponent,
    ReadableTagComponent,
    TaggedSongsComponent,
    TaggedSongComponent
  ],
  entryComponents: [ReadableTagComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot(ROUTES),
  ],
  providers: [
    PlaylistsService,
    PlaylistSongsService,
    SongService,
    ReadableTagService,
    TaggedSongsService,
    TaggedSongService,
    Tag,
    Presenter
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
