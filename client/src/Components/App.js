import React, { Component } from "react";
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
      userId: "",
      nowPlaying: { name: "Not Checked", albumArt: "" },
      billboardPlaylistId: "",
      billboardPlaylistImg: "",
      billboardPlaylistCreated: false,
      billboardPlaylist: {},
      songs: [],
      uris: [],
      artist: "",
      artists: [],
      playlistArtists: [],
      artistsTopTracks: [],
      artistTopTracksUris: [],
      artistTopTracksPlaylistId: "",
      artistPlaylistCreated: false,
      artistPlaylist: {}
    };
  }

  componentDidMount() {
    spotifyApi
      .getMe()
      .then(response => {
        this.setState({
          userId: response.id
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });

    axios
      .all([axios.get("/billboard1"), axios.get("/billboard100")])
      .then(
        axios.spread((array1, array2) => {
          const tracks = array1.data.concat(array2.data);
          this.setState({
            songs: tracks
          });
        })
      )
      .catch(error => {
        console.log(error);
      });
  }

  getNowPlaying = () => {
    spotifyApi
      .getMyCurrentPlaybackState()
      .then(response => {
        this.setState({
          nowPlaying: {
            name: response.item.name,
            albumArt: response.item.album.images[0].url
          }
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });
  };

  createPlaylist = () => {
    for (const track of this.state.songs) {
      spotifyApi.searchTracks(`${track.title}`, { limit: 1 }).then(response => {
        this.setState({
          uris: this.state.uris.concat([response.tracks.items[0].uri])
        });
      });
    }
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Billboard 100",
        public: true
      })
      .then(playlist => {
        console.log("Created playlist");
        this.setState({
          billboardPlaylistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          playlist.owner.id,
          playlist.id,
          this.state.uris
        );
      })
      .then(finalPlaylist => {
        console.log("Added tracks to your playlist");
        console.log(finalPlaylist);
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.billboardPlaylistId
        );
      })
      .then(response => {
        this.setState({
          billboardPlaylistCreated: true,
          billboardPlaylist: response
        });
      })
      .catch(error => {
        if (error) {
          this.getRefreshToken();
        }
      });
  };

  artistPlaylist = () => {
    for (const artist of this.state.playlistArtists) {
      spotifyApi
        .getArtistTopTracks(artist.id, "US")
        .then(response => {
          console.log(response);
          this.setState({
            artistsTopTracks: this.state.artistsTopTracks.concat(
              response.tracks
            )
          });
        })
        .catch(error => {
          console.log(error);
        });
    }
  };

  addArtist = (id, name) => {
    if (this.state.playlistArtists.length === 10) {
      console.log("You've reached the limit, only ten artists!");
    } else {
      this.setState({
        playlistArtists: this.state.playlistArtists.concat([
          { id: id, name: name }
        ])
      });
    }
  };

  shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  removeItem = index => {
    this.setState({
      playlistArtists: this.state.playlistArtists.filter((_, i) => i === index)
    });
  };

  getTracks = () => {
    for (var i = 0; i <= 2; i++) {
      this.removeItem(i);
    }
    // const shuffledPosts = this.shuffle(this.state.artistsTopTracks);
    const shuffledPosts = this.state.artistsTopTracks;
    const trackUris = [];
    for (const track of shuffledPosts) {
      trackUris.push(track.uri);
      this.setState({
        artistTopTracksUris: this.state.artistTopTracksUris.concat(trackUris)
      });
    }
  };

  createFinalPlaylist = () => {
    spotifyApi
      .createPlaylist(this.state.userId, {
        name: "Test Playlist",
        public: true
      })
      .then(playlist => {
        console.log("Created Playlist");
        this.setState({
          artistTopTracksPlaylistId: playlist.id
        });
        return spotifyApi.addTracksToPlaylist(
          this.state.userId,
          playlist.id,
          this.state.artistTopTracksUris
        );
      })
      .then(response => {
        console.log("Added tracks to your playlist");
        return spotifyApi.getPlaylist(
          this.state.userId,
          this.state.artistTopTracksPlaylistId
        );
      })
      .then(playlist => {
        this.setState({
          artistPlaylistCreated: true,
          artistPlaylist: playlist
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  removeTrack = title => {
    this.setState(currentState => {
      return {
        songs: currentState.songs.filter(song => song.title !== title)
      };
    });
  };

  removeArtist = id => {
    this.setState(currentState => {
      return {
        playlistArtists: currentState.playlistArtists.filter(
          artist => artist.id !== id
        )
      };
    });
  };

  searchArtist = e => {
    e.preventDefault();
    spotifyApi
      .searchArtists(this.state.artist, { limit: 10 })
      .then(response => {
        this.setState({
          artist: "",
          artists: response.artists.items
        });
      })
      .catch(error => {
        console.log(error);
      });
  };

  updateArtist = e => {
    this.setState({
      artist: e.target.value
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

  render() {
    return (
      <div className="App">
        <a href="http://localhost:8888"> Login to Spotify </a>
        <div>Now Playing: {this.state.nowPlaying.name}</div>
        <div>
          <img
            src={this.state.nowPlaying.albumArt}
            alt=""
            style={{ height: 150 }}
          />
        </div>
        {this.state.loggedIn && (
          <div>
            <button onClick={() => this.getNowPlaying()}>
              Check Now Playing
            </button>
            <button onClick={() => this.createPlaylist()}>
              Create Playlist
            </button>
            <button onClick={() => this.artistPlaylist()}>
              Add tracks of selected artists
            </button>
            <button onClick={() => this.getTracks()}>See tracklist</button>
            <button onClick={() => this.createFinalPlaylist()}>
              Create Artist Playlist
            </button>
            <ul>
              Current Artists:
              {this.state.playlistArtists.map(item => (
                <li key={item.id}>
                  {item.name}
                  <button onClick={() => this.removeArtist(item.id)}>
                    Remove
                  </button>
                </li>
              ))}
            </ul>
            {this.state.playlistArtists.length !== 10 && (
              <div>
                <form onSubmit={this.searchArtist}>
                  <input
                    type="text"
                    value={this.state.artist}
                    onChange={this.updateArtist}
                    required
                  />
                  <button type="submit">Submit</button>
                </form>
                <ul>
                  {this.state.artists.map(item => (
                    <li key={item.id}>
                      {item.name}
                      <button
                        onClick={() => this.addArtist(item.id, item.name)}
                      >
                        Add
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
        {this.state.billboardPlaylistCreated && (
          <div>
            <img src={this.state.artistPlaylist.images[1].url} alt="" />
            <div>
              View your playlist{" "}
              <a href={this.state.artistPlaylist.external_urls.spotify}>
                {" "}
                here{" "}
              </a>
            </div>
          </div>
        )}

        {this.state.billboardPlaylistCreated && (
          <div>
            <img src={this.state.billboardPlaylist.images[1].url} alt="" />
            <div>
              View your playlist{" "}
              <a href={this.state.billboardPlaylist.external_urls.spotify}>
                {" "}
                here{" "}
              </a>
            </div>
          </div>
        )}
        {/* <ul>
          {this.state.songs.map((item, index) => (
            <li key={index}>
              {item.artist} - {item.title}{" "}
              <button onClick={() => this.removeTrack(item.title)}>
                Remove
              </button>
            </li>
          ))}
        </ul> */}
      </div>
    );
  }
}

export default App;
