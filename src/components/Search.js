import React, { Component } from 'react';
import { withApollo } from 'react-apollo';
import gql from 'graphql-tag';

import Link from './Link';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      links: [],
      filter: ''
    };
  }

  // the execute search function gets the filter criteria from state
  // it then calls the query on the client props which we got by using withApollo
  // set the links as the links obtained after running this query.
  // set the current links in state to these links.
  _executeSearch = async () => {
    const { filter } = this.state;
    const result = await this.props.client.query({
      query: FEED_SEARCH_QUERY,
      variables: { filter }
    });
    const links = result.data.feed.links;
    this.setState({ links });
  };

  render() {
    return (
      <div>
        <div>
          Search<input
            type="text"
            onChange={e => this.setState({ filter: e.target.value })}
          />
          <button onClick={() => this._executeSearch()}>OK</button>
        </div>
        {this.state.links.map((link, index) => (
          <Link key={link.id} link={link} index={index} />
        ))}
      </div>
    );
  }
}

// this query is almost the same as feed in LinkList component except we are also adding a filter
const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter) {
      links {
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
`;

// the function withApollo injects ApolloClient instance that was created in index.js into the search
// component with a new prop called client
export default withApollo(Search);
