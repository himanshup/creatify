import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { Container, Row, Col, Button, Input } from "reactstrap";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import Artists from "../Artists/Artists";
import "./SearchArtist.css";
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
            <h1 className="mt-3 text-center">
              Results for {this.state.searchItem}
            </h1>
            <div>
              <Row>
                <Col />
                <Col
                  sm="6"
                  lg="5"
                  className={`text-center mt-1 ${!this.state.artist && `mb-2`}`}
                >
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
                    className="btn badge-pill btn-success btn-lg mt-4 pr-5 pl-5 mb-2"
                    onClick={() => this.searchArtist()}
                  >
                    <span id="go" className="text-uppercase">
                      Search Artist
                    </span>
                  </Button>
                </div>
              )}
              <Artists artists={this.state.artists} />
            </div>
            <Footer />
          </div>
        )}
      </Container>
    );
  }
}

export default Artist;
