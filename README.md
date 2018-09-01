# Spotify Playlist Creator
![Image 1](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/img1.png)  

Create a Spotify plyalist based on an artist or with songs from Billboard's top 100. To create a playlist based on an artist, just type their name in the search bar and select the artist. You will then get a list of related artists and the option to get the top tracks for each artist. After getting the top tracks, you have the option to save the playlist on Spotify. You can also see your top tracks/artists and make a playlist with them.

View it here https://playlistcreator.herokuapp.com/. You must be signed in to search for artists and create playlists.

## Installation

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