import React, { Component } from 'react';

export default class Link extends Component {
  // voting for a link.
  _voteForLink = async () => {
    // TODO
  };

  render() {
    return (
      <div>
        <div>
          {this.props.link.description}{' '}
          <a href={this.props.link.url}>({this.props.link.url})</a>
        </div>
      </div>
    );
  }
}
