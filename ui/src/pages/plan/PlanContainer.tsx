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
import { ParametersContainer } from './parameters/ParametersContainer';
import { useThunkDispatch } from '../../useDispatch';
import { fetchFlags } from '../../store/reducers/flags';
import { useSelector } from 'react-redux';
import { getFlags } from '../../store/reducers/flags/getters';
import { getParametersStatuses } from '../../store/reducers/parameters/getters';
import { fetchParameters } from '../../store/reducers/parameters';

import './Plan.css';
import { getRules } from '../../store/reducers/rules/getters';


export const PlanContainer = () => {
    const { isAuthenticated, isLoading, loginWithRedirect } = useAuth0();
    const token = useToken();

    const dispatch = useThunkDispatch();
    const {
        flags,
        parameters: { loading: parametersLoading },
        hasRules,
    } = useSelector(state => ({
        flags: getFlags(state as any),
        parameters: getParametersStatuses(state as any),
        hasRules: Boolean(getRules(state as any).data.length),
    }))

    // get flags
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            dispatch(fetchFlags() as any);
            dispatch(fetchParameters() as any);
        }
    }, [dispatch, isAuthenticated, isLoading]);
    
    if (!isLoading && !isAuthenticated) {
        return <Container className="justify-content-middle">
            <div className="px-2 py-4"><p className="lead">You must be logged in!</p><br /><Button onClick={() => loginWithRedirect()}>Login</Button></div>
        </Container>
    }


    // Wait if...
    if (
        isLoading // loading user
        || !token // getting token
        || !flags // loading flags
        || parametersLoading // loading parameters
    ) {
        // TODO(jamesfulford): put an awesome loading screen
        return null;
    }

    if (!hasRules) {
        // TODO(jamesfulford): render an awesome onboarding component
        // console.log("no rules found");
    }

    return <div className="plancontainer">
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
    </div>
}
