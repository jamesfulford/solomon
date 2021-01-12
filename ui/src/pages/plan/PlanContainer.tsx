import React, { useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { RulesContainer } from './rules/RulesContainer';
import { TransactionsContainer } from './transactions/TransactionsContainer';

import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row';
import { DayByDayContainer } from './daybyday/DayByDayContainer';
import { useAuth0 } from '@auth0/auth0-react';
import Button from 'react-bootstrap/Button';
import { useToken } from './getTokenHook';
import { ParametersContainer } from './ParametersContainer';
import { useThunkDispatch } from '../../useDispatch';
import { setFlags } from '../../store/reducers/flags';
import { isHighLowEnabled } from '../../flags';


export const PlanContainer = () => {
    const { isAuthenticated, isLoading, loginWithRedirect, user } = useAuth0();
    const token = useToken();

    const dispatch = useThunkDispatch();
    useEffect(() => {
        if (user?.sub) {
            const userid = user.sub;
            dispatch(setFlags({
                highLowEnabled: isHighLowEnabled(userid),
            }));
        }
    }, [dispatch, user])
    
    if (!isLoading && !isAuthenticated) {
        return <Container className="justify-content-middle">
            <div className="px-2 py-4"><p className="lead">You must be logged in!</p><br /><Button onClick={() => loginWithRedirect()}>Login</Button></div>
        </Container>
    }

    if (isLoading || !token) {
        return null;
    }

    return <Container fluid style={{ paddingLeft: '10%', paddingRight: "10%" }}>
        <Row>
            <Col className="d-flex align-items-middle flex-column align-items-stretch">
                <div className="d-flex align-items-end mb-3">
                    <Container className="text-center p-0">
                        <h4>Parameters</h4>
                        <ParametersContainer />
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
                    <DayByDayContainer />
                </div>
                <hr />
                <TransactionsContainer />
            </Col>
        </Row>
    </Container>
}
