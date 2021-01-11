import { AppState } from "..";
import { IApiDayByDay } from "../../../pages/plan/daybyday/DayByDayContainer";
import { RequestStatus } from "./actions";

export function getDayByDay(state: AppState): {
    data?: IApiDayByDay,
    loading: boolean,
    error: boolean
} {
    return {
        loading: state.daybydays.status === RequestStatus.LOADING,
        error: state.daybydays.status === RequestStatus.ERROR,
        data: state.daybydays.response,
    }
}
