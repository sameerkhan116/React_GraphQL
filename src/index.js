import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
// Apollo relevant imports
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-client-preset';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';

import './styles/index.css';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import { AUTH_TOKEN } from './constants';

// attaching authorization header to every link
// get auth token from localstorage
// if token is available then give it the standard format - Bearer token
// set context->headers->authorization as the authorization generated in the above line
// forward passes the operation to the next middleware
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  const authorization = token ? `Bearer ${token}` : null;
  operation.setContext({
    headers: {
      authorization
    }
  });
  return forward(operation);
});

// create new HTTP Link where apollo client will will run
const httpLink = new HttpLink({ uri: 'http://localhost:4000' });

// add authenticationlink middlewar to this link
const httpLinkWithAuthToken = middlewareAuthLink.concat(httpLink);

// the websocketlink knows the subscription endpoint and is very very similar to the
// HTTP protocol, except that it runs on the WS protocol.
// also setting the authentication token as the connection params
const wsLink = new WebSocketLink({
  uri: 'ws://localhost:4000',
  options: {
    reconnect: true,
    connectionParams: {
      authToken: localStorage.getItem(AUTH_TOKEN)
    }
  }
});

// the split function is used to route a request to a specific middleware link.
// it takes 3 arguments, the first one is a test to check if its a subscription.
// if the first param is true then the request is forwarded to second arg else third arg
const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLinkWithAuthToken
);

// Create a new apolloclient with this link and cache using inmemorycache package
const client = new ApolloClient({
  link,
  cache: new InMemoryCache()
});

// Wrap the App inside ApolloProvider which can be inturn wrapped inside Router
const ApolloApp = () => (
  <Router>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Router>
);

ReactDOM.render(<ApolloApp />, document.getElementById('root'));
registerServiceWorker();
