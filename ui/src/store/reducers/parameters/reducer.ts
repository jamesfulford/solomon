import { IParameters, RequestStatus, ParametersAction, ParametersType } from "./actions";

export interface RuleState {
    parameters: IParameters,
    status: RequestStatus,
};

const currentDate = new Date();
const initialState = {
    parameters: {
        currentBalance: 0,
        setAside: 0,
        startDate: currentDate.toISOString().split("T")[0],
        // 90 days later
        endDate: new Date(currentDate.getTime() + (1000 + 60 * 60 * 24 * 90)).toISOString().split("T")[0],
    },
    status: RequestStatus.STABLE,
};

export default (
    state: RuleState = initialState,
    action: ParametersAction,
): RuleState => {
    switch (action.type) {
        case ParametersType.SET:
            return { 
                ...state,
                parameters: {
                    ...state.parameters,
                    ...action.parameters,
                }
            };
        case ParametersType.SET_STATUS:
            return { ...state, status: action.status };
        default:
            return state;
    }
}
