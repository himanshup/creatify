import React, { Component } from "react";
import "./App.css";
class Footer extends Component {
  render() {
    return (
      <div className="mt-4 mb-3">
        <footer className="footer">
          <div className="container text-center">
            <small className="text-muted">
              Created using the{" "}
              <a
                href="https://developer.spotify.com/documentation/web-api/"
                className="footerLinks"
              >
                Spotify Web API
              </a>
              . Created by{" "}
              <a
                className="footerLinks"
                href="https://github.com/himanshup/spotify-playlist-creator"
              >
                himanshup
              </a>
              .
            </small>
          </div>
        </footer>
      </div>
    );
  }
}

export default Footer;
