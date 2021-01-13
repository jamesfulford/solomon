import React, { useState } from 'react';
import Chart from "react-google-charts";
import Container from 'react-bootstrap/Container';
import { getFlags } from '../../../store/reducers/flags/getters';
import { useSelector } from 'react-redux';
import { getDayByDay } from '../../../store/reducers/daybydays/getters';
import { getParameters } from '../../../store/reducers/parameters/getters';
import { DurationSelector } from '../DurationSelector';


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



export const DayByDayContainer = () => {
    const {
        flags: { highLowEnabled },
        daybydays: { data, loading, error },
        parameters: { setAside, }
    } = useSelector(state => ({
        flags: getFlags(state as any),
        daybydays: getDayByDay(state as any),
        parameters: getParameters(state as any).data,
    }));


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
        <DurationSelector />
    </>
}
