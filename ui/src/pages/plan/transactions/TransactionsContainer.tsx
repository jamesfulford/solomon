import React, { useCallback } from 'react';
import { IApiTransaction} from './ITransaction';
import { Transaction } from './Transaction'
import useAxios from 'axios-hooks'
import axios from 'axios'

const baseUrl = process.env.REACT_APP_BASE_URL || '';

export function limitShownTransactions(transactions: IApiTransaction[], showEnd: Date): IApiTransaction[] {
    return transactions
        .filter(t => {
            const d = new Date(t.day)
            return d <= showEnd;
        })
        .slice(0, 50);
}

export const TransactionsContainer = ({ currentTime, currentBalance, setAside }: { currentTime: number, currentBalance: number, setAside: number }) => {
    const now = new Date(currentTime)
    const start = now;
    const queryEnd = new Date(now.getTime() + (120 * 24 * 60 * 60 * 1000)); // add 120 days
    const showEnd = new Date(now.getTime() + (90 * 24 * 60 * 60 * 1000)); // add 90 days

    const downloadQueryEnd = new Date(now.getTime() + (400 * 24 * 60 * 60 * 1000)); // add 400 days (13 months plus some buffer)

    const [{ data, loading, error }] = useAxios(
        `${baseUrl}/api/transactions?startDate=${start.toISOString()}&endDate=${queryEnd.toISOString()}&currentBalance=${currentBalance}&setAside=${setAside}`
    )

    const downloadCsv = useCallback(async () => {
        const response = await axios.get(`${baseUrl}/api/export_transactions?startDate=${start.toISOString()}&endDate=${downloadQueryEnd.toISOString()}`);
        const file = new Blob([response.data], {type: response.headers["Content-Type"]});
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(file);
        link.download = "Solomon Export.csv";
        link.click();
        link.remove();
    }, [downloadQueryEnd, start])
    
    if (loading) {
        return <div className="spinner-border" role="status">
            <span data-testid="transactions-loading" className="visually-hidden"></span>
        </div>
    }

    if (error) {
        return <p data-testid="transactions-error">Error occurred while fetching transactions! Try refreshing the page.</p>
    }
    
    const tableData = limitShownTransactions(data.transactions as IApiTransaction[], showEnd);

    if (tableData.length === 0) {
        return <p data-testid="transactions-empty">Sorry, it looks like you don't have any transactions. Try setting up a new rule.</p>
    }


    return <div data-testid="transactions-showing" className="table-responsive">
        <div className="text-right mb-1"><button className="btn btn-link" onClick={downloadCsv}>Download CSV</button></div>
        <table className="table table-sm table-hover">
            <thead>
                <tr>
                    <th>Day</th>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Balance</th>
                    <th>Disposable Income</th>
                </tr>
            </thead>
            <tbody>
                {tableData.map(
                        (transaction) => <Transaction transaction={transaction} key={transaction.id} />
                    )
                }
            </tbody>
        </table>
    </div>
}