import React, { Component } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { Container, Col, Row, Input, Jumbotron } from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import NotLoggedIn from "../NotLoggedIn/NotLoggedIn";
import Artists from "../Artists/Artists";
var spotifyApi = new SpotifyWebApi();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      userId: "",
      loading: true,
      artist: "",
      userRecommendedArtists: []
    };
  }

  componentDidMount() {
    this.setAccessToken();
  }

  getUserTopArtists = () => {
    spotifyApi
      .getMyTopArtists({ limit: 8 })
      .then(artists => {
        this.setState({
          userRecommendedArtists: artists.items
        });
      })
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

  setAccessToken = () => {
    const params = this.props.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
      this.setState({
        loggedIn: token ? true : false
      });
      this.getUserInfo();
      this.getUserTopArtists();
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

  searchArtist = () => {
    // e.preventDefault();
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
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  updateArtist = e => {
    this.setState({
      artist: e.target.value
    });
  };

  render() {
    return (
      <div>
        <Jumbotron className="rounded-0 homeJumbotron">
          <Container className="text-center bg-transparent">
            <h1 className="display-3">Playlist Creator</h1>
            <p className="lead mt-3">Easily create Spotify playlists.</p>
            {this.state.loggedIn ? (
              <Row>
                <Col>
                  <p className="lead mt-2">
                    Create a playlist with songs from Billboard's Top 100. Click
                    the button to see a list of the songs.
                  </p>
                  <Link
                    className="btn badge-pill btn-success btn-lg mb-3 pr-5 pl-5"
                    to={`/billboard/${window.location.hash}`}
                  >
                    <span id="go" className="text-uppercase">
                      Get top 100 songs
                    </span>
                  </Link>
                </Col>
                <Col>
                  <p className="lead mt-2">
                    Create a playlist based on an artist. Simply search for an
                    artist and you will be shown a list of related artists.
                  </p>
                  <Row>
                    <Col />
                    <Col xs="8" className="text-center">
                      <Input
                        type="text"
                        name="artist"
                        placeholder="Artist Name"
                        className="rounded-0"
                        value={this.state.artist}
                        onChange={this.updateArtist}
                        autoComplete="off"
                      />
                    </Col>
                    <Col />
                  </Row>
                  {this.state.artist && (
                    <Link
                      className="btn badge-pill btn-success btn-lg mt-4 pr-5 pl-5"
                      to={`/artists?search=${this.state.artist}${
                        window.location.hash
                      }`}
                    >
                      <span id="go" className="text-uppercase">
                        Search Artist
                      </span>
                    </Link>
                  )}
                </Col>
              </Row>
            ) : (
              <NotLoggedIn />
            )}
          </Container>
        </Jumbotron>

        {this.state.loading && this.state.loggedIn ? (
          <Loading />
        ) : (
          <Container>
            {this.state.loggedIn && (
              <div>
                <h4 className="text-muted">Recommended artists for you</h4>
                <Artists artists={this.state.userRecommendedArtists} />
              </div>
            )}
            <Footer />
          </Container>
        )}
      </div>
    );
  }
}

export default Home;
