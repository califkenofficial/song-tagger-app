const express = require('express');
const router = express.Router();
const request = require('request'); // "Request" library
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

const client_id = '356e5c975b12471d9875649901894fbb'; // Your client id
const client_secret = '07b51f3f7224498e91cd093302f9da1b'; // Your secret
const redirect_uri = 'http://localhost:3000/api/callback'; // Your redirect uri

let accessToken = "";
let generateRandomString = function(length) {
  let text = '';
  let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

let stateKey = 'spotify_auth_state';
router.use(cookieParser());
/* GET api listing. */
router.get('/', (req, res) => {
  res.send('api works');
});

router.get('/login', (req, res) => {
  console.log("here")
  let state = generateRandomString(16);
  res.cookie(stateKey, state);

  // your application requests authorization
  let scope = 'user-read-private user-read-email playlist-read-private';
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: state
    })
  );
});

router.get('/callback', (req, res) => {
  // your application requests refresh and access tokens
  // after checking the state parameter
  console.log("here 2")
  let code = req.query.code || null;
  let state = req.query.state || null;
  let storedState = req.cookies ? req.cookies[stateKey] : null;
  if (state === null || state !== storedState) {
    res.redirect('/#' +
      querystring.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    let authOptions = {
      url: 'https://accounts.spotify.com/api/token',
      form: {
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      },
      headers: {
        'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
      },
      json: true
    };

    request.post(authOptions, (error, response, body) =>{
      if (!error && response.statusCode === 200) {

        let access_token = body.access_token,
            refresh_token = body.refresh_token;
        accessToken = access_token;

        let options = {
          url: 'https://api.spotify.com/v1/me',
          headers: { 'Authorization': 'Bearer ' + access_token },
          json: true
        };

        // use the access token to access the Spotify Web API
        request.get(options, (error, response, body) => {
          console.log(body);
        });

        // we can also pass the token to the browser to make requests from there
        res.redirect('/playlists');
      } else {
        res.redirect('/#' +
          querystring.stringify({
            error: 'invalid_token'
          }));
      }
    });
  }
});

router.get('/refresh_token', (req, res) => {

  // requesting access token from refresh token
  let refresh_token = req.query.refresh_token;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
    form: {
      grant_type: 'refresh_token',
      refresh_token: refresh_token
    },
    json: true
  };

  request.post(authOptions, (error, response, body) => {
    if (!error && response.statusCode === 200) {
      let access_token = body.access_token;
      res.send({
        'access_token': access_token
      });
    }
  });
});

router.get('/user_playlists', (req, res) => {
  let options = {
    url: 'https://api.spotify.com/v1/me/playlists',
    headers : { 'Authorization': 'Bearer ' + accessToken},
    json: true
  };

  request.get(options, (error, response, body) => {
    console.log(body);
    res.status(200).json(body.items);
  })
});

router.get('/playlist_songs/:user_id/:playlist_id', (req, res) => {
  let user_id = req.params.user_id;
  let playlist_id = req.params.playlist_id;
  let url = 'https://api.spotify.com/v1/users/'+user_id+'/playlists/'+playlist_id+'/tracks';
  let options = {
    url: url,
    headers : { 'Authorization': 'Bearer ' + accessToken},
    json: true
  };

  request.get(options, (error, response, body) => {
    console.log(body);
    res.status(200).json(body);
  })
});

router.get('/playlist_songs/:track_id/', (req, res) => {
  let track_id = req.params.track_id;
  let url = 'https://api.spotify.com/v1/tracks/'+track_id;
  let options = {
    url: url,
    headers : { 'Authorization': 'Bearer ' + accessToken},
    json: true
  };

  request.get(options, (error, response, body) => {
    console.log(body);
    res.status(200).json(body);
  })
});
module.exports = router;