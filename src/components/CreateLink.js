import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';

import { FEED_QUERY } from './LinkList';

class CreateLink extends Component {
  constructor(props) {
    super(props);
    this.state = {
      description: '',
      url: ''
    };
  }

  // function to create a link (will be async)
  _createLink = async () => {
    // get the description and url which have been set as state
    const { description, url } = this.state;
    // since postMutation is available as props, we await that.
    // then set the variables for this props to be the description and url from user input
    // after the variables are set update the store
    // update: { store, { data: { post }}} => {
    // get data from the store
    // manipulate it as needed
    // write back to store with query and data
    await this.props.postMutation({
      variables: {
        description,
        url
      },
      update: (store, { data: { post } }) => {
        const data = store.readQuery({ query: FEED_QUERY });
        data.feed.links.splice(0, 0, post);
        store.writeQuery({
          query: FEED_QUERY,
          data
        });
      }
    });
    // redirect to '/'
    this.props.history.push('/');
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
