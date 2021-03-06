import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { FEED_QUERY } from './LinkList';
import { LINKS_PER_PAGE } from '../constants';

class CreateLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      url: ''
    };
  }

  // function to create a link (will be async)
  /* 
    Get description and url from state.
    pass these variables to postMutation in props
    update the store with the data, first = links_per_page, skip = 0, orderBy = most recent
    get data by store.readQuery, passing it the query and variables
    write data to store by passing it query, data and variables
  */
  _createLink = async () => {
    const { description, url } = this.state;
    await this.props.postMutation({
      variables: {
        description,
        url
      },
      update: (store, { data: { post } }) => {
        const first = LINKS_PER_PAGE;
        const skip = 0;
        const orderBy = 'createdAt_DESC';
        const data = store.readQuery({
          query: FEED_QUERY,
          variables: { first, skip, orderBy }
        });
        data.feed.links.splice(0, 0, post);
        data.feed.links.pop();
        store.writeQuery({
          query: FEED_QUERY,
          data,
          variables: { first, skip, orderBy }
        });
      }
    });
    // redirect to '/new/1'
    this.props.history.push('/new/1');
  };

  render() {
    return (
      <div>
        <div className="flex flex-column mt3">
          <input
            type="text"
            value={this.state.description}
            onChange={e => this.setState({ description: e.target.value })}
            className="mb2"
            placeholder="A description for this link"
          />
          <input
            type="text"
            className="mb2"
            value={this.state.url}
            onChange={e => this.setState({ url: e.target.value })}
            placeholder="A URL for this link"
          />
        </div>
        <button onClick={() => this._createLink()}>Submit</button>
      </div>
    );
  }
}

// an example of a graphql mutation
const POST_MUTATION = gql`
  # GraphQl mutations take a name and get the value they need in parentheses with a '$' prefix
  mutation PostMutation($description: String!, $url: String!) {
    post(description: $description, url: $url) {
      id
      createdAt
      url
      description
    }
  }
`;

export default graphql(POST_MUTATION, { name: 'postMutation' })(CreateLink);
