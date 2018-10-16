import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import Tracks from "../Tracks/Tracks";
import "./Billboard.css";
var spotifyApi = new SpotifyWebApi();

class Billboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      songs: [],
      uris: [],
      billboardPlaylistId: "",
      billboardPlaylistImg: "",
      billboardPlaylistCreated: false,
      billboardPlaylist: {}
    };
  }

  componentDidMount() {
    this.setAccessToken();
    // show list of songs
    this.getTop100Songs();
  }

  setAccessToken = () => {
    const params = this.props.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
      this.setState({
        loggedIn: token ? true : false
      });
      this.getUserInfo();
    }
  };

  getUserInfo = () => {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
        });
      })
      .catch(error => {
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  getTop100Songs = () => {
    axios
      .all([
        axios.get("/api/billboard/top/1"),
        axios.get("/api/billboard/top/99")
      ])
      .then(
        axios.spread((array1, array2) => {
          const tracks = array1.data.concat(array2.data);
          for (const track of tracks) {
            spotifyApi
              .searchTracks(`${track.title}`, { limit: 1 })
              .then(response => {
                this.setState({
                  songs: this.state.songs.concat([response.tracks.items[0]]),
                  uris: this.state.uris.concat([response.tracks.items[0].uri])
                });
              })
              .catch(error => {
                if (error) {
                  this.setState({
                    loggedIn: false,
                    loading: false
                  });
                }
              });
          }
        })
      )
      .then(response => {
        this.setState({
          loading: false
        });
      })
      .catch(error => {
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
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
    this.setState({
      loading: true
    });
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Billboard 100",
        public: true
      })
      .then(playlist => {
        this.setState({
          billboardPlaylistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.uris
        );
      })
      .then(finalPlaylist => {
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.billboardPlaylistId
        );
      })
      .then(response => {
        this.setState({
          billboardPlaylistCreated: true,
          billboardPlaylist: response,
          loading: false
        });
      })
      .catch(error => {
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  render() {
    return (
      <div>
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            <div className="jumbotron jumbotron-fluid header">
              {!this.state.billboardPlaylistCreated ? (
                <div className="container text-center">
                  <h1>The Hot 100</h1>
                  <p>
                    These are the songs from the Billboard Hot 100. Click the
                    button to create a playlist and save it on Spotify.
                  </p>
                  <button
                    className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2 shadow"
                    onClick={() => this.createPlaylist()}
                  >
                    <span className="text-uppercase btns">Create Playlist</span>
                  </button>
                </div>
              ) : (
                <div className="container text-center">
                  <h1 className="mt-3">Playlist Created</h1>
                  <p>Click the button to view it on Spotify.</p>
                  <button
                    className="btn badge-pill btn-success btn-lg pr-5 pl-5 shadow"
                    href={this.state.billboardPlaylist.external_urls.spotify}
                  >
                    <span className="text-uppercase btns">View Playlist</span>
                  </button>
                </div>
              )}
            </div>

            {!this.state.billboardPlaylistCreated && (
              <div className="container">
                <Tracks tracks={this.state.songs} />
              </div>
            )}
            <Footer />
          </div>
        )}
      </div>
    );
  }
}

export default Billboard;
