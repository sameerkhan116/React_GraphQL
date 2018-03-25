import React, { Component } from 'react';
// getting creation time of link from moment
import moment from 'moment';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';

class Link extends Component {
  // voting for a link.
  // wait for a change on the voteMutation props with linkId
  // the update function is called directly after the server returns a response
  // data is the payload of the mutation and store is the current cache
  _voteForLink = async () => {
    const linkId = this.props.link.id;
    await this.props.voteMutation({
      variables: {
        linkId
      },
      update: (store, { data: { vote } }) => {
        this.props.updateStoreAfterVote(store, vote, linkId);
      }
    });
  };

  // in the render function, first checking for authToken
  // if it is present then we allow user to upvote
  // get link description, url etc from link props which
  // link list gets by running the query
  render() {
    const authToken = localStorage.getItem(AUTH_TOKEN);

    return (
      <div className="flex mt2 items-start">
        <div className="flex items-center">
          <span className="gray">{this.props.index + 1}.</span>
          {authToken && (
            <div className="ml1 gray fl1" onClick={() => this._voteForLink()}>
              {/* eslint-disable-next-line */}
              🔺
            </div>
          )}
        </div>
        <div className="ml1">
          <div>
            {this.props.link.description}{' '}
            <a href={this.props.link.url}>({this.props.link.url})</a>
          </div>
          <div className="f6 lh-copy gray">
            {this.props.link.votes.length} votes | by{' '}
            {this.props.link.postedBy
              ? this.props.link.postedBy.name
              : 'Unknown'}{' '}
            {moment(this.props.link.createdAt).fromNow()}
          </div>
        </div>
      </div>
    );
  }
}

const VOTE_MUTATION = gql`
  mutation voteMutation($linkId: ID!) {
    vote(linkId: $linkId) {
      id
      link {
        votes {
          id
          user {
            id
          }
        }
      }
      user {
        id
      }
    }
  }
`;

export default graphql(VOTE_MUTATION, { name: 'voteMutation' })(Link);
