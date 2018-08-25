import React, { Component } from "react";
import SpotifyWebApi from "spotify-web-api-js";
var spotifyApi = new SpotifyWebApi();

class Artist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      userId: props.userId,
      artist: props.params.artist,
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
      .searchArtists(this.state.artist, { limit: 5 })
      .then(response => {
        console.log(response.artists.items);
        this.setState({
          artist: "",
          artists: response.artists.items
        });
      })
      .catch(error => {
        console.log(error);
      });
  }

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

  getRelatedArtists = (id, name) => {
    this.setState({
      artists: [],
      playlistArtists: this.state.playlistArtists.concat([
        { id: id, name: name }
      ])
    });
    spotifyApi
      .getArtistRelatedArtists(id)
      .then(response => {
        console.log(response.artists);
        for (const artist of response.artists) {
          if (this.state.playlistArtists.length === 10) {
          } else {
            this.setState({
              playlistArtists: this.state.playlistArtists.concat([
                {
                  id: artist.id,
                  name: artist.name,
                  image: artist.images[1].url
                }
              ])
            });
          }
        }
      })
      .catch(error => {
        console.log(error);
      });
  };

  shuffle = a => {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  getTracks = () => {
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
      .searchArtists(this.state.artist, { limit: 5 })
      .then(response => {
        console.log(response.artists.items);
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

  render() {
    return (
      <div>
        {this.state.loggedIn && (
          <div>
            <button onClick={() => this.artistPlaylist()}>
              Add tracks of selected artists
            </button>
            <button onClick={() => this.getTracks()}>See tracklist</button>
            <button onClick={() => this.createFinalPlaylist()}>
              Create Artist Playlist
            </button>
            <ul>
              Current Artists {this.state.playlistArtists.length} (Max 10):
              {this.state.playlistArtists.map(item => (
                <li key={item.id}>
                  {/* <img src={item.image} alt="" /> */}
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
              </div>
            )}
            <ul>
              {this.state.artists.map(item => (
                <li key={item.id}>
                  {/* <img src={item.images[1].url} alt="" /> */}
                  {item.name}
                  <button onClick={() => this.addArtist(item.id, item.name)}>
                    Add
                  </button>
                  <button
                    onClick={() => this.getRelatedArtists(item.id, item.name)}
                  >
                    Search Related
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        {this.state.artistPlaylistCreated && (
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
      </div>
    );
  }
}

export default Artist;
