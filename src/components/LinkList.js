import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

class LinkList extends Component {
  _updateCacheAfterVote = (store, createVote, linkId) => {
    // read current state of the cached data from the store
    const data = store.readQuery({ query: FEED_QUERY });

    // get the link that was just upvoted by finding the linkId that is equal to the received link.id
    const votedLink = data.feed.links.find(link => link.id === linkId);
    // set the votes for that link with the votes you just mapped
    votedLink.votes = createVote.link.votes;

    // find write the modified data back to store
    store.writeQuery({ query: FEED_QUERY, data });
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
