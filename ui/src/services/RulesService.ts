import axios from "axios";
import { IApiRule, IApiRuleMutate } from "../pages/plan/rules/IRule";

export class RulesService {
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

const instance = new RulesService(process.env.REACT_APP_BASE_URL as string);

(global as any).RulesService = instance;

export default instance;
