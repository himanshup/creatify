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
import Home from "./Home";
import Billboard from "./Billboard";
import Artist from "./Artist";
import RelatedArtists from "./RelatedArtists";
// import logo from "./spotifylogo.png";
import SpotifyWebApi from "spotify-web-api-js";

var spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(props) {
    super(props);
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
    }
    this.state = {
      loggedIn: token ? true : false,
      userId: "",
      displayName: "",
      isOpen: false
    };
  }

  componentDidMount() {
    // get user info
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id,
          displayName: response.display_name
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

  toggle = () => {
    this.setState({
      isOpen: !this.state.isOpen
    });
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

  renderLinks = () => {
    if (this.state.loggedIn === true) {
      return (
        <div>
          <div>
            <Link to={`/billboard/${window.location.hash}`}>Billboard</Link>
          </div>

          <div>
            <Link to={`/artist/${window.location.hash}`}>Artist</Link>
          </div>
        </div>
      );
    }
  };

  render() {
    return (
      <BrowserRouter>
        <div>
          <Navbar dark expand="md">
            <Container>
              <Link className="navbar-brand" to={`/${window.location.hash}`}>
                {/* <img src={logo} alt="" width="170" /> */}
                Playlist Creator
              </Link>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  <NavItem>
                    {this.state.loggedIn === false && (
                      <a
                        className="btn badge-pill btn-success btn-lg"
                        href="http://localhost:8888/login"
                      >
                        <span id="go" className="p-4 text-uppercase">
                          Login with Spotify
                        </span>
                      </a>
                    )}
                  </NavItem>
                  {this.state.loggedIn && (
                    <NavItem>
                      <NavLink>Logged in as {this.state.displayName}</NavLink>
                    </NavItem>
                  )}
                </Nav>
              </Collapse>
            </Container>
          </Navbar>

          {/* {this.state.loggedIn && (
              <h1 className="text-center mt-3">
                Welcome {this.state.displayName}
              </h1>
            )} */}

          <Route exact path="/" component={Home} />
          <Route
            path={`/billboard`}
            render={() => {
              return (
                <Billboard
                  loggedIn={this.state.loggedIn}
                  userId={this.state.userId}
                />
              );
            }}
          />
          <Route
            path={`/artist/:artist`}
            render={({ match }) => {
              return (
                <Artist
                  loggedIn={this.state.loggedIn}
                  userId={this.state.userId}
                  params={match.params}
                />
              );
            }}
          />
          <Route
            path={`/create/:artistId`}
            render={({ match }) => {
              return (
                <RelatedArtists
                  loggedIn={this.state.loggedIn}
                  userId={this.state.userId}
                  params={match.params}
                />
              );
            }}
          />
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
