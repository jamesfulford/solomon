import { AxiosError } from "axios";
import { AppState } from "..";
import { IApiRule, IApiRuleMutate } from "../../../pages/plan/rules/IRule";
import RulesService from "../../../services/RulesService";
import { fetchDayByDays } from "../daybydays";
import { getIsHighLowEnabled } from "../flags/getters";
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


export function deleteRule(id: string) {
    return (dispatch: any) => {
        dispatch(setRuleStatus(RequestStatus.LOADING));
        return RulesService.deleteRule(id)
            .catch((e: AxiosError) => {
                // If it's a 404, that's OK, it means it's already gone on the backend
                // should still trigger refresh of calculations
                if (e.response?.status === 404) {
                    return e.response;      
                }
                throw e;
            })
            .then(() => {
                dispatch(fetchRules());
            })
    }
}


export function createRule(rule: IApiRuleMutate) {
    return (dispatch: any) => {
        dispatch(setRuleStatus(RequestStatus.LOADING));
        return RulesService.createRule(rule)
            .then(() => {
                dispatch(fetchRules());
            });
    }
}


export function updateRule(id: string, rule: IApiRuleMutate) {
    return (dispatch: any) => {
        dispatch(setRuleStatus(RequestStatus.LOADING));
        return RulesService.updateRule(id, rule)
            .catch((e: AxiosError) => {
                // If it's a 404, that's OK, it means it's already gone on the backend
                // should still trigger refresh of calculations
                if (e.response?.status === 404) {
                    return e.response;      
                }
                throw e;
            })
            .then(() => {
                dispatch(fetchRules());
            });
    }
}


export function fetchRules() {
    return (dispatch: any, getState: () => AppState) => {
        dispatch(setRuleStatus(RequestStatus.LOADING));
        return RulesService.fetchRules()
            .then(rules => {
                const state = getState();
                dispatch(setRules(rules));

                // Changing rules causes transactions and daybydays to change too
                dispatch(fetchTransactions(
                    state.parameters.parameters,
                ));
                dispatch(fetchDayByDays(
                    state.parameters.parameters,
                    getIsHighLowEnabled(state),
                ));

                dispatch(setRuleStatus(RequestStatus.STABLE));
            })
            .catch(e => {
                dispatch(setRuleStatus(RequestStatus.ERROR));
                throw e;
            })
    }
}
