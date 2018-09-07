import React from "react";

const NotLoggedIn = () => {
  return (
    <div>
      <p className="lead">
        Playlist Creator can create a playlist based on an artist or with songs
        from Billboard's Top 100. You can also create a playlist with your top
        50 tracks or based on your top 10 artists.
      </p>

      <p className="lead">
        To get started, login with Spotify. If you don't want to
        login, view pictures{" "}
        <a
          href="https://github.com/himanshup/spotify-playlist-creator"
          className="footerLinks"
        >
          here
        </a>
        .
      </p>
      <a
        className="btn badge-pill btn-success btn-lg mt-1"
        href={
          window.location.href.includes("localhost")
            ? "http://localhost:8888/login"
            : "https://playlistcreator-backend.herokuapp.com/login"
        }
      >
        <span id="go" className="p-4 text-uppercase">
          Login With Spotify
        </span>
      </a>
    </div>
  );
};

export default NotLoggedIn;
