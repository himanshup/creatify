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
      userId: "",
      playlistId: "",
      songs: []
    };

    // this.createPlaylist = this.createPlaylist.bind(this);
  }

  componentDidMount() {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
        });
        console.log(this.state.userId);
      })
      .catch(error => {
        console.log(error);
      });

    axios
      .get("http://localhost:8888/billboard100")
      .then(response => {
        console.log(response);
        this.setState({
          songs: response.data
        });
      })
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
      .createPlaylist(this.state.userId, {
        name: "Billboard 100",
        description: "This was created using the api",
        public: true
      })
      .then(response => {
        console.log("Created Playlist!");
        console.log(response);
        this.setState({
          playlistId: response.id
        });
        console.log(`Current playlist ID: ${this.state.playlistId}`);
        spotifyApi
          .addTracksToPlaylist(this.state.userId, this.state.playlistId, [
            "spotify:track:2G7V7zsVDxg1yRsu7Ew9RJ",
            "spotify:track:6FRLCMO5TUHTexlWo8ym1W",
            "spotify:track:0vA82YPx1q4JRWFISf1vIZ"
          ])
          .then(response => {
            console.log(`Added tracks!`);
            console.log(response);
          })
          .catch(error => {
            console.log(error);
          });
      })
      .catch(error => {
        console.log(error);
      });
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

        <ul>
          {this.state.songs.map(item => (
            <li key={item.title}>{item.artist} - {item.title}</li>
          ))}
        </ul>
      </div>
    );
  }
}

export default App;
