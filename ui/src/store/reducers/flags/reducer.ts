import { RequestStatus, FlagsAction, FlagsType, IFlags } from "./actions";

export interface RuleState {
    flags: IFlags,
    status: RequestStatus,
};

const initialState = {
    flags: {
        highLowEnabled: false,
    },
    status: RequestStatus.STABLE,
};

export default (
    state: RuleState = initialState,
    action: FlagsAction,
): RuleState => {
    switch (action.type) {
        case FlagsType.SET:
            return { 
                ...state,
                flags: {
                    ...state.flags,
                    ...action.flags,
                }
            };
        case FlagsType.SET_STATUS:
            return { ...state, status: action.status };
        default:
            return state;
    }
}
