import axios from "axios";
import { IApiDayByDay } from "../pages/plan/daybyday/DayByDayContainer";
import { IParameters } from "../store/reducers/parameters";

export class DayByDayService {
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

const instance = new DayByDayService(process.env.REACT_APP_BASE_URL as string);

(global as any).DayByDayService = instance;

export default instance;
