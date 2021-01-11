import { IApiDayByDay } from "../../../pages/plan/daybyday/DayByDayContainer";
import { RequestStatus, DayByDayAction, DayByDayType } from "./actions";

export interface DayByDaysState {
    response?: IApiDayByDay,
    status: RequestStatus,
};

const initialState = {
    response: undefined,
    status: RequestStatus.LOADING,
};

export default (
    state: DayByDaysState = initialState,
    action: DayByDayAction,
): DayByDaysState => {
    switch (action.type) {
        case DayByDayType.SET:
            return { ...state, response: action.daybydays };
        case DayByDayType.SET_STATUS:
            return { ...state, status: action.status };
        default:
            return state;
    }
}
