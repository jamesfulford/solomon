import React from 'react';
import { render } from '@testing-library/react'
import App from './App';

jest.mock("@auth0/auth0-react")

import { useAuth0 } from '@auth0/auth0-react';

describe('navigation', () => {

  beforeEach(() => {
    (useAuth0 as jest.MockedFunction<() => any>).mockReturnValue({
      isAuthenticated: false,
    });
  });

  it('should render homepage', () => {
    const { getByText } = render(<App />);
    const linkElement = getByText(/Make a plan/i);
    expect(linkElement).toBeInTheDocument();
  });
});
