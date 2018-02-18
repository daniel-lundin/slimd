import React from "react";
import Grid from "./grid";

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: 4,
      cols: 4
    };
  }

  render() {
    const { rows, cols } = this.state;
    return (
      <div>
        <h1>Hello world</h1>
        <Grid rows={rows} cols={cols} />
      </div>
    );
  }
}
