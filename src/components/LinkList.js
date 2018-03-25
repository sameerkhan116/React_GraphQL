import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { LINKS_PER_PAGE } from '../constants';
import Link from './Link';

class LinkList extends Component {
  // read current state of the cached data from the store
  // get the link that was just upvoted by finding the linkId that is equal to the received link.id
  // set the votes for that link with the votes you just mapped
  // find write the modified data back to store
  // readQuery now requires our new variables which we calculate and pass
  _updateCacheAfterVote = (store, createVote, linkId) => {
    const isNewPage = this.props.location.pathname.includes('new');
    const page = parseInt(this.props.match.params.page, 10);
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;

    const data = store.readQuery({
      query: FEED_QUERY,
      variables: { first, skip, orderBy }
    });
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

  // If it is new page, just return all links,
  // otherwise, sort the links by number of votes and return
  _getLinksToRender = isNewPage => {
    if (isNewPage) {
      return this.props.feedQuery.feed.links;
    }
    const rankedLinks = this.props.feedQuery.feed.links.slice();
    rankedLinks.sort((l1, l2) => l2.votes.length - l1.votes.length);
    return rankedLinks;
  };

  // getting the current page from params, and if it's possible to go next, nextPage = page + 1
  _nextPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page <= this.props.feedQuery.feed.count / LINKS_PER_PAGE) {
      const nextPage = page + 1;
      this.props.history.push(`/new/${nextPage}`);
    }
  };

  _previousPage = () => {
    const page = parseInt(this.props.match.params.page, 10);
    if (page > 1) {
      const prevPage = page - 1;
      this.props.history.push(`/new/${prevPage}`);
    }
  };

  // when component renders, run these 2 functions
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

    // get links to render depending on if it's a new page
    const isNewPage = this.props.location.pathname.includes('new');
    const linksToRender = this._getLinksToRender(isNewPage);

    /* Passing the result from the query as props to Link component */
    return (
      <div>
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
        {isNewPage && (
          <div className="flex ml4 mv3 gray">
            <div className="pointer mr2" onClick={() => this._previousPage()}>
              Previous
            </div>
            <div className="pointer" onClick={() => this._nextPage()}>
              Next
            </div>
          </div>
        )}
      </div>
    );
  }
}

// Creating a graphql query
// we write the query inside gql``
// here we are getting from the feed
// also added arguments to the query to implement pagination
export const FEED_QUERY = gql`
  # 2 - GraphQL comment
  query FeedQuery($first: Int, $skip: Int, $orderBy: LinkOrderByInput) {
    feed(first: $first, skip: $skip, orderBy: $orderBy) {
      count
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
      count
    }
  }
`;

// to get the query results, we wrap curry the component with graphql tags.
// graphql takes the name of the query amd the name that the props should have.
/* 
  Props of the component are ownProps.
  createdAt_DESC lists newest first. LINKS_PER_PAGE is imported from constants.
  we get skip from the page number - 1 * LINKS_PER_PAGE,
  first 5 if is new page, other wise all (100)
*/
export default graphql(FEED_QUERY, {
  name: 'feedQuery',
  options: ownProps => {
    const page = parseInt(ownProps.match.params.page, 10);
    const isNewPage = ownProps.location.pathname.includes('new');
    const skip = isNewPage ? (page - 1) * LINKS_PER_PAGE : 0;
    const first = isNewPage ? LINKS_PER_PAGE : 100;
    const orderBy = isNewPage ? 'createdAt_DESC' : null;
    return {
      variables: { first, skip, orderBy }
    };
  }
})(LinkList);
