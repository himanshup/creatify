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
import Home from "../Home/Home";
import Billboard from "../Billboard/Billboard";
import Artist from "../SearchArtist/SearchArtist";
import RelatedArtists from "../RelatedArtists/RelatedArtists";
import SpotifyWebApi from "spotify-web-api-js";

var spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: false,
      userId: "",
      displayName: "",
      isOpen: false
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
          loading: false
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
              <Link className="navbar-brand" to={`/${window.location.hash}`}>
                Playlist Creator
              </Link>
              <NavbarToggler onClick={this.toggle} />
              <Collapse isOpen={this.state.isOpen} navbar>
                <Nav className="ml-auto" navbar>
                  {this.state.loggedIn ? (
                    <NavItem>
                      <NavLink>{this.state.displayName}</NavLink>
                    </NavItem>
                  ) : (
                    <NavLink href="https://playlistcreator-backend.herokuapp.com/login">
                      Login
                    </NavLink>
                  )}
                </Nav>
              </Collapse>
            </Container>
          </Navbar>

          <Route
            exact
            path={`/`}
            render={() => {
              return <Home getHashParams={() => this.getHashParams()} />;
            }}
          />
          <Route
            path={`/billboard`}
            render={() => {
              return <Billboard getHashParams={() => this.getHashParams()} />;
            }}
          />
          <Route
            path={`/artist/:artist`}
            render={({ match }) => {
              return (
                <Artist
                  params={match.params}
                  getHashParams={() => this.getHashParams()}
                />
              );
            }}
          />
          <Route
            path={`/create/:artistId`}
            render={({ match }) => {
              return (
                <RelatedArtists
                  params={match.params}
                  getHashParams={() => this.getHashParams()}
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
