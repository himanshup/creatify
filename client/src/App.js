import React, { Component } from "react";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
var spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(props) {
    super(props);
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      nowPlaying: { name: "Not Checked", albumArt: "" },
      billboardPlaylistUrl: "",
      tracks: [],
      uris: []
    };
  }

  componentDidMount() {
    axios
      .all([axios.get("/billboard1"), axios.get("/billboard100")])
      .then(
        axios.spread((array1, array2) => {
          const tracks = array1.data.concat(array2.data);
          for (const track of tracks) {
            spotifyApi
              .searchTracks(`${track.title}`, { limit: 1 })
              .then(response => {
                this.setState({
                  uris: this.state.uris.concat([response.tracks.items[0].uri])
                });
              });
          }
        })
      )
      .catch(error => {
        console.log(error);
      });
  }

  getNowPlaying = () => {
    spotifyApi
      .getMyCurrentPlaybackState()
      .then(response => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url
          }
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  createPlaylist = () => {
    spotifyApi
      .getMe()
      .then(response => {
        return response.id;
      })
      .then(userId => {
        return spotifyApi.createPlaylist(userId, {
          name: "Billboard 100",
          public: true
        });
      })
      .then(playlist => {
        console.log("Created playlist");
        console.log(playlist);
        this.setState({
          billboardPlaylistUrl: playlist.external_urls.spotify
        });
        return spotifyApi.addTracksToPlaylist(
          playlist.owner.id,
          playlist.id,
          this.state.uris
        );
      })
      .then(finalPlaylist => {
        console.log("Added tracks to your playlist");
        console.log(finalPlaylist);
      })
      .catch(error => {
        console.log(error);
      });
  };

  createSavedTracksPlaylist = () => {};

  getRefreshToken = () => {
    const params = this.getHashParams();
    const refreshRoken = params.refresh_token;
    spotifyApi.setAccessToken(refreshRoken);
  };

  getHashParams = () => {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  };

  render() {
    return (
      <div className="App">
        <a href="http://localhost:8888"> Login to Spotify </a>
        <div>Now Playing: {this.state.nowPlaying.name}</div>
        <div>
          <img
            src={this.state.nowPlaying.albumArt}
            alt=""
            style={{ height: 150 }}
          />
        </div>
        {this.state.loggedIn && (
          <div>
            <button onClick={() => this.getNowPlaying()}>
              Check Now Playing
            </button>
            <button onClick={() => this.createPlaylist()}>
              Create Playlist
            </button>
          </div>
        )}
        {/* <ul>
          {this.state.songs.map(item => (
            <li key={item.title}>
              {item.artist} - {item.title}
            </li>
          ))}
        </ul> */}
      </div>
    );
  }
}

export default App;
