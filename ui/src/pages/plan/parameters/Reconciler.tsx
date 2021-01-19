import React from 'react';
import { useSelector } from 'react-redux';
import { Currency } from '../../../components/currency/Currency';
import { getDayByDay } from '../../../store/reducers/daybydays/getters';
import { getParameters } from '../../../store/reducers/parameters/getters';

export const Reconciler = () => {
    const {
        parameters,
        daybydays,
    } = useSelector(state => ({
        parameters: getParameters(state as any),
        daybydays: getDayByDay(state as any),
    }));

    const now = new Date().toISOString().split('T')[0];

    if (parameters.startDate === now) {
        return null;
    }
    const daybyday = daybydays.data?.daybydays.find(d => d.date === now);
    if (!daybyday) {
        // TODO: warn day is behind
        return null;
    }

    return <span>Is your balance today <Currency value={daybyday.balance.close} />?</span>;
}