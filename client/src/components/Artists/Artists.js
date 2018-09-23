import React from "react";
import { Link } from "react-router-dom";
import "./Artists.css";

const Artists = props => {
  if (props.links === false) {
    return (
      <div className="row">
        {props.artists.map((artist, index) => (
          <div key={artist.id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card mt-4 border-0 rounded-0">
              <img
                className="rounded-0 card-img-top centered-and-cropped"
                width="300px"
                height="240px"
                src={
                  artist.images[0]
                    ? artist.images[0].url
                    : "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
                }
                alt=""
              />

              <div className="card-body">{artist.name}</div>
            </div>
          </div>
        ))}
      </div>
    );
  } else {
    return (
      <div className="row">
        {props.artists.map((artist, index) => (
          <div key={artist.id} className="col-sm-6 col-md-4 col-lg-3">
            <div className="card mt-4 border-0 rounded-0">
              <Link to={`/artist/${artist.id}/related/${window.location.hash}`}>
                <img
                  className="rounded-0 card-img-top centered-and-cropped"
                  width="300px"
                  height="240px"
                  src={
                    artist.images[0]
                      ? artist.images[0].url
                      : "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
                  }
                  alt=""
                />
              </Link>
              <div className="card-body">{artist.name}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
};

export default Artists;
