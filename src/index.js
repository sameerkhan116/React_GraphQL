import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-client-preset';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { BrowserRouter as Router } from 'react-router-dom';

import './styles/index.css';
import App from './components/App';
import registerServiceWorker from './registerServiceWorker';
import { AUTH_TOKEN } from './constants';

// attaching authorization header to every link
const middlewareAuthLink = new ApolloLink((operation, forward) => {
  // get auth token from localstorage
  const token = localStorage.getItem(AUTH_TOKEN);
  // if token is available then give it the standard format - Bearer token
  const authorization = token ? `Bearer ${token}` : null;
  // set context->headers->authorization as the authorization generated in the above line
  operation.setContext({
    headers: {
      authorization
    }
  });
  // forward passes the operation to the next middleware
  return forward(operation);
});

// create new HTTP Link where apollo client will will run
const httpLink = new HttpLink({ uri: 'http://localhost:4000' });
// add authenticationlink middlewar to this link
const link = middlewareAuthLink.concat(httpLink);

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
