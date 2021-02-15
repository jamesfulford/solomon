import React from 'react';
import Jumbotron from 'react-bootstrap/Jumbotron';
import Container from 'react-bootstrap/Container';
import { useAuth0 } from '@auth0/auth0-react';

export const Home = () => {
    const { loginWithRedirect } = useAuth0();
    return <Container>
        <Jumbotron className="text-center mt-5">
            <h1>Become Money's Master</h1>
            <button className="call-to-action" onClick={() => loginWithRedirect({
                screen_hint: 'signup'
            })}>Make a Plan</button>
        </Jumbotron>
    </Container>
}