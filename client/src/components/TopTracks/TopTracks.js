import React, { Component } from "react";
import { Container, Button } from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import Tracks from "../Tracks/Tracks";
var spotifyApi = new SpotifyWebApi();

class TopTracks extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      songs: [],
      uris: [],
      topTracksPlaylistId: "",
      topTracksPlaylistCreated: false,
      topTracksPlaylist: {}
    };
  }

  componentDidMount() {
    this.setAccessToken();
  }

  setAccessToken = () => {
    const params = this.props.getHashParams();
    const token = params.access_token;
    if (token) {
      spotifyApi.setAccessToken(token);
      this.setState({
        loggedIn: token ? true : false
      });
      this.getUserInfo();
    }
  };

  getUserInfo = () => {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
        });
        return spotifyApi.getMyTopTracks({ limit: 50 });
      })
      .then(topTracks => {
        this.setState({
          songs: topTracks.items,
          loading: false
        });
        return topTracks.items;
      })
      .then(tracks => {
        for (const track of tracks) {
          this.setState({
            uris: this.state.uris.concat([track.uri])
          });
        }
      })
      .catch(error => {
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  createPlaylist = () => {
    this.setState({
      loading: true
    });
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Top Tracks",
        public: true
      })
      .then(playlist => {
        this.setState({
          topTracksPlaylistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.uris
        );
      })
      .then(finalPlaylist => {
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.topTracksPlaylistId
        );
      })
      .then(response => {
        this.setState({
          topTracksPlaylistCreated: true,
          topTracksPlaylist: response,
          loading: false
        });
      })
      .catch(error => {
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  render() {
    return (
      <Container>
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            {this.state.loggedIn ? (
              <div>
                {!this.state.topTracksPlaylistCreated ? (
                  <div>
                    <div className="text-center">
                      <h1 className="mt-3">Top Tracks</h1>
                      <p className="">
                        These are your top 50 tracks. Click the button to create
                        a playlist with these songs.
                      </p>
                      <Button
                        className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2"
                        onClick={() => this.createPlaylist()}
                      >
                        <span id="go" className="text-uppercase">
                          Create Playlist
                        </span>
                      </Button>
                    </div>
                    <Tracks tracks={this.state.songs} />
                  </div>
                ) : (
                  <div className="text-center">
                    <h1 className="mt-3">Playlist Created</h1>
                    <p>Click the button to view it on Spotify.</p>
                    <Button
                      className="btn badge-pill btn-success btn-lg pr-5 pl-5"
                      href={this.state.topTracksPlaylist.external_urls.spotify}
                    >
                      <span id="go" className="text-uppercase">
                        View Playlist
                      </span>
                    </Button>
                  </div>
                )}
                <Footer />
              </div>
            ) : (
              <h1 className="text-center mt-3">
                You must be logged in to do that.
              </h1>
            )}
          </div>
        )}
      </Container>
    );
  }
}

export default TopTracks;
