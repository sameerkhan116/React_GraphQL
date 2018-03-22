import React, { Component } from 'react';
import { graphql, compose } from 'react-apollo';
import gql from 'graphql-tag';

import { AUTH_TOKEN } from '../constants';

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      login: true, // switch between login and signup
      email: '',
      password: '',
      name: ''
    };
  }

  // the confirm async function.
  _confirm = async () => {
    // get email, password and name from the state (input by the user)
    const { email, password, name } = this.state;
    // if the current state is login needed
    if (this.state.login) {
      // set a var result that is the value of
      // this.props.loginMutation with the email and password variables
      const result = await this.props.loginMutation({
        variables: {
          email,
          password
        }
      });
      // we get the token the from result.data.login
      const { token } = result.data.login;
      // we then save the token received
      this._saveUserData(token);
    } else {
      // if the state is not login set the signupMutation with the variables
      const result = await this.props.signupMutation({
        variables: {
          name,
          email,
          password
        }
      });
      // the token is obtained from the result.data.signup
      const { token } = result.data.signup;
      // save the user data
      this._saveUserData(token);
    }
    // redirect the user to home page
    this.props.history.push('/');
  };

  // saveuserdata function that sets AUTH_TOKEN to the token that's generated
  _saveUserData = token => {
    localStorage.setItem(AUTH_TOKEN, token);
  };

  render() {
    return (
      <div>
        <h4 className="mv3">{this.state.login ? 'Login' : 'Sign Up'}</h4>
        <div className="flex flex-column">
          {!this.state.login && (
            <input
              type="text"
              value={this.state.name}
              onChange={e => this.setState({ name: e.target.value })}
              placeholder="Name"
            />
          )}
          <input
            type="text"
            value={this.state.email}
            onChange={e => this.setState({ email: e.target.value })}
            placeholder="Email"
          />
          <input
            type="password"
            value={this.state.password}
            onChange={e => this.setState({ password: e.target.value })}
            placeholder="Password"
          />
        </div>
        <div className="flex mt3">
          <div className="pointer mr2 button" onClick={() => this._confirm()}>
            {this.state.login ? 'login' : 'create account'}
          </div>
          <div
            className="pointer button"
            onClick={() => this.setState({ login: !this.state.login })}
          >
            {this.state.login
              ? 'need to create an account?'
              : 'already have an account?'}
          </div>
        </div>
      </div>
    );
  }
}

const SIGNUP_MUTATION = gql`
  mutation SignupMutation($email: String!, $password: String!, $name: String!) {
    signup(email: $email, password: $password, name: $name) {
      token
    }
  }
`;

const LOGIN_MUTATION = gql`
  mutation LoginMutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

// when there are multiple graphql queries/mutations we use the compose function from react-apollo
export default compose(
  graphql(SIGNUP_MUTATION, { name: 'signupMutation' }),
  graphql(LOGIN_MUTATION, { name: 'loginMutation' })
)(Login);
