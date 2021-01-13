import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { IApiDayByDay } from '../../../services/DayByDayService';
import { getDayByDay } from '../../../store/reducers/daybydays/getters';
import { getFlags } from '../../../store/reducers/flags/getters';
import { setParameters } from '../../../store/reducers/parameters';
import { getParameters } from '../../../store/reducers/parameters/getters';
import { useThunkDispatch } from '../../../useDispatch';


function getComputedDurationDays(startDate: string, minimumEndDate: string): number | undefined {
    if (minimumEndDate) {
        const start = new Date(startDate);
        const computedEndDate = new Date(minimumEndDate);
        return Math.round((computedEndDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }
}

export const DurationSelector = () => {
    const {
        daybydays: { data },
        parameters: { startDate }
    } = useSelector(state => ({
        flags: getFlags(state as any),
        daybydays: getDayByDay(state as any),
        parameters: getParameters(state as any).data,
    }));

    const dispatch = useThunkDispatch();

    const setQueryRangeDays = useCallback((computedDurationDays: number) => {
        const start = new Date(startDate);
        const durationMs = 1000 * 60 * 60 * 24 * computedDurationDays;
        dispatch(setParameters({
            endDate: new Date(start.getTime() + durationMs).toISOString().split('T')[0]
        }) as any);
    }, [startDate, dispatch])

    const daybyday = data as IApiDayByDay;

    const computedDurationDays = getComputedDurationDays(startDate, daybyday.params.minimumEndDate);

    return <div className="text-center">
        <button className="btn btn-outline-primary btn-sm mr-1" onClick={() => {setQueryRangeDays(Math.min(90, computedDurationDays || 90))}}>Default</button>
        {[
            { days: 365, display: '1y', danger: false },
            { days: 365 * 2, display: '2y', danger: false },
            { days: 365 * 5, display: '5y', danger: true },
            { days: 365 * 10, display: '10y', danger: true },
            { days: 365 * 20, display: '20y', danger: true },
            { days: 365 * 30, display: '30y', danger: true },
        ]
            .filter(({ days }) => {
                if (!computedDurationDays) {
                    return true;
                }
                return days > computedDurationDays;
            })
            .map(({ days, display, danger }) => {
                return <button key={days} className={`btn ${danger ? 'btn-outline-danger' : 'btn-outline-primary'} btn-sm mr-1`} onClick={() => {setQueryRangeDays(days)}}>{display}</button>
            })
        }
        <br />
    </div>
}