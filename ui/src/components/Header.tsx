import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import Navbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom';
import { HeaderVerse } from './HeaderVerse';
import logo from './MoneyWise.svg'

export const Header = () => {
    const { isAuthenticated } = useAuth0();
    return <Navbar bg="light" expand="lg" className="mb-3">
        <Link to="/">
            <Navbar.Brand><img width={48} height={48} src={logo} alt="logo" />Solomon</Navbar.Brand>
        </Link>
        <HeaderVerse />
        {isAuthenticated && <Link to="/plan">Plan</Link>}
        <LoginSection />
    </Navbar>
}

const LoginSection = () => {
    const { isAuthenticated, isLoading, user, loginWithRedirect, logout } = useAuth0();
    if (isLoading) {
        return null
    }

    if (isAuthenticated) {
        return <>
            <span className="ml-auto">Hello, {user.name}</span>
            <button className="btn btn-outline-primary ml-3" onClick={() => logout({ returnTo: window.location.origin })}>Logout</button> 
        </>
    }

    return <>
        <button className="btn btn-outline-primary ml-auto" onClick={() => loginWithRedirect()}>Login</button>
    </>
}