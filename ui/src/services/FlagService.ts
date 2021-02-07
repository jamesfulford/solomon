import axios from "axios";


export type IFlags = {
    highLowEnabled: boolean;
}


export class FlagApiService {
    constructor(private baseUrl: string) {}

    public fetchDayByDays(): Promise<IFlags> {
        return axios.get(`${this.baseUrl}/api/flags`, {
            raxConfig: {
                retry: 5,
                retryDelay: 200,
                statusCodesToRetry: [[401, 401]],
            }
        })
            .then(r => {
                return r.data as IFlags
            });
    }
}

export const FlagService = new FlagApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).FlagService = FlagService;
