import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import { RulesContainer } from './rules/RulesContainer';
import { TransactionsContainer } from './transactions/TransactionsContainer';

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row';
import { DayByDayContainer } from './daybyday/DayByDayContainer';
import { useAuth0 } from '@auth0/auth0-react';
import Button from 'react-bootstrap/Button';
import { useToken } from './getTokenHook';


export const PlanContainer = () => {
    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const token = useToken();
    const [currentBalance, setCurrentBalance] = useState('');
    const [setAside, setSetAside] = useState('');
    
    if (!isLoading && !isAuthenticated) {
        return <Container className="justify-content-middle">
            <div className="px-2 py-4"><p className="lead">You must be logged in!</p><br /><Button onClick={() => loginWithRedirect()}>Login</Button></div>
        </Container>
    }

    if (isLoading || !token) {
        return null;
    }

    const userid = user.sub;

    return <Container fluid style={{ paddingLeft: '10%', paddingRight: "10%" }}>
        <Row>
            <Col className="d-flex align-items-middle flex-column align-items-stretch">
                <div className="d-flex align-items-end mb-3">
                    <Container className="text-center">
                        <h4>Parameters</h4>
                        <label htmlFor="Balance" className="sr-only">Balance</label>
                        <input className="form-control form-control-sm mb-2" id="Balance" type="text" placeholder="Balance" value={currentBalance} 
                            maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                            onChange={e => {
                                setCurrentBalance(e.target.value);
                            }} />

                        <label htmlFor="setAside" className="sr-only">Set Aside</label>
                        <input className="form-control form-control-sm" id="setAside" type="text" placeholder="Set Aside" step="0.01" value={setAside}
                            maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                            onChange={e => {
                                setSetAside(e.target.value);
                            }} />
                    </Container>
                </div>
                <Container className="text-center">
                    <h4>Rules</h4>
                </Container>
                <RulesContainer />
            </Col>
            <Col lg={9}>
                <Container className="text-center">
                    <h4 data-testid="transactions">Upcoming Transactions</h4>
                </Container>
                <div style={{ minHeight: 450 }}>
                    <DayByDayContainer userid={userid} currentTime={Date.now()} currentBalance={Number(currentBalance)} setAside={Number(setAside)} />
                </div>
                <hr />
                <TransactionsContainer />
            </Col>
        </Row>
    </Container>
}
