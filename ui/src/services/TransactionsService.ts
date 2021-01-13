import axios from "axios";
import { IParameters } from "../store/reducers/parameters";


export interface IApiTransaction {
    rule_id: string;
    id: string;
    value: number;
    day: string;
    calculations: {
        balance: number;
        working_capital: number;
    }
}

export class TransactionsApiService {
    constructor(private baseUrl: string) {}

    public fetchTransactions(params: IParameters): Promise<IApiTransaction[]> {
        return axios.get(this.transactionsUrl(params))
            .then(r => {
                return r.data.transactions as IApiTransaction[];
            });
    }

    private transactionsUrl({ startDate, endDate, currentBalance, setAside }: IParameters): string {
        return `${this.baseUrl}/api/transactions?startDate=${startDate}&endDate=${endDate}&currentBalance=${currentBalance}&setAside=${setAside}`
    }

    public exportTransactionsUrl(params: IParameters): string {
        return this.transactionsUrl(params).replace(`${this.baseUrl}/api/transactions`, `${this.baseUrl}/api/export_transactions`);
    }
}

export const TransactionsService = new TransactionsApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).TransactionsService = TransactionsService;
