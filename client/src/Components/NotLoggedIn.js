import React, { Component } from "react";
import { Container, Jumbotron } from "reactstrap";

class NotLoggedIn extends Component {
  render() {
    return (
      <div className="mb-5">
        <Jumbotron>
          <Container className="text-center bg-transparent">
            <h1 className="display-3">Playlist Creator</h1>
            <div>
              <p className="lead mt-3 infotxt">
                Create a playlist with songs from the Billboard Hot 100. You
                will be shown the list of songs and option to remove any you
                don't like.
              </p>
              <p className="lead infotxt">
                You can also create a playlist based on an artist. Simply enter
                an artist's name in the search bar and you will be shown a list
                of related artists.
              </p>
              <p className="lead infotxt">
                To get started, simply login with your Spotify account.
              </p>
              <a
                className="btn badge-pill btn-success btn-lg"
                href="http://localhost:8888/login"
              >
                <span id="go" className="p-4 text-uppercase">
                  Login With Spotify
                </span>
              </a>
            </div>
          </Container>
        </Jumbotron>
      </div>
    );
  }
}

export default NotLoggedIn;
