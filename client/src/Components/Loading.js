import React, { Component } from "react";
import { css } from "react-emotion";
import { ClipLoader } from "react-spinners";
import { Container } from "reactstrap";
const override = css`
  display: block;
  margin-top: 150px;
  border-color: red;
`;

class Loader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }
  render() {
    return (
      <Container id="loader" className="text-center mt-5">
        <ClipLoader
          className={override}
          sizeUnit={"px"}
          size={70}
          color={"#1DB954"}
          loading={this.state.loading}
        />
      </Container>
    );
  }
}

export default Loader;
