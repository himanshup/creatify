import React, { Component } from "react";
import "./Home.css";
import { Link } from "react-router-dom";
import { Container, Dropdown, DropdownMenu, DropdownToggle } from "reactstrap";
import { IoIosSearch } from "react-icons/io";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";

import Artists from "../Artists/Artists";

var spotifyApi = new SpotifyWebApi();

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      userId: "",
      loading: true,
      query: "",
      userRecommendedArtists: [],
      dropdownOpen: false,
      searchBy: "artists"
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

  updateValue = e => {
    this.setState({
      query: e.target.value
    });
  };

  toggle = () => {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen
    });
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          <Loading />
        ) : (
          <div>
            <div className="jumbotron jumbotron-fluid homeJumbotron">
              <div className="container">
                <h1 className="display-4 text-center">Playlist Creator</h1>
                <p className="lead text-center">
                  Easily create Spotify playlists.
                </p>

                <div className="row mt-5">
                  <div className="col" />
                  <div className="col-12 col-md-8 col-lg-6">
                    <Dropdown
                      isOpen={this.state.dropdownOpen}
                      toggle={this.toggle}
                      direction="down"
                      className="text-center"
                    >
                      <span className="lead">Search</span>{" "}
                      <DropdownToggle
                        tag="span"
                        className="border-bottom dropdownToggle"
                        onClick={this.toggle}
                        data-toggle="dropdown"
                        aria-expanded={this.state.dropdownOpen}
                        caret
                      >
                        <span className="lead text-capitalize">
                          {this.state.searchBy}
                        </span>
                      </DropdownToggle>
                      <DropdownMenu className="border-0 shadow-sm">
                        <div
                          className="dropdown-item"
                          onClick={() => {
                            this.setState({ searchBy: "artists" });
                          }}
                        >
                          Artists
                        </div>
                        <div
                          className="dropdown-item"
                          onClick={() => {
                            this.setState({ searchBy: "playlists" });
                          }}
                        >
                          Playlists
                        </div>
                      </DropdownMenu>
                    </Dropdown>
                    <div className="card mt-4 border-0 badge-pill search p-2">
                      <div className="d-flex">
                        <input
                          type="text"
                          name="artist"
                          className="form-control form-control-lg border-0 "
                          placeholder={
                            this.state.searchBy === "artists"
                              ? "Artist Name"
                              : "Keywords"
                          }
                          value={
                            this.state.searchBy === "artists"
                              ? this.state.artist
                              : this.state.term
                          }
                          onChange={this.updateValue}
                          autoComplete="off"
                        />
                        <div className="align-self-center">
                          <Link
                            className={`btn btn-success searchBtn shadow ${this
                              .state.query.length < 1 && `disabled`}`}
                            to={`/${this.state.searchBy}?search=${
                              this.state.query
                            }${window.location.hash}`}
                          >
                            <IoIosSearch size="25" className="mt-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col" />
                </div>
              </div>
            </div>
            <Container className="mt-4">
              <h4 className="text-muted">Recommended artists for you</h4>
              <Artists artists={this.state.userRecommendedArtists} />
              <Footer />
            </Container>
          </div>
        )}
      </div>
    );
  }
}

export default Home;
