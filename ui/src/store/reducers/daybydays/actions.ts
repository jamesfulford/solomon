import { IApiDayByDay } from "../../../pages/plan/daybyday/DayByDayContainer";
import DayByDayService from "../../../services/DayByDayService";

export enum DayByDayType {
    SET = "daybyday/set",
    SET_STATUS = "daybyday/status",
}

interface SetDayByDaysAction {
    type: DayByDayType.SET;
    daybydays: IApiDayByDay;
}
export function setDayByDays(daybydays: IApiDayByDay): SetDayByDaysAction {
    return {
        type: DayByDayType.SET,
        daybydays,
    }
}


export enum RequestStatus {
    STABLE = "STABLE",
    LOADING = "LOADING",
    ERROR = "ERROR",
}
interface SetDayByDaysStatusAction {
    type: DayByDayType.SET_STATUS;
    status: RequestStatus;
}
export function setDayByDaysStatus(status: RequestStatus): SetDayByDaysStatusAction {
    return {
        type: DayByDayType.SET_STATUS,
        status
    }
}

// Aggregate
export type DayByDayAction =
    | SetDayByDaysAction
    | SetDayByDaysStatusAction;


export function fetchDayByDays(
    start: string,
    end: string,
    currentBalance: number,
    setAside: number,
    highLowEnabled: boolean,
) {
    return (dispatch: any) => {
        dispatch(setDayByDaysStatus(RequestStatus.LOADING));
        return DayByDayService.fetchDayByDays(
            start,
            end,
            currentBalance,
            setAside,
            highLowEnabled,
        )
            .then(dayByDays => {
                dispatch(setDayByDays(dayByDays));
                dispatch(setDayByDaysStatus(RequestStatus.STABLE));
            })
            .catch(e => {
                dispatch(setDayByDaysStatus(RequestStatus.ERROR));
                throw e;
            })
    }
}