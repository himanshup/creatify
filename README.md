# Spotify Playlist Creator
![Image 1](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/img1.png)  

Playlist Creator is a web app where users can easily create Spotify playlists. Created using React and Node.js.  

View it here https://playlistcreator.herokuapp.com/. You must be signed in to search for artists and create playlists.

## Features
* Create playlist based on an artist.
* Create playlist with songs from Billboard's Top 100.
* Create playlist with your top 50 tracks.
* Create playlist based on your top 10 artists.

## Development

**Note**: You need a Client ID and Client Secret ID to run this. Replace the CLIENT_ID and CLIENT_SECRET values in `server.js` with your own. To run with `npm` instead, you will have to edit the `dev` script in `package.json` (in the root of the folder, not client).

```
git clone https://github.com/himanshup/spotify-playlist-creator.git
cd spotify-playlist-creator
npm install
cd client
npm install
cd ..
yarn dev
```

## Screenshots
![Image 2](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/img2.png)  
![Image 3](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/img3.png)  
![Image 4](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/toptracks.png)