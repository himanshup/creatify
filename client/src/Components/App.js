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
    // if (token) {
    //   spotifyApi.setAccessToken(token);
    // }
    this.state = {
      loggedIn: false,
      userId: "",
      displayName: "",
      isOpen: false
    };
  }

  componentDidMount() {
    // get user info
    const params = this.getHashParams();
    const token = params.access_token;
    if (token) {
      this.setState({
        loggedIn: token ? true : false
      });
    }
    axios
      .get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(user => {
        console.log(user);
        this.setState({
          userId: user.data.id,
          displayName: user.data.display_name
        });
      })
      .catch(error => {
        this.setState({
          loggedIn: false
        });
      });

    // spotifyApi
    //   .getMe()
    //   .then(response => {
    //     this.setState({
    //       userId: response.id,
    //       displayName: response.display_name
    //     });
    //   })
    //   .catch(error => {
    //     this.setState({
    //       loggedIn: false
    //     });
    //   });
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
                  {this.state.loggedIn && (
                    <NavItem>
                      <NavLink>{this.state.displayName}</NavLink>
                    </NavItem>
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
              return (
                <Billboard
                  userId={this.state.userId}
                  getHashParams={() => this.getHashParams()}
                />
              );
            }}
          />
          <Route
            path={`/artist/:artist`}
            render={({ match }) => {
              return (
                <Artist
                  userId={this.state.userId}
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
                  userId={this.state.userId}
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
