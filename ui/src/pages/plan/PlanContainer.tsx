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
import { fetchRules } from '../../store/reducers/rules';
import { getDayByDay } from '../../store/reducers/daybydays/getters';
import { getTransactions } from '../../store/reducers/transactions/getters';


const Loading = () => {
    return <Container className="justify-content-middle text-center mt-5 mb-5">
        <div className="spinner-border text-light" role="status">
            <span className="sr-only">Loading...</span>
        </div>
    </Container>;
}

const Error = ({ message }: { message?: string }) => {
    return <Container className="justify-content-middle text-center mt-5 mb-5">
        <span className="text-danger">{message || 'An error occurred. Please reload the page.'}</span>
    </Container>;
}

const LoginPrompt = () => {
    const { loginWithRedirect } = useAuth0();
    return <Container className="justify-content-middle">
        <div className="px-2 py-4"><p className="lead">You must be logged in!</p><br /><Button onClick={() => loginWithRedirect()}>Login</Button></div>
    </Container>
}

export const PlanContainer = () => {

    // Load user and token
    const { isAuthenticated, isLoading } = useAuth0();
    const token = useToken();

    if (isLoading) {
        return <Loading />
    }

    if (!isAuthenticated) {
        return <LoginPrompt />
    }

    if (!token) {
        return <Loading />
    }

    return <PlanContainerLoadContext />
}

const PlanContainerLoadContext = () => {
    const dispatch = useThunkDispatch();

    // get flags
    useEffect(() => {
        dispatch(fetchFlags() as any);
        dispatch(fetchParameters() as any);
    }, [dispatch]);

    const {
        flags,
        parametersStatuses: { loading: parametersLoading },
    } = useSelector(state => ({
        flags: getFlags(state as any),
        parametersStatuses: getParametersStatuses(state as any),
    }))

    // Wait if...
    if (
        !flags // loading flags
        || parametersLoading // loading parameters
    ) {
        return <Loading />
    }

    return <PlanContainerLoadData />
}

const PlanContainerLoadData = () => {
    const dispatch = useThunkDispatch();

    const {
        rules: { data: rules, loading: rulesLoading, error: rulesError },
        daybydays: { loading: daybydaysLoading, error: daybydaysError },
        transactions: { loading: transactionsLoading, error: transactionsError },
    } = useSelector(state => ({
        rules: getRules(state as any),
        daybydays: getDayByDay(state as any),
        transactions: getTransactions(state as any),
    }))

    // get flags
    useEffect(() => {
        dispatch(fetchRules() as any);
    }, [dispatch]);

    if (rulesError || daybydaysError || transactionsError) {
        return <Error />;
    }

    if (rulesLoading || daybydaysLoading || transactionsLoading) {
        return <Loading />;
    }

    if (!rules?.length) {
        return <Onboarding />;
    }

    return <PlanContainerView />
}


const Onboarding = () => {
    return <div className="plancontainer">
        <Row>
            <Col lg={3}>
                <RulesContainer />
            </Col>
            <Col lg={9}>
                <ParametersContainer />
                <Container className="justify-content-middle text-center mt-5 mb-5">
                    <h3 className="text-light">Welcome! Start by adding a rule.</h3>
                </Container>
            </Col>
        </Row>
    </div>
}


const PlanContainerView = () => {
    return <div className="plancontainer">
        <Row>
            <Col lg={3}>
                <RulesContainer />
            </Col>
            <Col lg={9}>
                <ParametersContainer />
                <DayByDayContainer />
                <TransactionsContainer />
            </Col>
        </Row>
    </div>
}
