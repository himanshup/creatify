import React, { Component } from "react";
import { Container, Button } from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import Artists from "../Artists/Artists";
import Tracks from "../Tracks/Tracks";
var spotifyApi = new SpotifyWebApi();

class TopArtists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      artists: [],
      topTracks: [],
      gotTopTracks: false,
      topTrackUris: [],
      playlistId: "",
      createdPlaylist: false,
      playlist: {}
    };
  }

  componentDidMount() {
    this.setAccessToken();
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
        return spotifyApi.getMyTopArtists({ limit: 10 });
      })
      .then(artists => {
        this.setState({
          artists: artists.items,
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

  async getTopTracks() {
    this.setState({
      loading: true
    });
    try {
      for (const artist of this.state.artists) {
        await spotifyApi
          .getArtistTopTracks(artist.id, "US")
          .then(response => {
            this.setState({
              gotTopTracks: true,
              topTracks: this.state.topTracks.concat(response.tracks)
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
      const shuffledTracks = this.shuffle(this.state.topTracks);
      this.setState({
        topTracks: shuffledTracks,
        loading: false
      });
    } catch (error) {
      if (error) {
        this.setState({
          loggedIn: false,
          loading: false
        });
      }
    }
  }

  // returns the track array with tracks in random order
  shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  //gets track uris for each track, uris are needed to add tracks to the playlist
  getTrackUris = () => {
    // const shuffledTracks = this.shuffle(this.state.topTracks);
    const uris = [];
    for (const track of this.state.topTracks) {
      uris.push(track.uri);
      this.setState({
        topTrackUris: this.state.topTrackUris.concat(uris)
      });
    }
  };

  createPlaylist = () => {
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Top Artists"
      })
      .then(playlist => {
        this.setState({
          playlistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.topTrackUris
        );
      })
      .then(response => {
        return spotifyApi.getPlaylist(this.state.userId, this.state.playlistId);
      })
      .then(playlist => {
        this.setState({
          createdPlaylist: true,
          playlist: playlist,
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

  // gets track uris first and then creates the playlist
  async getUrisAndCreatePlaylist() {
    this.setState({
      loading: true
    });
    try {
      await this.getTrackUris();
      this.createPlaylist();
    } catch (err) {
      console.log(err);
    }
  }

  render() {
    return (
      <Container>
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            {!this.state.createdPlaylist && (
              <div>
                {!this.state.gotTopTracks && (
                  <div>
                    <div className="text-center">
                      <h1 className="mt-3">Top Artists</h1>
                      <p>
                        These are your top 10 artists. Press{" "}
                        <strong>Get Top Tracks</strong> to get a list of top
                        tracks from these artists.
                      </p>
                      <Button
                        className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2"
                        onClick={this.getTopTracks.bind(this)}
                      >
                        <span id="go" className="text-uppercase">
                          Get Top Tracks
                        </span>
                      </Button>
                    </div>
                    <Artists artists={this.state.artists} links={false} />
                  </div>
                )}

                {this.state.gotTopTracks && (
                  <div>
                    <div className="text-center">
                      <h1 className="mt-3">Top Tracks</h1>
                      <p>
                        These are the top tracks for each artist. Click the
                        button to save the playlist on Spotify.
                      </p>
                      <Button
                        className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2"
                        onClick={this.getUrisAndCreatePlaylist.bind(this)}
                      >
                        <span id="go" className="text-uppercase">
                          Create Playlist
                        </span>
                      </Button>
                    </div>
                    <Tracks tracks={this.state.topTracks} />
                  </div>
                )}
              </div>
            )}

            {this.state.createdPlaylist && (
              <div className="text-center">
                <h1 className="mt-3">Playlist Created</h1>
                <p>Click the button to view it on Spotify.</p>
                <Button
                  className="btn badge-pill btn-success btn-lg pr-5 pl-5"
                  href={this.state.playlist.external_urls.spotify}
                >
                  <span id="go" className="text-uppercase">
                    View Playlist
                  </span>
                </Button>
              </div>
            )}
            <Footer />
          </div>
        )}
      </Container>
    );
  }
}

export default TopArtists;
