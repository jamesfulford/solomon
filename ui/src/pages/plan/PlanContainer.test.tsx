import React from 'react';
import { render } from '@testing-library/react'

jest.mock("@auth0/auth0-react")
jest.mock('./getTokenHook')

jest.mock("react-redux");

import { useAuth0 } from '@auth0/auth0-react';
import { useToken } from './getTokenHook';
import { PlanContainer } from './PlanContainer';
import { storeCreator } from '../../store';
import { IFlags } from '../../services/FlagService';
import { RequestStatus, setFlags, setFlagStatus } from '../../store/reducers/flags';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../store/reducers';
import { IParameters, setParameters, setParametersAndRecalculate, setParametersStatus } from '../../store/reducers/parameters';

describe('plan container', () => {
    function setAuth({ user = { name: 'James', userid: "user#1" }, loading=false, isAuthenticated=true }) {
        (useAuth0 as jest.MockedFunction<() => any>).mockReturnValue({
            user: { given_name: user?.name, sub: user?.userid },
            isLoading: loading,
            isAuthenticated,
        });
        (useToken as jest.MockedFunction<() => any>).mockReturnValue('token');
    }

    let dispatch: jest.MockedFunction<ReturnType<typeof storeCreator>['dispatch']>;

    function setStoreState(
        { flags, flagsLoading, flagsError }: { flags?: IFlags, flagsLoading: boolean, flagsError: boolean },
        { params, paramsLoading, paramsError }: { params?: IParameters, paramsLoading: boolean, paramsError: boolean }
    ) {
        const store = storeCreator();
        if (flags) {
            store.dispatch(setFlags(flags));
            store.dispatch(setFlagStatus(RequestStatus.STABLE));
        }
        if (flagsLoading) {
            store.dispatch(setFlagStatus(RequestStatus.LOADING));
        }
        if (flagsError) {
            store.dispatch(setFlagStatus(RequestStatus.ERROR));
        }

        if (params) {
            store.dispatch(setParameters(params));
            store.dispatch(setParametersStatus(RequestStatus.STABLE));
        }
        if (paramsLoading) {
            store.dispatch(setParametersStatus(RequestStatus.LOADING));
        }
        if (paramsError) {
            store.dispatch(setParametersStatus(RequestStatus.ERROR));
        }

        (useSelector as jest.MockedFunction<(fn: (state: AppState) => any) => void>).mockImplementation(selector => selector(store.getState()))

        dispatch = jest.fn();
        (useDispatch as jest.MockedFunction<() => typeof store.dispatch>).mockReturnValue(dispatch);

    }

    it('should render if authenticated', () => {
        setAuth({})
        setStoreState(
            { flags: { highLowEnabled: false }, flagsLoading: false, flagsError: false },
            { params: { currentBalance: 0, setAside: 0, startDate: "2020-01-01", endDate: "2020-04-01" }, paramsLoading: false, paramsError: false },
        );
        const { getByTestId } = render(<PlanContainer />);
        const transactionsHeader = getByTestId("transactions");
        expect(transactionsHeader).toBeInTheDocument();
    });

    it('should render nothing if loading', () => {
        setAuth({ loading: true })
        const element = render(<PlanContainer />);
        expect(element.container.textContent).toBe('');
    });

    it('should render login button if no login', () => {
        setAuth({ loading: false, isAuthenticated: false })
        const { getByText } = render(<PlanContainer />);
        const loginButton = getByText(/Login/i);
        expect(loginButton).toBeInTheDocument();
    });
});
