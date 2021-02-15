import React from 'react';
import Container from 'react-bootstrap/Container';

const year = new Date().getFullYear();

export const Footer = () => {
    return <Container fluid className="mt-3 footer">
        <Container className="text-center">
            <a href="https://anounceofsilver.com" target="_blank" rel="noopener noreferrer">&#169; 2020-{year} An Ounce of Silver Technologies. By using this site, you agree to not sue us.</a>
        </Container>
    </Container>
}