# Spotify Playlist Creator

Creates Spotify playlists based on an artist or with songs from Billboard's top 100. To create a playlist based on an artist, just type their name in the search bar and select the artist. You will then get a list of related artists and the option to get the top tracks for each artist. After getting the top tracks, you have the option to save the playlist on Spotify.

View it here View it here https://playlistcreator.herokuapp.com/. You must be signed in to create playlists.

## Installation

**Note**: You need a Client ID and Client Secret ID to run this. Replace the CLIENT_ID and CLIENT_SECRET values in `server.js` with your own. To run with `npm` instead, you will have to edit the scripts in `package.json`.

```
git clone https://github.com/himanshup/spotify-playlist-creator.git
cd spotify-playlist-creator
npm install
cd client
npm install
cd ..
yarn dev
```
