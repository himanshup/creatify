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
var spotifyApi = new SpotifyWebApi();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      artist: "",
      userRecommendedArtists: []
    };
  }

  componentDidMount() {
    // gets the top artists for the current user
    spotifyApi
      .getMyTopArtists()
      .then(artists => {
        for (const artist of artists.items) {
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
      .catch(error => {
        console.log(error);
      });
  }

  searchArtist = e => {
    e.preventDefault();
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
                  Create a playlist with songs from the Billboard Hot 100. Click
                  the button to see a list of the songs. You can remove any you
                  don't like.
                </p>
                <Link
                  className="btn badge-pill btn-success btn-lg"
                  to={`/billboard/${window.location.hash}`}
                >
                  <span id="go" className="p-4 text-uppercase">
                    Create Playlist
                  </span>
                </Link>
              </Col>
              <Col>
                <p className="lead mt-3 infotxt">
                  Create a playlist based on an artist. Simply search for an
                  artist and it will get a list of related artists + top tracks
                  for each artist.
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
          </Container>
        </Jumbotron>
        {!this.state.loggedIn && (
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
