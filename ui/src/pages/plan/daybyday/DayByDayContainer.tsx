import React, { useCallback, useState } from 'react';
import Chart from "react-google-charts";
import Container from 'react-bootstrap/Container';
import { getFlags } from '../../../store/reducers/flags/getters';
import { useSelector } from 'react-redux';
import { getDayByDay } from '../../../store/reducers/daybydays/getters';
import { getParameters } from '../../../store/reducers/parameters/getters';
import { useThunkDispatch } from '../../../useDispatch';
import { setParameters } from '../../../store/reducers/parameters';


export interface IApiDayByDay {
    daybydays: {
        date: string;
        balance: {
            open: number;
            low: number;
            high: number;
            close: number;
        };
        working_capital: {
            open: number;
            low: number;
            high: number;
            close: number;
        };
        high_prediction: {
            open: number;
            low: number;
            high: number;
            close: number;
        };
        low_prediction: {
            open: number;
            low: number;
            high: number;
            close: number;
        };
    }[];
    params: {
        minimumEndDate: string;
    }
}

const options = {
    title: "",
    curveType: "none",
    legend: { position: "top" },
    tooltip: {},
    hAxis: {
        minTextSpacing: 10,
        format: "short"
    },
    chartArea: {
        left: 60,
        width: '100%'
    },
};

const black = '#4374E0'
const green = '#488214';
const red = '#dc3545';

enum ChartTab {
    DISPOSABLE_INCOME = "Disposable Income",
    UNCERTAINTY = "Uncertainty",
}

// Chart Wishlist
// - explain moves
// - highlight saving for one-time events (how long does it take?)
// - disposable income separate from set_aside in tooltip
// - better x axis markers
// - less coloring overlaps
// - should not be a line chart, should be "steppy" like _| instead of / between points (still same as before)
const DayByDayChart = ({ daybyday, chartType, setAside }: { daybyday: IApiDayByDay, chartType: ChartTab, setAside: number }) => {
    switch(chartType) {
        case ChartTab.DISPOSABLE_INCOME:
            const disposableIncomeData = [
                [
                    'Day', 
                    'Balance', 
                    'Disposable Income + Set Aside',
                    'Set Aside',
                ],
                ...daybyday.daybydays.map(candle => [
                    candle.date,
                    Number(candle.balance.low),
                    Number(candle.working_capital.low) + setAside,
                    setAside,
                ])
            ]
            return <Chart
                chartType="SteppedAreaChart"
                width="100%"
                height="400px"
                data={disposableIncomeData}
                options={{
                    ...options,
                    colors: [black, green, red],
                }}
            />
        case ChartTab.UNCERTAINTY:
            const uncertaintyData = [
                ['Day', '90th Percentile', 'Expected', '10th Percentile'],
                ...daybyday.daybydays.map(candle => [
                    candle.date,
                    candle.high_prediction.low,
                    candle.balance.low,
                    candle.low_prediction.low,
                ])
            ];
            
            return <Chart
                chartType="LineChart"
                width="100%"
                height="400px"
                data={uncertaintyData}
                options={{
                    ...options,
                    colors: [green, black, red],
                }}
            />
    }
}


function getComputedDurationDays(startDate: string, minimumEndDate: string): number | undefined {
    if (minimumEndDate) {
        const start = new Date(startDate);
        const computedEndDate = new Date(minimumEndDate);
        return Math.round((computedEndDate.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }
}

export const DayByDayContainer = () => {
    const {
        flags: { highLowEnabled },
        daybydays: { data, loading, error },
        parameters: { startDate, setAside, }
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

    const [chartType, setChartType] = useState<ChartTab>(ChartTab.DISPOSABLE_INCOME);

    if (loading) {
        return <div style={{ minHeight: '100%', width: '100%' }} className="text-center">
            <div className="spinner-border" role="status">
                <span data-testid="daybyday-loading" className="visually-hidden"></span>
            </div>
        </div>
    }

    if (error) {
        return <div style={{ minHeight: '100%', width: '100%' }} className="text-center">
            <h5 data-testid="daybyday-error">Error occurred while fetching the future! Try refreshing the page.</h5>
        </div>
    }

    const daybyday = data;

    if (!daybyday?.daybydays.length) {
        return <Container className="text-center">
            <p data-testid="daybyday-empty">Nothing's here...</p>
        </Container>
    }

    const tabs = [
        ChartTab.DISPOSABLE_INCOME
    ];
    if (highLowEnabled) {
        tabs.push(ChartTab.UNCERTAINTY);
    }

    const computedDurationDays = getComputedDurationDays(startDate, daybyday.params.minimumEndDate);

    return <>
        <ul className="nav nav-tabs">
            {tabs.map(chart => <li className="nav-item" key={chart}>
                <button
                    type="button"
                    className={"nav-link " + (chart === chartType ? 'active' : '')}
                    onClick={() => setChartType(chart as any)}
                >
                    {chart}
                </button>
            </li>)}
        </ul>
        <DayByDayChart chartType={chartType} daybyday={daybyday} setAside={setAside} /> 
        <div className="text-center">
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
    </>
}
