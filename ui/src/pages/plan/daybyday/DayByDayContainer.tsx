import React, { useState } from 'react';
import Chart from "react-google-charts";
import useAxios from 'axios-hooks'
import Container from 'react-bootstrap/Container';
import { isHighLowEnabled } from '../../../flags';


const baseUrl = process.env.REACT_APP_BASE_URL || '';

interface IDayByDayApi {
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
    }[]
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
const DayByDayChart = ({ daybyday, chartType, setAside }: { daybyday: IDayByDayApi, chartType: ChartTab, setAside: number }) => {
    if (!daybyday.daybydays.length) {
        return <Container className="text-center">
            <p data-testid="daybyday-empty">Nothing's here...</p>
        </Container>
    }

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

export const DayByDayContainer = ({ userid, currentTime, currentBalance, setAside }: { userid: string, currentTime: number, currentBalance: number, setAside: number }) => {
    const highLowEnabled = isHighLowEnabled(userid);
    const [chartType, setChartType] = useState<ChartTab>(ChartTab.DISPOSABLE_INCOME);
    const [queryRangeDays, setQueryRangeDays] = useState(90);

    const start = new Date(currentTime);
    const end = new Date(currentTime + (queryRangeDays * 24 * 60 * 60 * 1000))
    
    const [{ data, loading, error }] = useAxios(
        `${baseUrl}/api/daybydays?${highLowEnabled ? 'highLow&' : ''}userid=${userid}&startDate=${start.toISOString()}&endDate=${end.toISOString()}&currentBalance=${currentBalance}&setAside=${setAside}`
    );

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

    const daybyday = data

    return <>
        <ul className="nav nav-tabs">
            {[
                ChartTab.DISPOSABLE_INCOME,
                ChartTab.UNCERTAINTY,
            ].map(chart => <li className="nav-item" key={chart}>
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
            <button className="btn btn-outline-primary btn-sm" onClick={() => {setQueryRangeDays(90)}}>3m</button>&nbsp;
            <button className="btn btn-outline-primary btn-sm" onClick={() => {setQueryRangeDays(365)}}>1y</button>&nbsp;
            <button className="btn btn-outline-primary btn-sm" onClick={() => {setQueryRangeDays(365 * 2)}}>2y</button>&nbsp;
            <button className="btn btn-outline-danger btn-sm" title="May not be as accurate, use with caution" onClick={() => {setQueryRangeDays(365 * 5)}}>5y</button>&nbsp;
            <button className="btn btn-outline-danger btn-sm" title="May not be as accurate, use with caution" onClick={() => {setQueryRangeDays(365 * 10)}}>10y</button>&nbsp;
            <button className="btn btn-outline-danger btn-sm" title="May not be as accurate, use with caution" onClick={() => {setQueryRangeDays(365 * 20)}}>20y</button>&nbsp;
            <button className="btn btn-outline-danger btn-sm" title="May not be as accurate, use with caution" onClick={() => {setQueryRangeDays(365 * 30)}}>30y</button>&nbsp;
            <br />
        </div>
    </>
}
