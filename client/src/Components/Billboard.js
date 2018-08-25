import React, { Component } from "react";
import { Container, Button, Table } from "reactstrap";
import { FaTimes } from "react-icons/fa";
import SpotifyWebApi from "spotify-web-api-js";
import axios from "axios";
var spotifyApi = new SpotifyWebApi();
class Billboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loggedIn: props.loggedIn,
      userId: props.userId,
      songs: [],
      uris: [],
      billboardPlaylistId: "",
      billboardPlaylistImg: "",
      billboardPlaylistCreated: false,
      billboardPlaylist: {}
    };
  }

  componentDidMount() {
    this.showBillboard100();
  }

  showBillboard100 = () => {
    axios
      .all([axios.get("/api/billboard1"), axios.get("/api/billboard100")])
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
  };

  removeTrack = title => {
    this.setState(currentState => {
      return {
        songs: currentState.songs.filter(song => song.title !== title)
      };
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

  render() {
    return (
      <Container className="mb-5">
        {!this.state.billboardPlaylistCreated && (
          <div className="text-center">
            <h1 className="mt-3">Billboard Hot 100</h1>
            <p className="">
              These are the songs from the Billboard Hot 100. Clicking the
              button will create a playlist and save it for you.
            </p>
            <Button
              className="btn badge-pill btn-success btn-lg"
              onClick={() => this.createPlaylist()}
            >
              <span id="go" className="p-4 text-uppercase">
                Create Playlist
              </span>
            </Button>
          </div>
        )}

        {this.state.billboardPlaylistCreated && (
          <div>
            <h1 className="mt-3 text-center">Playlist created</h1>
            <div className="text-center">
              View your playlist{" "}
              <a
                href={this.state.billboardPlaylist.external_urls.spotify}
                className="text-success"
              >
                here
              </a>
              .
            </div>
          </div>
        )}
        {!this.state.billboardPlaylistCreated && (
          <Table className="mt-3" bordered striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Title</th>
                <th>Artist</th>
              </tr>
            </thead>
            <tbody>
              {!this.state.billboardPlaylistCreated &&
                this.state.songs.map((item, index) => (
                  <tr key={index}>
                    <th scope="row">{item.rank}</th>
                    <td>{item.title}</td>
                    <td>
                      {item.artist}
                      <FaTimes
                        className="float-right"
                        onClick={() => this.removeTrack(item.title)}
                      />
                    </td>
                  </tr>
                ))}
            </tbody>
          </Table>
        )}
      </Container>
    );
  }
}

export default Billboard;
