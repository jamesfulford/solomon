import React, { useState } from 'react';
import { setParameters } from '../../store/reducers/parameters';
import { useThunkDispatch } from '../../useDispatch';

export const ParametersContainer = () => {

    const dispatch = useThunkDispatch();
    const [currentBalance, setCurrentBalance] = useState('');
    const [setAside, setSetAside] = useState('');

    return <>
        <label htmlFor="Balance" className="sr-only">Balance</label>
        <input className="form-control form-control-sm mb-2" id="Balance" type="text" placeholder="Balance" value={currentBalance} 
            maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
            onChange={e => {
                const stringValue: string = e.target.value;
                setCurrentBalance(stringValue);

                const value = Number(stringValue);
                if (!Number.isNaN(value)) {
                    dispatch(setParameters({
                        currentBalance: value,
                    }) as any);
                }
            }} />

        <label htmlFor="setAside" className="sr-only">Set Aside</label>
        <input className="form-control form-control-sm" id="setAside" type="text" placeholder="Set Aside" step="0.01" value={setAside}
            maxLength={19} required pattern="-?[1-9][0-9]*\.?[0-9]{0,2}"
            onChange={e => {
                const stringValue: string = e.target.value;
                setSetAside(stringValue);

                const value = Number(stringValue);
                if (!Number.isNaN(value)) {
                    dispatch(setParameters({
                        setAside: value,
                    }) as any);
                }
            }} />
    </>
}