import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';

const domain = "dev-jix9d7st-actual-money.auth0.com";
const clientId = "mY5g2Zggemb1yMk9JTXaPutF67IJwyOA";

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
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Auth0Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
