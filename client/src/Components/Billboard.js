import React, { Component } from "react";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
var spotifyApi = new SpotifyWebApi();

class Billboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      userId: props.userId,
      songs: [],
      uris: [],
      billboardPlaylistId: "",
      billboardPlaylistImg: "",
      billboardPlaylistCreated: false,
      billboardPlaylist: {}
    };
  }

  showBillboard100 = () => {
    axios
      .all([axios.get("/billboard1"), axios.get("/billboard100")])
      .then(
        axios.spread((array1, array2) => {
          const tracks = array1.data.concat(array2.data);
          this.setState({
            songs: tracks
          });
        })
      )
      .catch(error => {
        console.log(error);
      });
  };

  removeTrack = title => {
    this.setState(currentState => {
      return {
        songs: currentState.songs.filter(song => song.title !== title)
      };
    });
  };

  createPlaylist = () => {
    for (const track of this.state.songs) {
      spotifyApi.searchTracks(`${track.title}`, { limit: 1 }).then(response => {
        this.setState({
          uris: this.state.uris.concat([response.tracks.items[0].uri])
        });
      });
    }
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

  getRefreshToken = () => {
    const params = this.getHashParams();
    const refresh_token = params.refresh_token;
    axios
      .get("/refresh_token", {
        params: { refresh_token: refresh_token }
      })
      .then(response => {
        spotifyApi.setAccessToken(response.data.access_token);
      })
      .catch(error => {
        console.log(error);
      });
  };

  render() {
    return (
      <div>
        {this.state.loggedIn && (
          <div>
            <h1>Create a playlist with songs from Billboards Hot 100</h1>
            <button onClick={() => this.showBillboard100()}>
              Show Billboard 100
            </button>
            <button onClick={() => this.createPlaylist()}>
              Create Playlist
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
        <ul>
          {this.state.songs.map((item, index) => (
            <li key={index}>
              {item.artist} - {item.title}{" "}
              <button onClick={() => this.removeTrack(item.title)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default Billboard;
