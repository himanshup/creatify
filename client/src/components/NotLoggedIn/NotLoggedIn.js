import React from "react";
import { Container, Jumbotron } from "reactstrap";
import "./NotLoggedIn.css";

const NotLoggedIn = () => {
  return (
    <Jumbotron className="rounded-0 homeJumbotron">
      <Container className="bg-transparent">
        <h1 className="display-4 text-center ">Playlist Creator</h1>
        <p className="lead text-center">Easily create Spotify playlists.</p>
        <div className="text-center mt-3">
          <p className="lead">
            Create a playlist based on an artist, search criteria, your top
            tracks/artists, or with the top 100 songs from Billboard. Search for
            an artist and we will find the top tracks based on that artist. You
            can also search for keywords and we will find the top 50 matching
            playlists, along with the top 100 tracks across all 50 playlists.
          </p>

          <p className="lead">
            To get started, login with Spotify. If you don't want to login, view
            pictures{" "}
            <a
              href="https://github.com/himanshup/spotify-playlist-creator"
              className="customLinks"
            >
              here
            </a>
            .
          </p>
          <a
            className="btn badge-pill btn-success btn-lg mt-1 shadow"
            href={
              window.location.href.includes("localhost")
                ? "http://localhost:8888/login"
                : "https://playlistcreator-backend.herokuapp.com/login"
            }
          >
            <span className="p-4 text-uppercase btns">Login With Spotify</span>
          </a>
        </div>
      </Container>
    </Jumbotron>
  );
};

export default NotLoggedIn;
