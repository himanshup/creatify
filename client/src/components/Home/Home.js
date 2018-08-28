import React, { Component } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import {
  Container,
  Col,
  Row,
  Input,
  Jumbotron,
  Card,
  CardImg,
  CardBody
} from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
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
      .getMyTopArtists()
      .then(artists => {
        for (const artist of artists.items) {
          if (this.state.userRecommendedArtists.length === 8) {
            break;
          } else {
            if (artist.images.length < 1) {
              this.setState({
                userRecommendedArtists: this.state.userRecommendedArtists.concat(
                  [
                    {
                      id: artist.id,
                      name: artist.name,
                      image:
                        "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
                    }
                  ]
                )
              });
            } else {
              this.setState({
                userRecommendedArtists: this.state.userRecommendedArtists.concat(
                  [
                    {
                      id: artist.id,
                      name: artist.name,
                      image: artist.images[0].url
                    }
                  ]
                )
              });
            }
          }
        }
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
        <Jumbotron className="rounded-0">
          <Container className="text-center bg-transparent">
            <h1 className="display-3">The Playlist Creator</h1>
            <p className="lead mt-3 infotxt">
              Easily create Spotify playlists.
            </p>
            {/* <p className="lead">
              Playlist Creator can create a Spotify playlist with songs from Billboard's
              Top 100 or based on an artist. To see a list of the top 100 songs,
              click{" "}
              <Link
                className="text-success"
                to={`/billboard/${window.location.hash}`}
              >
                here
              </Link>
              . To create a playlist based on an artist, simply search for one
              and you will be shown a list of related artists plus top tracks
              for each artist.
            </p>

            <p className="lead">
              To get started, login with your Spotify account.
            </p>
            <a
              className="btn badge-pill btn-success btn-lg mt-1"
              href="http://localhost:8888/login"
            >
              <span id="go" className="p-4 text-uppercase">
                Login With Spotify
              </span>
            </a> */}
            <Row>
              <Col>
                <p className="lead mt-2 infotxt">
                  Create a Spotify playlist with songs from Billboard's Top 100.
                  Click the button to see a list of the songs. You can remove
                  any you don't like.
                </p>
                <Link
                  className="btn badge-pill btn-success btn-lg mb-3"
                  to={`/billboard/${window.location.hash}`}
                >
                  <span id="go" className="p-4 text-uppercase">
                    Get top 100 songs
                  </span>
                </Link>
              </Col>
              <Col>
                <p className="lead mt-2 infotxt">
                  Create a Spotify playlist based on an artist. Simply search
                  for an artist and you will be shown a list of related artists
                  plus top tracks for each artist.{" "}
                  {!this.state.loggedIn && (
                    <span>
                      To get started, login with your Spotify account.
                    </span>
                  )}
                </p>
                {this.state.loggedIn && (
                  <div>
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
                          required
                        />
                      </Col>
                      <Col />
                    </Row>
                    {this.state.artist && (
                      <Link
                        className="btn badge-pill btn-success btn-lg mt-4"
                        to={`/artist/${this.state.artist}/${
                          window.location.hash
                        }`}
                      >
                        <span id="go" className="p-4 text-uppercase">
                          Search Artist
                        </span>
                      </Link>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Container>
        </Jumbotron>

        {this.state.loading && this.state.loggedIn ? (
          <Loading />
        ) : (
          <Container>
            {this.state.loggedIn && (
              <div>
                <h4 className="text-muted">Recommended artists for you</h4>
                <Row>
                  {this.state.userRecommendedArtists.map((item, index) => (
                    <Col sm="6" md="4" lg="3" key={index}>
                      <Card className="mt-4 shadow-sm border-0 rounded-0">
                        <Link to={`/create/${item.id}/${window.location.hash}`}>
                          <CardImg
                            className="rounded-0"
                            top
                            width=""
                            src={item.image}
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
        )}
        <Footer />
      </div>
    );
  }
}

export default Home;
