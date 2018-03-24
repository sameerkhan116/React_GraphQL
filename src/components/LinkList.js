import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

class LinkList extends Component {
  // read current state of the cached data from the store
  // get the link that was just upvoted by finding the linkId that is equal to the received link.id
  // set the votes for that link with the votes you just mapped
  // find write the modified data back to store
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const data = store.readQuery({ query: FEED_QUERY });
    const votedLink = data.feed.links.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;
    store.writeQuery({ query: FEED_QUERY, data });
  };

  _subscribeToNewVotes = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newVote {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
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
      `
    });
  };

  // we can use the subscripeToMore function in the feedQuery in props to open a websocket conncetion
  // to the subscription server
  // The two arguments subscribeToMore takes is the document and updateQuery.
  // document is the subscription query itself
  // updateQuery is to determine how the store will update the information that was sent by the server for the query
  // the update query function works similar to a redux reducer
  _subscribeToNewLinks = () => {
    this.props.feedQuery.subscribeToMore({
      document: gql`
        subscription {
          newLink {
            node {
              id
              url
              description
              createdAt
              postedBy {
                id
                name
              }
              votes {
                id
                user {
                  id
                }
              }
            }
          }
        }
      `,

      // retrieve the links received by subscription data and merge it into the existing list of links
      // and then return the result of this operation
      updateQuery: (previous, { subscriptionData }) => {
        const links = [
          subscriptionData.data.newLink.node,
          ...previous.feed.links
        ];
        const result = {
          ...previous,
          feed: {
            links
          }
        };
        return result;
      }
    });
  };

  componentDidMount = () => {
    this._subscribeToNewLinks();
    this._subscribeToNewVotes();
  };

  render() {
    if (this.props.feedQuery && this.props.feedQuery.loading) {
      return <div>Loading...</div>;
    }

    if (this.props.feedQuery && this.props.feedQuery.error) {
      return <div>Error!</div>;
    }

    const linksToRender = this.props.feedQuery.feed.links;
    {
      /* Passing the result from the query as props to Link component */
    }
    return (
      <div>
        {linksToRender.map((link, index) => (
          <Link
            link={link}
            updateStoreAfterVote={this._updateCacheAfterVote}
            index={index}
            key={link.id}
          />
        ))}
      </div>
    );
  }
}

// Creating a graphql query
// we write the query inside gql``
// here we are getting from the feed
export const FEED_QUERY = gql`
  # 2 - GraphQL comment
  query FeedQuery {
    feed {
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        votes {
          id
          user {
            id
          }
        }
      }
    }
  }
`;

// to get the query results, we wrap curry the component with graphql tags.
// graphql takes the name of the query amd the name that the props should have.
export default graphql(FEED_QUERY, { name: 'feedQuery' })(LinkList);
