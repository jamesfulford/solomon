import { IApiRule } from "../../../pages/plan/rules/IRule";
import RulesService from "../../../services/RulesService";
import { fetchTransactions } from "../transactions";

export enum RuleType {
    SET = "rules/set",
    REMOVE = "rules/remove",
    SET_STATUS = "rules/status",
}

interface SetRulesAction {
    type: RuleType.SET;
    rules: IApiRule[];
}
export function setRules(rules: IApiRule[]): SetRulesAction {
    return {
        type: RuleType.SET,
        rules,
    }
}


interface RemoveRuleAction {
    type: RuleType.REMOVE;
    ruleid: string;
}
export function removeRule(ruleid: string): RemoveRuleAction {
    return {
        type: RuleType.REMOVE,
        ruleid,
    }
}


export enum RequestStatus {
    STABLE = "STABLE",
    LOADING = "LOADING",
    ERROR = "ERROR",
}
interface SetRuleStatusAction {
    type: RuleType.SET_STATUS;
    status: RequestStatus;
}
export function setRuleStatus(status: RequestStatus): SetRuleStatusAction {
    return {
        type: RuleType.SET_STATUS,
        status
    }
}

// Aggregate
export type RuleAction =
    | SetRulesAction
    | RemoveRuleAction
    | SetRuleStatusAction;


export function fetchRules() {
    return (dispatch: any) => {
        dispatch(setRuleStatus(RequestStatus.LOADING));
        return RulesService.fetchRules()
            .then(rules => {
                dispatch(setRules(rules));
                dispatch(setRuleStatus(RequestStatus.STABLE));
            })
            .catch(e => {
                dispatch(setRuleStatus(RequestStatus.ERROR));
                throw e;
            })
    }
}