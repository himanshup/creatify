# Spotify Playlist Creator

Playlist Creator is a web app for creating Spotify playlists. Created using [Spotify Web API](https://developer.spotify.com/documentation/web-api/), React, and Node.js.

View it here https://playlistcreator.herokuapp.com/. You must be signed in to search for artists and create playlists.

## Features

- Create playlist based on an artist.
- Create playlist with songs from Billboard's Top 100.
- Create playlist with your top 50 tracks.
- Create playlist based on your top 10 artists.

## Development

**Note**: You need a Client ID and Client Secret ID to run this. To get them, go [here](https://developer.spotify.com/dashboard/login) and create an app. You will also need to add `http://localhost:8888/callback` as a Redirect URI. Replace the CLIENT_ID and CLIENT_SECRET values in `app.js` with your own. To run with `yarn` instead, you will have to edit the `dev` script in `package.json` (in the root of the folder, not client).

```
git clone https://github.com/himanshup/spotify-playlist-creator.git
cd spotify-playlist-creator
npm install
npm run dev
```

