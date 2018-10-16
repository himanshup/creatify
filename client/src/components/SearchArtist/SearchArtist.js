import React, { Component } from "react";
import { Container } from "reactstrap";
import { Link } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import SpotifyWebApi from "spotify-web-api-js";
import querystring from "querystring";
import Loading from "../Loading/Loading";
import Footer from "../Footer/Footer";
import Artists from "../Artists/Artists";

var spotifyApi = new SpotifyWebApi();

class Artist extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loggedIn: false,
      userId: "",
      query: "",
      searchedItem: "",
      artists: []
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
      // gets search results on mount
      const query = querystring.parse(this.props.location.search);
      this.setState({
        searchedItem: query["?search"]
      });
      this.searchArtist(query["?search"]);
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

  searchArtist = value => {
    this.setState({
      loading: true
    });
    spotifyApi
      .searchArtists(value, { limit: 5 })
      .then(response => {
        this.setState({
          searchedItem: value,
          query: "",
          artists: response.artists.items,
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

  updateArtist = e => {
    this.setState({
      query: e.target.value
    });
  };

  render() {
    return (
      <div>
        {this.state.loading === true ? (
          <Loading />
        ) : (
          <div>
            <div className="jumbotron jumbotron-fluid homeJumbotron">
              <div className="container">
                <h1 className="mt-3 text-center text-capitalize">
                  Results for {this.state.searchedItem}
                </h1>
                <p className="lead text-center">
                  Click on an artist to get related artists.
                </p>
                <div className="row mt-5 mb-5">
                  <div className="col" />
                  <div className="col-12 col-md-8 col-lg-6">
                    <div className="card border-0 badge-pill search p-2">
                      <div className="d-flex">
                        <input
                          type="text"
                          name="artist"
                          className="form-control form-control-lg border-0 "
                          placeholder="Artist Name"
                          value={this.state.artist}
                          onChange={this.updateArtist}
                          autoComplete="off"
                        />
                        <div className="align-self-center">
                          <Link
                            className={`btn btn-success searchBtn shadow ${this
                              .state.query.length < 1 && `disabled`}`}
                            to={`/artists?search=${this.state.query}${
                              window.location.hash
                            }`}
                            onClick={() => this.searchArtist(this.state.query)}
                          >
                            <IoIosSearch size="25" className="mt-1" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col" />
                </div>
              </div>
            </div>

            <Container className="mb-5">
              <div>
                <Artists artists={this.state.artists} />
              </div>
              <Footer />
            </Container>
          </div>
        )}
      </div>
    );
  }
}

export default Artist;
