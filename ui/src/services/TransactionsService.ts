import axios from "axios";
import { IApiTransaction } from "../pages/plan/transactions/ITransaction";
import { IParameters } from "../store/reducers/parameters";

export class TransactionsService {
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

const instance = new TransactionsService(process.env.REACT_APP_BASE_URL as string);

(global as any).TransactionsService = instance;

export default instance;
