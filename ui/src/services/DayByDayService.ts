import axios from "axios";
import { IParameters } from "../store/reducers/parameters";


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


export class DayByDayApiService {
    constructor(private baseUrl: string) {}

    public fetchDayByDays(
        params: IParameters,
        highLowEnabled: boolean,
    ): Promise<IApiDayByDay> {
        return axios.get(this.getDayByDayUrl(params, highLowEnabled))
            .then(r => {
                return r.data as IApiDayByDay
            });
    }

    private getDayByDayUrl({ startDate, endDate, currentBalance, setAside }: IParameters, highLowEnabled: boolean): string {
        return `${this.baseUrl}/api/daybydays?${highLowEnabled ? 'highLow&' : ''}startDate=${startDate}&endDate=${endDate}&currentBalance=${currentBalance}&setAside=${setAside}`
    }
}

export const DayByDayService = new DayByDayApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).DayByDayService = DayByDayService;
