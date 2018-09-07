import React, { Component } from "react";
import { FaGithub } from "react-icons/fa";
import "./Footer.css";

class Footer extends Component {
  render() {
    return (
      <div className="mt-5 mb-4">
        <footer className="footer">
          <div className="container text-center">
            <a
              href="https://github.com/himanshup/spotify-playlist-creator"
              className="text-dark"
            >
              <FaGithub className="footerIcon" />
            </a>
          </div>
        </footer>
      </div>
    );
  }
}

export default Footer;
