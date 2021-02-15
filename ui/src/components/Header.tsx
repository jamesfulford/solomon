import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { HeaderVerse } from './HeaderVerse';

export const Header = () => {
    return <Navbar bg="light" expand="lg">
        <Navbar.Brand style={{ fontSize: 22 }}><span role="img" aria-label="Crown Logo" className="mr-2">👑</span>Solomon</Navbar.Brand>
        <HeaderVerse />
        <LoginSection />
    </Navbar>
}

const LoginSection = () => {
    const { isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
    if (isLoading) {
        return null
    }

    if (isAuthenticated) {
        return <>
            <button className="button-secondary ml-auto" onClick={() => logout({ returnTo: window.location.origin })}>Logout</button> 
        </>
    }

    return <div className="ml-auto">
        <button className="call-to-action" onClick={() => loginWithRedirect({
            screen_hint: 'signup'
        })}>Sign Up</button>
        <button className="button-secondary ml-2" onClick={() => loginWithRedirect()}>Login</button>
    </div>
}
