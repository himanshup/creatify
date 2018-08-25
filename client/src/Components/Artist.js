import React, { Component } from "react";
import { Link } from "react-router-dom";
import SpotifyWebApi from "spotify-web-api-js";
import {
  Container,
  Row,
  Col,
  Button,
  Card,
  CardImg,
  CardBody,
  Input
} from "reactstrap";

var spotifyApi = new SpotifyWebApi();

class Artist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      userId: props.userId,
      artist: props.params.artist,
      searchItem: props.params.artist,
      artists: [],
      playlistArtists: [],
      artistsTopTracks: [],
      artistTopTracksUris: [],
      artistTopTracksPlaylistId: "",
      artistPlaylistCreated: false,
      artistPlaylist: {}
    };
  }

  componentDidMount() {
    spotifyApi
      .searchArtists(this.state.artist, { limit: 5 })
      .then(response => {
        console.log(response.artists.items);
        this.setState({
          artist: "",
          artists: response.artists.items
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  getAllArtistsTopTracks = () => {
    for (const artist of this.state.playlistArtists) {
      spotifyApi
        .getArtistTopTracks(artist.id, "US")
        .then(response => {
          console.log(response);
          this.setState({
            artistsTopTracks: this.state.artistsTopTracks.concat(
              response.tracks
            )
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  // addArtist = (id, name) => {
  //   if (this.state.playlistArtists.length === 10) {
  //     console.log("You've reached the limit, only ten artists!");
  //   } else {
  //     this.setState({
  //       playlistArtists: this.state.playlistArtists.concat([
  //         { id: id, name: name }
  //       ])
  //     });
  //   }
  // };

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
              playlistArtists: this.state.playlistArtists.concat([
                {
                  id: artist.id,
                  name: artist.name,
                  image: artist.images[1].url
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

  shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  getTracks = () => {
    // const shuffledPosts = this.shuffle(this.state.artistsTopTracks);
    const shuffledPosts = this.state.artistsTopTracks;
    const trackUris = [];
    for (const track of shuffledPosts) {
      trackUris.push(track.uri);
      this.setState({
        artistTopTracksUris: this.state.artistTopTracksUris.concat(trackUris)
      });
    }
  };

  createFinalPlaylist = () => {
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Test Playlist",
        public: true
      })
      .then(playlist => {
        console.log("Created Playlist");
        this.setState({
          artistTopTracksPlaylistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.artistTopTracksUris
        );
      })
      .then(response => {
        console.log("Added tracks to your playlist");
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.artistTopTracksPlaylistId
        );
      })
      .then(playlist => {
        this.setState({
          artistPlaylistCreated: true,
          artistPlaylist: playlist
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

  searchArtist = () => {
    // e.preventDefault();
    spotifyApi
      .searchArtists(this.state.artist, { limit: 5 })
      .then(response => {
        console.log(response.artists.items);
        this.setState({
          searchItem: this.state.artist,
          artist: "",
          artists: response.artists.items
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  updateArtist = e => {
    this.setState({
      artist: e.target.value
    });
  };

  render() {
    return (
      <Container className="mb-5">
        <h1 className="mt-3 text-center">
          Results for {this.state.searchItem}
        </h1>
        <p className="text-center">
          Search for an artist and then click on them to get a list of related
          artists.
        </p>
        {this.state.loggedIn && (
          <div>
            {this.state.playlistArtists.length !== 10 && (
              <div>
                <Row>
                  <Col />
                  <Col sm="6" lg="5" className="text-center">
                    <Input
                      type="text"
                      name="artist"
                      placeholder="Artist name"
                      className="rounded-0"
                      value={this.state.artist}
                      onChange={this.updateArtist}
                      required
                    />
                  </Col>
                  <Col />
                </Row>
                {this.state.artist && (
                  <div className="text-center">
                    <Button
                      className="btn badge-pill btn-success btn-lg mt-4"
                      onClick={() => this.searchArtist()}
                    >
                      <span id="go" className="p-4 text-uppercase">
                        Search Artist
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            )}
            <Row className="mt-5">
              {this.state.artists.map((item, index) => (
                <Col sm="6" md="4" lg="3" key={index}>
                  <Card className="mt-4 shadow-sm border-0 rounded-0">
                    <Link to={`/create/${item.id}/${window.location.hash}`}>
                      <CardImg
                        className="rounded-0"
                        top
                        width=""
                        src={
                          item.images.length > 0
                            ? item.images[0].url
                            : "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
                        }
                        alt=""
                      />
                    </Link>
                    <CardBody>{item.name}</CardBody>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Container>
    );
  }
}

export default Artist;
