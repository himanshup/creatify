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
    const refresh_token = params.refresh_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      userId: "",
      refreshToken: refresh_token,
      nowPlaying: { name: "Not Checked", albumArt: "" },
      billboardPlaylistId: "",
      billboardPlaylistImg: "",
      billboardPlaylistCreated: false,
      billboardPlaylist: {},
      uris: []
    };
  }

  componentDidMount() {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });

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
        if (error) {
          this.getRefreshToken();
        }
      });
  };

  createPlaylist = () => {
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Billboard 100",
        public: true
      })
      .then(playlist => {
        console.log("Created playlist");
        this.setState({
          billboardPlaylistId: playlist.id
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
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.billboardPlaylistId
        );
      })
      .then(response => {
        console.log("Here is your final playlist:");
        this.setState({
          billboardPlaylistCreated: true,
          billboardPlaylist: response
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });
  };

  createSavedTracksPlaylist = () => {};

  getRefreshToken = () => {
    axios
      .get("/refresh_token", {
        params: { refresh_token: this.state.refreshToken }
      })
      .then(response => {
        console.log(response);
        spotifyApi.setAccessToken(response.data.access_token);
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
            <button onClick={() => this.getRefreshToken()}>
              Get Refresh Token
            </button>
          </div>
        )}
        {this.state.billboardPlaylistCreated && (
          <div>
            <img src={this.state.billboardPlaylist.images[1].url} alt="" />
            <div>
              View your playlist{" "}
              <a href={this.state.billboardPlaylist.external_urls.spotify}>
                {" "}
                here{" "}
              </a>
            </div>
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
