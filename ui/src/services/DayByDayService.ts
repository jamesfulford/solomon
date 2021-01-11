import axios from "axios";
import { IApiDayByDay } from "../pages/plan/daybyday/DayByDayContainer";

export class DayByDayService {
    constructor(private baseUrl: string) {}

    public fetchDayByDays(
        start: string,
        end: string,
        currentBalance: number,
        setAside: number,
        highLowEnabled: boolean,
    ): Promise<IApiDayByDay> {
        return axios.get(`${this.baseUrl}/api/daybydays?${highLowEnabled ? 'highLow&' : ''}startDate=${start}&endDate=${end}&currentBalance=${currentBalance}&setAside=${setAside}`)
            .then(r => r.data.data as IApiDayByDay);
    }
}

const instance = new DayByDayService(process.env.REACT_APP_BASE_URL as string);

(global as any).DayByDayService = instance;

export default instance;
