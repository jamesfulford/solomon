import React, { useCallback, useState } from 'react';
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
    const [currentTime, setCurrentTime] = useState(Date.now());
    const onRefresh = useCallback(() => {
        setCurrentTime(Date.now());
    }, [])

    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const token = useToken();
    const [currentBalance, setCurrentBalance] = useState(0);
    const [setAside, setSetAside] = useState(0);
    
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
                        <label htmlFor="Balance">Balance</label>
                        <input className="form-control form-control-sm" id="Balance" type="number" placeholder="Balance" step="0.01" value={currentBalance} onChange={e => {
                            const newValue = Number(e.target.value || '0');
                            setCurrentBalance(newValue);
                        }} />
                    </Container>
                    <Container className="text-center">
                        <label htmlFor="setAside">Set Aside</label>
                        <input className="form-control form-control-sm" id="setAside" type="number" placeholder="setAside" step="0.01" value={setAside} onChange={e => {
                            const newValue = Number(e.target.value || '0');
                            setSetAside(newValue);
                        }} />
                    </Container>
                </div>
                <Container className="text-center">
                    <h4>Rules</h4>
                </Container>
                <RulesContainer userid={userid} onRefresh={onRefresh} />
            </Col>
            <Col lg={9}>
                <Container className="text-center">
                    <h4 data-testid="transactions">Upcoming Transactions</h4>
                </Container>
                <div style={{ minHeight: 450 }}>
                    <DayByDayContainer userid={userid} currentTime={currentTime} currentBalance={currentBalance} setAside={setAside} />
                </div>
                <hr />
                <TransactionsContainer userid={userid} currentTime={currentTime} currentBalance={currentBalance} setAside={setAside} />
            </Col>
        </Row>
    </Container>
}
