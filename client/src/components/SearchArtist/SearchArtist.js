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
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import "./SearchArtist.css"
var spotifyApi = new SpotifyWebApi();

class Artist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      artist: props.params.artist,
      searchItem: props.params.artist,
      artists: []
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
      // gets search results on mount
      this.searchArtist();
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
    //search for artist passed in props
    this.setState({
      loading: true
    });
    spotifyApi
      .searchArtists(this.state.artist, { limit: 5 })
      .then(response => {
        this.setState({
          searchItem: this.state.artist,
          artist: "",
          artists: response.artists.items,
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

  updateArtist = e => {
    this.setState({
      artist: e.target.value
    });
  };

  render() {
    return (
      <Container className="mb-5">
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            {this.state.loggedIn ? (
              <div>
                <h1 className="mt-3 text-center">
                  Results for {this.state.searchItem}
                </h1>
                <p className="text-center">
                  Click on an artist to get a list of related artists.
                </p>
                <div>
                  <Row>
                    <Col />
                    <Col sm="6" lg="5" className="text-center">
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
                  <Row className="mt-4">
                    {this.state.artists.map((item, index) => (
                      <Col sm="6" md="4" lg="3" key={index}>
                        <Card className="mt-4 shadow-sm border-0 rounded-0">
                          <Link
                            to={`/create/${item.id}/${window.location.hash}`}
                          >
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

export default Artist;
