import React, { Component } from "react";
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
import Loading from "./Loading";
import axios from "axios";
var spotifyApi = new SpotifyWebApi();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      loading: true,
      artist: "",
      userRecommendedArtists: []
    };
  }

  componentDidMount() {
    const params = this.props.getHashParams();
    const token = params.access_token;
    this.setState({
      loggedIn: token ? true : false
    });
    // gets the top artists for the current user
    axios
      .get("https://api.spotify.com/v1/me/top/artists", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(artists => {
        for (const artist of artists.data.items) {
          if (this.state.userRecommendedArtists.length === 10) {
            break;
          } else {
            this.setState({
              userRecommendedArtists: this.state.userRecommendedArtists.concat([
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
      .then(response => {
        this.setState({
          loading: false
        });
      })
      .catch(error => {
        this.setState({
          loggedIn: false
        });
      });

    // spotifyApi
    //   .getMyTopArtists()
    //   .then(artists => {
    //     for (const artist of artists.items) {
    //       if (this.state.userRecommendedArtists.length === 10) {
    //         break;
    //       } else {
    //         this.setState({
    //           userRecommendedArtists: this.state.userRecommendedArtists.concat([
    //             {
    //               id: artist.id,
    //               name: artist.name,
    //               image: artist.images[0].url
    //             }
    //           ])
    //         });
    //       }
    //     }
    //   })
    //   .then(response => {
    //     this.setState({
    //       loading: false
    //     });
    //   })
    //   .catch(error => {
    //     this.setState({
    //       loggedIn: false
    //     });
    //   });
  }

  searchArtist = () => {
    // e.preventDefault();
    axios
      .get(
        `https://api.spotify.com/v1/search?q=${
          this.state.artist
        }&type=artist&limit=5`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.state.token}`
          }
        }
      )
      .then(results => {
        console.log(results);
        this.setState({
          artist: "",
          artists: results.data.artists.items
        });
      })
      .catch(error => {
        console.log(error);
      });
    // spotifyApi
    //   .searchArtists(this.state.artist, { limit: 5 })
    //   .then(response => {
    //     console.log(response.artists.items);
    //     this.setState({
    //       artist: "",
    //       artists: response.artists.items
    //     });
    //   })
    //   .catch(error => {
    //     console.log(error);
    //   });
  };

  updateArtist = e => {
    this.setState({
      artist: e.target.value
    });
  };

  render() {
    return (
      <div className="mb-5">
        <Jumbotron>
          <Container className="text-center bg-transparent">
            <h1 className="display-3">Playlist Creator</h1>
            <Row>
              <Col>
                <p className="lead mt-3 infotxt">
                  Create a playlist with songs from Billboard's Top 100. Click
                  the button to see a list of the songs. You can remove any you
                  don't like.
                </p>
                <Link
                  className="btn badge-pill btn-success btn-lg"
                  to={`/billboard/${window.location.hash}`}
                >
                  <span id="go" className="p-4 text-uppercase">
                    Get top 100 songs
                  </span>
                </Link>
              </Col>
              <Col>
                <p className="lead mt-3 infotxt">
                  Create a playlist based on an artist. Simply search for an
                  artist and it will get a list of related artists plus top
                  tracks for each artist.
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
                      required
                    />
                  </Col>
                  <Col />
                </Row>
                {this.state.artist && (
                  <Link
                    className="btn badge-pill btn-success btn-lg mt-4"
                    to={`/artist/${this.state.artist}/${window.location.hash}`}
                  >
                    <span id="go" className="p-4 text-uppercase">
                      Search Artist
                    </span>
                  </Link>
                )}
              </Col>
            </Row>
            <a
              className="btn badge-pill btn-success btn-lg mt-5"
              href="http://localhost:8888/login"
            >
              <span id="go" className="p-4 text-uppercase">
                Login With Spotify
              </span>
            </a>
          </Container>
        </Jumbotron>

        {this.state.loading === true && this.state.loggedIn === true ? (
          <Loading />
        ) : (
          <Container>
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
          </Container>
        )}
      </div>
    );
  }
}

export default Home;
