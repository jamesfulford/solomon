import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import { Auth0Provider } from '@auth0/auth0-react';
import { Provider } from 'react-redux';
import { store } from './store';

import './main.css';

const domain = "solomon-money.us.auth0.com";
const clientId = "qhExE7PTD7R480PaCbfbByB5oWbs5n8Y";

ReactDOM.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
      returnTo={window.location.origin}
      cacheLocation="localstorage"
      useRefreshTokens
      audience="https://solomon.money/api"
      scope="read:current_user update:current_user_metadata transactions:read transactions:write"
    >
      <Provider store={store}>
        <App />
      </Provider>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
