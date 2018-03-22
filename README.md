# Stuff required for setting up Apollo with react

```npm
yarn add apollo-client-preset react-apollo graphql-tag graphql
```

For tachyons styling

> Optional `<link rel="stylesheet" href="https://unpkg.com/tachyons@4.2.1/css/tachyons.min.css"/>`

In index.js

```javascript
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-memory';

// To run graphql on localhost:4000
const httpLink = new HttpLink({ uri: 'http://localhost:4000' });

// set up new ApolloClient as
const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
});

// Finally wrap your <App/> in <ApolloProvider ></ApolloProvider>
render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
```
