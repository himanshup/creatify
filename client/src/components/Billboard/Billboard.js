import React, { Component } from "react";
import { Container, Button, Table } from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
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
      .all([axios.get("/api/billboard1"), axios.get("/api/billboard100")])
      .then(
        axios.spread((array1, array2) => {
          const tracks = array1.data.concat(array2.data);
          this.setState({
            songs: tracks,
            loading: false
          });
        })
      )
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

  // gets track uris first and then creates the playlist
  async getUrisAndCreatePlaylist() {
    this.setState({
      loading: true
    });
    try {
      await this.getTrackUris();
      this.createPlaylist();
    } catch (error) {
      if (error) {
        this.setState({
          loggedIn: false,
          loading: false
        });
      }
    }
  }

  getTrackUris = () => {
    for (const track of this.state.songs) {
      spotifyApi
        .searchTracks(`${track.title}`, { limit: 1 })
        .then(response => {
          this.setState({
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
  };

  createPlaylist = () => {
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

  getRefreshToken = () => {
    const params = this.props.getHashParams();
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
      <Container>
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            {!this.state.billboardPlaylistCreated && (
              <div className="text-center">
                <h1 className="mt-3">The Billboard Hot 100</h1>
                <p className="">
                  These are the songs from the Billboard Hot 100.{" "}
                  {this.state.loggedIn ? (
                    <span>
                      Click the button to create a playlist and save it on
                      Spotify.
                    </span>
                  ) : (
                    <span>To create a playlist, you must be logged in.</span>
                  )}
                </p>
                {this.state.loggedIn ? (
                  <Button
                    className="btn badge-pill btn-success btn-lg"
                    onClick={this.getUrisAndCreatePlaylist.bind(this)}
                  >
                    <span id="go" className="p-4 text-uppercase">
                      Create Playlist
                    </span>
                  </Button>
                ) : (
                  <a
                    className="btn badge-pill btn-success btn-lg"
                    href={
                      window.location.href.includes("localhost")
                        ? "http://localhost:8888/login"
                        : "https://playlistcreator-backend.herokuapp.com/login"
                    }
                  >
                    <span id="go" className="p-4 text-uppercase">
                      Login With Spotify
                    </span>
                  </a>
                )}
              </div>
            )}

            {this.state.billboardPlaylistCreated && (
              <div className="text-center">
                <h1 className="mt-3">Playlist Created</h1>
                <p>Click the button to view it on Spotify.</p>
                <Button
                  className="btn badge-pill btn-success btn-lg"
                  href={this.state.billboardPlaylist.external_urls.spotify}
                >
                  <span id="go" className="p-4 text-uppercase">
                    View Playlist
                  </span>
                </Button>
              </div>
            )}
            {!this.state.billboardPlaylistCreated && (
              <Table className="mt-3" bordered striped>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Artist</th>
                  </tr>
                </thead>
                <tbody>
                  {!this.state.billboardPlaylistCreated &&
                    this.state.songs.map((item, index) => (
                      <tr key={index}>
                        <th scope="row">{item.rank}</th>
                        <td>{item.title}</td>
                        <td>
                          {item.artist}
                          <button
                            type="button"
                            className="btn close float-right"
                            onClick={() => this.removeTrack(item.title)}
                          >
                            <span aria-hidden="true">&times;</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
            <Footer />
          </div>
        )}
      </Container>
    );
  }
}

export default Billboard;
