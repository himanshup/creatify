import React from "react";
import "./Tracks.css";

function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

const Tracks = props => {
  return (
    <ul className="list-unstyled shadow-lg mt-3">
      {props.tracks.map((track, index) => (
        <li
          key={index}
          className="media list-group-item-action p-3"
          style={{ cursor: "pointer" }}
        >
          <small className="trackNum float-left align-self-center mr-2 ml-1">
            <strong />
          </small>
          <img
            src={
              track.album.images[0]
                ? track.album.images[0].url
                : "https://a1yola.com/wp-content/uploads/2018/05/default-artist.jpg"
            }
            alt=""
            className={`mr-3 centered-and-cropped ${
              index === 99 ? `` : `${index <= 8 ? `ml-3` : `ml-2`}`
            } `}
            width="65px"
            height="65px"
          />
          <div className="media-body align-self-center">
            <h6>{track.name}</h6>
            <small className="text-muted">
              {track.artists[0].name}
            </small>
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
