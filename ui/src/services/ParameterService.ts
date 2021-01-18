import axios from "axios";
import { IParameters } from "../store/reducers/parameters";


export class ParameterApiService {
    constructor(private baseUrl: string) {}

    public fetchParameters(): Promise<IParameters> {
        return axios.get(`${this.baseUrl}/api/parameters`)
            .then(r => {
                return r.data as IParameters;
            });
    }
}

export const ParameterService = new ParameterApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).ParameterService = ParameterService;
