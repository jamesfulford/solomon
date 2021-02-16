import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setParametersAndRecalculate } from '../../../store/reducers/parameters';
import { getParameters } from '../../../store/reducers/parameters/getters';
import { useThunkDispatch } from '../../../useDispatch';
import { Reconciler } from './Reconciler';

import './Parameters.css';


export const ParametersContainer = () => {
    const {
        parameters,
    } = useSelector(state => ({
        parameters: getParameters(state as any),
    }))

    const dispatch = useThunkDispatch();

    const [currentBalance, setCurrentBalance] = useState('');
    const [setAside, setSetAside] = useState('');
    const [startDate, setStartDate] = useState('');

    const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

    useEffect(() => {
        setCurrentBalance(String(parameters.currentBalance));
        setSetAside(String(parameters.setAside));
        setStartDate(parameters.startDate);
    }, [parameters.currentBalance, parameters.setAside, parameters.startDate])

    const isPristine = String(parameters.currentBalance) === currentBalance && String(parameters.setAside) === setAside && parameters.startDate === startDate;

    return <form onSubmit={e => {
        e.preventDefault();
        e.stopPropagation();

        dispatch(setParametersAndRecalculate({
            startDate,
            setAside: Number(setAside),
            currentBalance: Number(currentBalance),
        }) as any);
        setErrorMessage(undefined);
    }}>
        <div className="d-flex justify-content-between mb-2">
            <div>
                <span>On {startDate}</span>
            </div>
            <div className="form-inline">
                <label htmlFor="Balance">Balance</label>
                <input className="form-control form-control-sm ml-2 sl-input" id="Balance" type="text" value={currentBalance} 
                    maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                    style={{ width: 150 }}
                    onChange={e => {
                        const stringValue: string = e.target.value;
                        setCurrentBalance(stringValue);
                    }} />
                <label htmlFor="setAside" className="ml-3">Set Aside</label>
                <input className="form-control form-control-sm ml-2 sl-input" id="setAside" type="text" step="0.01" value={setAside}
                    maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                    style={{ width: 150 }}
                    onChange={e => {
                        const stringValue: string = e.target.value;
                        setSetAside(stringValue);
                    }} />
                
                <button className="button-secondary ml-3" disabled={isPristine}>Update</button>
            </div>
        </div>
        {errorMessage && <span className="text-danger mt-2">{errorMessage}</span>}
        <div className="mt-2">
            <Reconciler />
        </div>
    </form>;
}