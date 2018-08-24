import React, { Component } from "react";
import Home from "./Home";
import Billboard from "./Billboard";
import Artist from "./Artist";
import { BrowserRouter, Route, Link } from "react-router-dom";
import "./App.css";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
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
      userId: ""
    };
  }

  componentDidMount() {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id,
          displayName: response.display_name
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });
  }

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
      <div>
        <BrowserRouter>
          <div>
            <div>
              <div>
                <Link to={`/${window.location.hash}`}>Home</Link>
              </div>
            </div>

            {this.renderLinks()}

            {this.state.loggedIn && <h1>Welcome {this.state.displayName}</h1>}
            <hr />

            <Route exact path="/" component={Home} />

            <Route
              path="/billboard"
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
              path="/artist"
              render={() => {
                return (
                  <Artist
                    loggedIn={this.state.loggedIn}
                    userId={this.state.userId}
                  />
                );
              }}
            />
          </div>
        </BrowserRouter>
      </div>
    );
  }
}

export default App;
