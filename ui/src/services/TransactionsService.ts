import axios from "axios";
import { IApiTransaction } from "../pages/plan/transactions/ITransaction";

export class TransactionsService {
    constructor(private baseUrl: string) {}

    public fetchTransactions(
        start: string,
        end: string,
        currentBalance: number,
        setAside: number,
    ): Promise<IApiTransaction[]> {
        return axios.get(`${this.baseUrl}/api/transactions?startDate=${start}&endDate=${end}&currentBalance=${currentBalance}&setAside=${setAside}`)
            .then(r => r.data.data as IApiTransaction[]);
    }
}

const instance = new TransactionsService(process.env.REACT_APP_BASE_URL as string);

(global as any).TransactionsService = instance;

export default instance;
