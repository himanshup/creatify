import React, { Component } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Table,
  Card,
  CardImg,
  CardBody
} from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
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
      this.setState({
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
    const shuffledTracks = this.shuffle(this.state.topTracks);
    const uris = [];
    for (const track of shuffledTracks) {
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
            {this.state.loggedIn ? (
              <div>
                {!this.state.createdPlaylist && (
                  <div>
                    <div className="text-center">
                      {!this.state.gotTopTracks && (
                        <div>
                          <h1 className="mt-3">Top Artists</h1>
                          <p>
                            These are your top 10 artists. Press{" "}
                            <strong>Get Top Tracks</strong> to get a list of top
                            tracks from these artists.
                          </p>
                          <Button
                            className="btn badge-pill btn-success btn-lg pr-5 pl-5"
                            onClick={this.getTopTracks.bind(this)}
                          >
                            <span id="go" className="text-uppercase">
                              Get Top Tracks
                            </span>
                          </Button>
                        </div>
                      )}
                      {this.state.gotTopTracks && (
                        <div>
                          <h1 className="mt-3">Top Tracks</h1>
                          <p>
                            These are the top tracks for each artist. Click the
                            button to save the playlist on Spotify.
                          </p>
                          <Button
                            className="btn badge-pill btn-success btn-lg pr-5 pl-5"
                            onClick={this.getUrisAndCreatePlaylist.bind(this)}
                          >
                            <span id="go" className="text-uppercase">
                              Create Playlist
                            </span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {!this.state.gotTopTracks && (
                      <Row className="mt-3">
                        {this.state.artists.map((item, index) => (
                          <Col sm="6" md="4" lg="3" key={index}>
                            <Card className="mt-4 shadow-sm border-0 rounded-0">
                              <CardImg
                                className="rounded-0"
                                top
                                width=""
                                src={
                                  item.images[0].url
                                    ? item.images[0].url
                                    : "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
                                }
                                alt=""
                              />
                              <CardBody>{item.name}</CardBody>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    )}

                    {this.state.gotTopTracks && (
                      <Table className="mt-4" bordered striped>
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Title</th>
                            <th>Artist</th>
                          </tr>
                        </thead>
                        <tbody>
                          {this.state.topTracks &&
                            this.state.topTracks.map((item, index) => (
                              <tr key={index}>
                                <th scope="row">{index}</th>
                                <td>{item.name}</td>
                                <td>{item.artists[0].name}</td>
                              </tr>
                            ))}
                        </tbody>
                      </Table>
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
              </div>
            ) : (
              <h1 className="text-center mt-3">
                You must be logged in to do that.
              </h1>
            )}
            <Footer />
          </div>
        )}
      </Container>
    );
  }
}

export default TopArtists;
