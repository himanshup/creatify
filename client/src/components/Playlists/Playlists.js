import React, { Component } from "react";
import { Button } from "reactstrap";
import SpotifyWebApi from "spotify-web-api-js";
import querystring from "querystring";
import Tracks from "../Tracks/Tracks";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";

var spotifyApi = new SpotifyWebApi();

class Playlists extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      query: "",
      playlists: [],
      total: 0,
      tracks: [],
      uris: [],
      playlistCreated: false,
      playlist: {},
      gotTopTracks: false
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
      const query = querystring.parse(this.props.location.search);
      this.setState({
        query: query["?search"]
      });
      this.getPlaylists(query["?search"]);
    }
  };

  getUserInfo = () => {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
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

  getPlaylists = term => {
    spotifyApi
      .searchPlaylists(term, { limit: 50 })
      .then(response => {
        const playlists = response.playlists.items;
        for (const playlist of playlists) {
          this.setState(state => {
            const total = state.total + playlist.tracks.total;
            const playlists = [...state.playlists, playlist];
            return {
              total,
              playlists
            };
          });
        }
      })
      .then(response => {
        this.setState({
          loading: false
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  getTopTracks = async () => {
    this.setState({
      loading: true
    });

    let newPlaylists = [];
    for (const playlist of this.state.playlists) {
      let response = await spotifyApi.getPlaylistTracks(
        this.state.userId,
        playlist.id
      );
      let tracksArr = [];
      for (const item of response.items) {
        tracksArr = [...tracksArr, item.track];
      }
      newPlaylists = [...newPlaylists, tracksArr];
    }

    // get occurrences for each track and create new array
    let result = newPlaylists.reduce((res, arr, index) => {
      arr.forEach(({ id }) => {
        if (res[id] !== null) {
          res[id] = res[id] || { occurrences: 0 };
          res[id].occurrences += 1;
        }
      });
      return res;
    }, {});

    newPlaylists.forEach(arr =>
      arr.forEach(obj => Object.assign(obj, result[obj.id]))
    );

    // loop through each playlist in playlists array
    // then create new array with tracks from each playlist
    // track uris with local in them cannot be added to playlists so we exclude them
    let tracks = [];
    for (const playlist of newPlaylists) {
      for (const track of playlist) {
        if (!track.uri.includes("local")) {
          tracks = [...tracks, track];
        }
      }
    }

    // sort tracks array by occurrences (most to least)
    const sortedTracks = tracks.sort((a, b) => {
      return b.occurrences - a.occurrences;
    });

    const duplicatesRemoved = this.removeDuplicates(sortedTracks, "id");

    // only want the first 100 tracks
    const finalTracks = duplicatesRemoved.splice(0, 100);

    // create new array for uris, which are needed to add tracks to a playlist
    for (const track of finalTracks) {
      this.setState(state => {
        let uris = [...state.uris, track.uri];
        return {
          uris
        };
      });
    }
    this.setState({
      tracks: [...finalTracks],
      gotTopTracks: true,
      loading: false
    });
  };

  createPlaylist = () => {
    this.setState({
      loading: true
    });
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: `Top ${this.state.term} Tracks`
      })
      .then(playlist => {
        this.setState({
          playlist
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.uris
        );
      })
      .then(response => {
        this.setState({
          playlistCreated: true,
          loading: false
        });
      })
      .catch(error => {
        console.log(error);
        if (error) {
          this.setState({
            loggedIn: false,
            loading: false
          });
        }
      });
  };

  removeDuplicates = (arr, value) => {
    var obj = {};
    for (var i = 0, len = arr.length; i < len; i++) {
      if (!obj[arr[i][value]]) obj[arr[i][value]] = arr[i];
    }
    var newArr = [];
    for (var key in obj) {
      newArr.push(obj[key]);
    }
    return newArr;
  };

  render() {
    return (
      <div>
        {this.state.loading ? (
          <Loading />
        ) : (
          <div>
            <div>
              {!this.state.playlistCreated ? (
                <div>
                  {!this.state.gotTopTracks ? (
                    <div>
                      <div className="jumbotron jumbotron-fluid header">
                        <div className="container text-center">
                          <h1 className="text-capitalize">
                            Matching Playlists For {this.state.query}
                          </h1>
                          <p>
                            Found 50 matching playlists with a total of{" "}
                            {this.state.total} tracks. Click the button to find
                            the top tracks across all of these playlists.
                          </p>
                          <Button
                            className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2 shadow"
                            onClick={() => this.getTopTracks()}
                          >
                            <span className="text-uppercase btns">
                              Find Top Tracks
                            </span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="jumbotron jumbotron-fluid header">
                      <div className="container text-center">
                        <h1 className="text-capitalize">
                          Top {this.state.term} Tracks
                        </h1>
                        <p>
                          These are the top 100 {this.state.term} tracks. Click
                          the button to save this as a playlist on Spotify.
                        </p>
                        <Button
                          className="btn badge-pill btn-success btn-lg pr-5 pl-5 mb-2 shadow"
                          onClick={() => this.createPlaylist()}
                        >
                          <span className="text-uppercase btns">
                            Create Playlist
                          </span>
                        </Button>
                      </div>
                    </div>
                  )}

                  {!this.state.gotTopTracks ? (
                    <div className="container">
                      <ul className="list-unstyled bg-white shadow-lg mt-3">
                        {this.state.playlists.map((playlist, index) => (
                          <li
                            key={index}
                            className="media list-group-item-action p-3"
                          >
                            <small className="trackNum float-left align-self-center mr-2 ml-1">
                              <strong />
                            </small>
                            <img
                              src={
                                playlist.images[0]
                                  ? playlist.images[0].url
                                  : "https://res.cloudinary.com/dmrien29n/image/upload/v1539506039/default-artist.png"
                              }
                              alt=""
                              className={`mr-3 centered-and-cropped rounded shadow ${
                                index === 99
                                  ? ``
                                  : `${index <= 8 ? `ml-3` : `ml-2`}`
                              } `}
                              width="70px"
                              height="70px"
                            />
                            <div className="media-body mt-1 align-self-center">
                              <h6>{playlist.name}</h6>
                            </div>
                            <small className="float-right align-self-center text-muted">
                              Tracks: {playlist.tracks.total}
                            </small>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className="container">
                      <Tracks tracks={this.state.tracks} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center">
                  <h1 className="mt-3">Playlist Created</h1>
                  <p>Click the button to view it on Spotify.</p>
                  <Button
                    className="btn badge-pill btn-success btn-lg pr-5 pl-5 shadow"
                    href={this.state.playlist.external_urls.spotify}
                  >
                    <span className="text-uppercase btns">View Playlist</span>
                  </Button>
                </div>
              )}
            </div>
            <Footer />
          </div>
        )}
      </div>
    );
  }
}

export default Playlists;
