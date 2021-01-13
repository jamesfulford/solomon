import axios from "axios";


// When creating and updating rules
export interface IApiRuleMutate {
    name: string;
    rrule: string;
    value: number;
    labels?: { [label: string]: any };
}

// Extra server-assigned fields which
export interface IApiRule extends IApiRuleMutate {
    id: string;
    userid: string;
}


export class RulesApiService {
    constructor(private baseUrl: string) {}

    public fetchRules(): Promise<IApiRule[]> {
        return axios.get(`${this.baseUrl}/api/rules`)
            .then(r => r.data.data as IApiRule[]);
    }

    public createRule(rule: IApiRuleMutate): Promise<IApiRule> {
        return axios.post(`${this.baseUrl}/api/rules`, rule)
            .then(r => r.data as IApiRule);
    }

    public updateRule(ruleid: string, rule: IApiRuleMutate): Promise<IApiRule> {
        return axios.put(`${this.baseUrl}/api/rules/${ruleid}`, rule)
            .then(r => r.data as IApiRule);
    }

    public deleteRule(ruleid: string): Promise<void> {
        return axios.delete(`${this.baseUrl}/api/rules/${ruleid}`);
    }
}

export const RulesService = new RulesApiService(process.env.REACT_APP_BASE_URL as string);

(global as any).RulesService = RulesService;
