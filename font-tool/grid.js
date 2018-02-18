import React from "react";

export default class Grid extends React.Component {
  render() {
    const { rows, cols } = this.props;
    return (
      <div>
        {Array.from({ length: rows }, (_, x) => x).map(rowIndex => {
          return (
            <div
              key={`row-${rowIndex}`}
              style={{ display: "flex", width: "300px" }}
            >
              {Array.from({ length: cols }, (_, x) => x).map(colIndex => {
                console.log({ rowIndex, colIndex });
                return (
                  <div
                    key={`row-${rowIndex}-col-${colIndex}`}
                    style={{ background: "green", height: "30px", flex: 1 }}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }
}
