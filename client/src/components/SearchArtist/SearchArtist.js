import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-js";
import { Container, Row, Col, Input } from "reactstrap";
import { Link } from "react-router-dom";
import queryString from "query-string";
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
      artist: "",
      searchItem: "",
      artists: []
    };
  }

  componentDidMount() {
    const values = queryString.parse(this.props.location.search);
    this.searchArtist(values.search);
    this.setAccessToken();
  }

  setAccessToken = () => {
    const token = localStorage.getItem("token");
    if (token) {
      spotifyApi.setAccessToken(token);
      this.setState({
        loggedIn: token ? true : false
      });
      this.getUserInfo();
      // gets search results on mount
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

  searchArtist = value => {
    this.setState({
      loading: true
    });
    spotifyApi
      .searchArtists(value, { limit: 5 })
      .then(response => {
        this.setState({
          searchItem: value,
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
                    autoComplete="off"
                  />
                </Col>
                <Col />
              </Row>
              {this.state.artist && (
                <div className="text-center">
                  <Link
                    className="btn badge-pill btn-success btn-lg mt-4 pr-5 pl-5 mb-2"
                    to={`/artists?search=${this.state.artist}/${
                      window.location.hash
                    }`}
                    onClick={() => this.searchArtist(this.state.artist)}
                  >
                    <span id="go" className="text-uppercase">
                      Search Artist
                    </span>
                  </Link>
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
