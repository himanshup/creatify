import React from "react";
import "./Tracks.css";

const millisToMinutesAndSeconds = millis => {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
};

const Tracks = props => {
  return (
    <ul className="list-unstyled bg-white shadow-lg mt-3">
      {props.tracks.map((track, index) => (
        <li key={index} className="media list-group-item-action p-3">
          <small className="trackNum float-left align-self-center mr-2 ml-1">
            <strong />
          </small>
          <img
            src={
              track.album.images[0]
                ? track.album.images[0].url
                : "https://res.cloudinary.com/dmrien29n/image/upload/v1539506039/default-artist.png"
            }
            alt=""
            className={`mr-3 rounded centered-and-cropped shadow ${
              index === 99 ? `` : `${index <= 8 ? `ml-3` : `ml-2`}`
            } `}
            width="70px"
            height="70px"
          />
          <div className="media-body mt-1 align-self-center">
            <h6>{track.name}</h6>
            <small className="text-muted">{track.artists[0].name}</small>
          </div>
          <small className="float-right align-self-center text-muted">
            {millisToMinutesAndSeconds(track.duration_ms)}
          </small>
        </li>
      ))}
    </ul>
  );
};

export default Tracks;
