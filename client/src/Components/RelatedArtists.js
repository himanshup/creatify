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
  CardBody,
  Form,
  FormGroup,
  Label,
  FormText
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
        console.log(error);
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
      let response = await this.getTracks();
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
          playlistCreated: true,
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
        {this.state.loggedIn && (
          <div>
            <div className="text-center">
              <h1 className="mt-3 text-center">Current Artists</h1>
              {/* <p className="text-center">
                Press <strong>Get Top Tracks</strong> to get a list of top
                tracks from these artists.
              </p> */}
              <p className="text-center">
                These are the top tracks for each artist. Press{" "}
                <strong>Create Playlist</strong> to save the playlist on
                Spotify.
              </p>
              {!this.state.gotTopTracks && (
                <Button
                  className="btn badge-pill btn-success btn-lg"
                  onClick={() => this.getTopTracks()}
                >
                  <span id="go" className="p-4 text-uppercase">
                    Get Top Tracks
                  </span>
                </Button>
              )}
              {this.state.gotTopTracks && (
                <div>
                  <Row>
                    <Col />
                    <Col sm="6" lg="5" className="text-center">
                      <Form
                        onSubmit={this.getTracksAndCreatePlaylist.bind(this)}
                      >
                        <FormGroup>
                          <Input
                            type="text"
                            name="title"
                            placeholder="Playlist Title"
                            className="rounded-0"
                            value={this.state.playlistName}
                            onChange={this.updateTitle}
                            required
                          />
                        </FormGroup>
                        <Button className="btn badge-pill btn-success btn-lg">
                          <span id="go" className="p-4 text-uppercase">
                            Create Playlist
                          </span>
                        </Button>
                      </Form>
                    </Col>
                    <Col />
                  </Row>
                  {/* {this.state.playlistName && <div className="text-center" />} */}
                </div>
              )}
            </div>

            <Row className="mt-5">
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
            {this.state.topTracks && (
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
        {/* {this.state.playlistCreated && (
          <div>
            <img src={this.state.playlist.images[1].url} alt="" />
            <div>
              View your playlist{" "}
              <a href={this.state.playlist.external_urls.spotify}> here </a>
            </div>
          </div>
        )} */}
      </Container>
    );
  }
}

export default RelatedArtists;
