import React, { Component } from "react";
import {
  Container,
  Button,
  Row,
  Col,
  Input,
  Table,
  Card,
  CardImg,
  CardBody
} from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
var spotifyApi = new SpotifyWebApi();

class RelatedArtists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      userId: props.userId,
      searchedArtistId: props.params.artistId,
      artistFound: false,
      artists: [],
      topTracks: [],
      gotTopTracks: false,
      topTrackUris: [],
      playlistName: "",
      playlistId: "",
      createdPlaylist: false,
      playlist: {}
    };
  }

  componentDidMount() {
    spotifyApi
      .getArtist(this.state.searchedArtistId)
      .then(artist => {
        this.setState({
          artistFound: true,
          artists: this.state.artists.concat([
            { id: artist.id, name: artist.name, image: artist.images[0].url }
          ])
        });
      })
      .then(response => {
        return spotifyApi.getArtistRelatedArtists(this.state.searchedArtistId);
      })
      .then(relatedArtists => {
        console.log(relatedArtists.artists);
        for (const artist of relatedArtists.artists) {
          if (this.state.artists.length === 10) {
          } else {
            this.setState({
              artists: this.state.artists.concat([
                {
                  id: artist.id,
                  name: artist.name,
                  image: artist.images[0].url
                }
              ])
            });
          }
        }
      })
      .catch(error => {
        console.log("error");
      });
  }

  getTopTracks = () => {
    for (const artist of this.state.artists) {
      spotifyApi
        .getArtistTopTracks(artist.id, "US")
        .then(response => {
          console.log(response);
          this.setState({
            gotTopTracks: true,
            topTracks: this.state.topTracks.concat(response.tracks)
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  getRelatedArtists = (id, name) => {
    this.setState({
      artists: [],
      playlistArtists: this.state.playlistArtists.concat([
        { id: id, name: name }
      ])
    });
    spotifyApi
      .getArtistRelatedArtists(id)
      .then(response => {
        console.log(response.artists);
        for (const artist of response.artists) {
          if (this.state.playlistArtists.length === 10) {
          } else {
            this.setState({
              artists: this.state.artists.concat([
                {
                  id: artist.id,
                  name: artist.name,
                  image: artist.images[0].url
                }
              ])
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  shuffle = array => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  getTracks = () => {
    const shuffledTracks = this.shuffle(this.state.topTracks);
    // const shuffledPosts = this.state.artistsTopTracks;
    const uris = [];
    for (const track of shuffledTracks) {
      uris.push(track.uri);
      this.setState({
        topTrackUris: this.state.topTrackUris.concat(uris)
      });
    }
  };

  async getTracksAndCreatePlaylist() {
    try {
      await this.getTracks();
      this.createPlaylist();
    } catch (err) {
      console.log(err);
    }
  }

  createPlaylist = () => {
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: this.state.playlistName
      })
      .then(playlist => {
        console.log("Created Playlist");
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
        console.log("Added tracks to your playlist");
        return spotifyApi.getPlaylist(this.state.userId, this.state.playlistId);
      })
      .then(playlist => {
        this.setState({
          createdPlaylist: true,
          playlist: playlist
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  removeArtist = id => {
    this.setState(currentState => {
      return {
        playlistArtists: currentState.playlistArtists.filter(
          artist => artist.id !== id
        )
      };
    });
  };

  updateTitle = e => {
    this.setState({
      playlistName: e.target.value
    });
  };

  render() {
    return (
      <Container className="mb-5">
        {this.state.artistFound ? (
          <div>
            {!this.state.createdPlaylist && (
              <div>
                <div className="text-center">
                  {!this.state.gotTopTracks && (
                    <div>
                      <h1 className="mt-3">Related Artists</h1>
                      <p>
                        Press <strong>Get Top Tracks</strong> to get a list of
                        top tracks from these artists.
                      </p>
                      <Button
                        className="btn badge-pill btn-success btn-lg"
                        onClick={() => this.getTopTracks()}
                      >
                        <span id="go" className="p-4 text-uppercase">
                          Get Top Tracks
                        </span>
                      </Button>
                    </div>
                  )}
                  {this.state.gotTopTracks && (
                    <div>
                      <h1 className="mt-3">Top Tracks</h1>
                      <p>
                        These are the top tracks for each artist. To save the
                        playlist on Spotify, enter a playlist name and press{" "}
                        <strong>Create Playlist</strong>.
                      </p>
                      <Row>
                        <Col />
                        <Col sm="6" lg="5" className="text-center">
                          <Input
                            type="text"
                            name="title"
                            placeholder="Playlist Name"
                            className="rounded-0"
                            value={this.state.playlistName}
                            onChange={this.updateTitle}
                          />

                          {this.state.playlistName && (
                            <Button
                              className="btn badge-pill btn-success btn-lg mt-3"
                              onClick={this.getTracksAndCreatePlaylist.bind(
                                this
                              )}
                            >
                              <span id="go" className="p-4 text-uppercase">
                                Create Playlist
                              </span>
                            </Button>
                          )}
                        </Col>
                        <Col />
                      </Row>
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
                            src={item.image}
                            alt=""
                          />
                          <CardBody>{item.name}</CardBody>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                )}

                {this.state.gotTopTracks && (
                  <Table className="mt-3" bordered striped>
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
                <p>Playlist created, click the button to view it on Spotify.</p>
                <Button
                  className="btn badge-pill btn-success btn-lg"
                  href={this.state.playlist.external_urls.spotify}
                >
                  <span id="go" className="p-4 text-uppercase">
                    View Playlist
                  </span>
                </Button>
              </div>
            )}
          </div>
        ) : (
          <h1 className="text-center mt-3">Couldn't find that Artist</h1>
        )}
      </Container>
    );
  }
}

export default RelatedArtists;
