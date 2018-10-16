import React, { Component } from "react";
import "./App.css";
import { BrowserRouter, Route, Link } from "react-router-dom";
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-js";
import Home from "../Home/Home";
import Billboard from "../Billboard/Billboard";
import SearchArtist from "../SearchArtist/SearchArtist";
import RelatedArtists from "../RelatedArtists/RelatedArtists";
import TopTracks from "../TopTracks/TopTracks";
import TopArtists from "../TopArtists/TopArtists";
import Playlists from "../Playlists/Playlists";
import NotLoggedIn from "../NotLoggedIn/NotLoggedIn";

var spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      userId: "",
      displayName: "",
      isOpen: false,
      activeTab: "",
      redirect: false
    };
  }

  componentDidMount() {
    // get user info
    this.getAccessToken();
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
  };

  getUserInfo = () => {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id,
          displayName: response.display_name
        });
      })
      .catch(error => {
        this.setState({
          loggedIn: false,
          loading: false,
          redirect: true
        });
      });
  };

  getAccessToken = () => {
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
      this.setState({
        loggedIn: token ? true : false
      });
      this.getUserInfo();
    }
  };

  getRefreshToken = () => {
    const params = this.getHashParams();
    const refresh_token = params.refresh_token;
    axios
      .get("/refresh_token", {
        params: { refresh_token: refresh_token }
      })
      .then(response => {
        spotifyApi.setAccessToken(response.data.access_token);
      })
      .catch(error => {
        console.log(error);
      });
  };

  getHashParams = () => {
    var hashParams = {};
    var e,
      r = /([^&;=]+)=?([^&;]*)/g,
      q = window.location.hash.substring(1);
    e = r.exec(q);
    while (e) {
      hashParams[e[1]] = decodeURIComponent(e[2]);
      e = r.exec(q);
    }
    return hashParams;
  };

  render() {
    return (
      <BrowserRouter>
        <div>
          <Navbar dark expand="md">
            <Container>
              <Link
                className="navbar-brand"
                to={`/${window.location.hash}`}
                onClick={() => this.setState({ activeTab: "" })}
              >
                Playlist Creator
              </Link>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                {this.state.loggedIn && (
                  <Nav className="mr-auto verticalLine" navbar>
                    <NavItem
                      className={
                        this.state.activeTab === "tracks" ? "active" : ""
                      }
                      onClick={() => this.setState({ activeTab: "tracks" })}
                    >
                      <Link
                        to={`/top/tracks/${window.location.hash}`}
                        className="nav-link"
                      >
                        Top Tracks
                      </Link>
                    </NavItem>
                    <NavItem
                      className={
                        this.state.activeTab === "artists" ? "active" : ""
                      }
                      onClick={() => this.setState({ activeTab: "artists" })}
                    >
                      <Link
                        to={`/top/artists/${window.location.hash}`}
                        className="nav-link"
                      >
                        Top Artists
                      </Link>
                    </NavItem>
                    <NavItem
                      className={
                        this.state.activeTab === "billboard" ? "active" : ""
                      }
                      onClick={() => this.setState({ activeTab: "billboard" })}
                    >
                      <Link
                        to={`/billboard/${window.location.hash}`}
                        className="nav-link"
                      >
                        Hot 100
                      </Link>
                    </NavItem>
                  </Nav>
                )}
                <Nav className="ml-auto" navbar>
                  {this.state.loggedIn ? (
                    <NavItem>
                      <NavLink>{this.state.displayName}</NavLink>
                    </NavItem>
                  ) : (
                    <NavLink
                      href={
                        window.location.href.includes("localhost")
                          ? "http://localhost:8888/login"
                          : "https://playlistcreator-backend.herokuapp.com/login"
                      }
                    >
                      Login
                    </NavLink>
                  )}
                </Nav>
              </Collapse>
            </Container>
          </Navbar>

          {/* {this.state.redirect && <Redirect to="/" />} */}
          {this.state.loggedIn ? (
            <div>
              <Route
                exact
                path={`/`}
                render={() => {
                  return <Home getHashParams={() => this.getHashParams()} />;
                }}
              />
              <Route
                path={`/playlists`}
                render={props => {
                  return (
                    <Playlists
                      getHashParams={() => this.getHashParams()}
                      {...props}
                    />
                  );
                }}
              />
              <Route
                path={`/billboard`}
                render={() => {
                  return (
                    <Billboard getHashParams={() => this.getHashParams()} />
                  );
                }}
              />
              <Route
                path={`/artists`}
                render={props => {
                  return (
                    <SearchArtist
                      getHashParams={() => this.getHashParams()}
                      {...props}
                    />
                  );
                }}
              />
              <Route
                path={`/artist/:artistId`}
                render={({ match }) => {
                  return (
                    <RelatedArtists
                      params={match.params}
                      getHashParams={() => this.getHashParams()}
                    />
                  );
                }}
              />
              <Route
                path={`/top/tracks`}
                render={() => {
                  return (
                    <TopTracks getHashParams={() => this.getHashParams()} />
                  );
                }}
              />
              <Route
                path={`/top/artists`}
                render={() => {
                  return (
                    <TopArtists getHashParams={() => this.getHashParams()} />
                  );
                }}
              />
            </div>
          ) : (
            <NotLoggedIn />
          )}
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
