import axios from "axios";


export type IFlags = {
    highLowEnabled: boolean;
}


export class FlagApiService {
    constructor(private baseUrl: string) {}

    public fetchDayByDays(): Promise<IFlags> {
        return axios.get(`${this.baseUrl}/api/flags`)
            .then(r => {
                return r.data as IFlags
            });
    }
}

export const FlagService = new FlagApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).FlagService = FlagService;
