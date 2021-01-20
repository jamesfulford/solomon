import axios from "axios";
import { IParameters } from "../store/reducers/parameters";

type IApiParameters = Omit<IParameters, "endDate">;

export class ParameterApiService {
    constructor(private baseUrl: string) {}

    public fetchParameters(): Promise<IApiParameters> {
        return axios.get(`${this.baseUrl}/api/parameters`)
            .then(r => {
                return r.data as IApiParameters;
            });
    }

    public setParameters(parameters: Partial<IApiParameters>): Promise<IApiParameters> {
        return axios.put(`${this.baseUrl}/api/parameters`, parameters)
            .then(r => r.data as IApiParameters)
    }
}

export const ParameterService = new ParameterApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).ParameterService = ParameterService;
