import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { setParametersAndRecalculate } from '../../../store/reducers/parameters';
import { getParameters } from '../../../store/reducers/parameters/getters';
import { useThunkDispatch } from '../../../useDispatch';
import { Reconciler } from './Reconciler';


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

    const now = new Date();

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
        <div className="d-flex justify-content-between">
            {/* Column 1 */}
            <div className="d-flex flex-column justify-content-between">
                <div className="form-inline d-flex justify-content-end">
                    <label htmlFor="Balance">Balance</label>
                    <input className="form-control form-control-sm ml-2" id="Balance" type="text" value={currentBalance} 
                        maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                        style={{ width: 75 }}
                        onChange={e => {
                            const stringValue: string = e.target.value;
                            setCurrentBalance(stringValue);
                        }} />
                </div>
                <div className="form-inline d-flex justify-content-end">
                    <label htmlFor="setAside">Set Aside</label>
                    <input className="form-control form-control-sm ml-2" id="setAside" type="text" step="0.01" value={setAside}
                        maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
                        style={{ width: 75 }}
                        onChange={e => {
                            const stringValue: string = e.target.value;
                            setSetAside(stringValue);
                        }} />
                </div>
            </div>

            {/* Column 2 */}
            <div className="d-flex flex-column justify-content-between">
                <div className="form-inline d-flex justify-content-between mb-2">
                    <label htmlFor="Start">Start</label>
                    <input
                        className="form-control form-control-sm ml-2" placeholder="Start Date" id="Start"
                        type="date"
                        style={{ width: 150 }}
                        value={startDate}
                        min="2000-01-01"
                        max={now.toISOString().split("T")[0]}
                        onChange={e => {
                            setStartDate(e.target.value);
                        }} />
                </div>
                <button className="btn btn-outline-primary btn-sm" disabled={isPristine}>Update</button>
            </div>
        </div>
        {errorMessage && <span className="text-danger mt-2">{errorMessage}</span>}
        <Reconciler />
    </form>;
}