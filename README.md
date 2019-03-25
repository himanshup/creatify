# Creatify

![Image 1](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/home.png)

Creatify is a web app for creating Spotify playlists. Built with React, Node.js, and Express.

A Spotify account is required to use the app but If you don't want to sign in, there are screenshots at the bottom.

## Features

- Create a playlist based on an artist (gets related artists + top tracks for each artist)
- Create a playlist based on search criteria (returns 50 playlists matching search criteria and finds the top tracks across all playlists)
- View your top tracks and create a playlist with them
- View your top artists and create a playlist based on them

## Running Locally

If you don't have a Spotify account already, create one first and then go [here](https://developer.spotify.com/dashboard/login) to create a Spotify app.  

Add `http://localhost:8888/callback` to Redirect URIs. If you add any authorization scopes, add them to the `var scope` variable in `app.js`.  

```
git clone https://github.com/himanshup/spotify-playlist-creator.git
cd spotify-playlist-creator
npm install
cd client
npm install
cd ..
```

Create a .env file in the root of the project and add your Client ID and Client Secret from the app you just created  

```
CLIENT_ID='<id>'
CLIENT_SECRET='<secret>'
```

Run the server and react app  

```
npm run dev
```

## Screenshots

![Image 2](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/hot100.png)  
![Image 3](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/search.png)  
![Image 4](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/image4.png)
![Image 5](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/topTracks.png)
![Image 6](https://raw.githubusercontent.com/himanshup/spotify-playlist-creator/master/screenshots/searchPlaylists.png)
