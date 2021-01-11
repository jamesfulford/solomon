
export enum ParametersType {
    SET = "parameters/set",
    SET_STATUS = "parameters/status",
}

export interface IParameters {
    currentBalance: number;
    setAside: number;
    startDate: string;
    endDate: string;
}

interface SetParametersAction {
    type: ParametersType.SET;
    parameters: Partial<IParameters>
}
export function setParameters(parameters: Partial<IParameters>): SetParametersAction {
    return {
        type: ParametersType.SET,
        parameters,
    }
}


export enum RequestStatus {
    STABLE = "STABLE",
    LOADING = "LOADING",
    ERROR = "ERROR",
}
interface SetParametersStatusAction {
    type: ParametersType.SET_STATUS;
    status: RequestStatus;
}
export function setParametersStatus(status: RequestStatus): SetParametersStatusAction {
    return {
        type: ParametersType.SET_STATUS,
        status
    }
}

// Aggregate
export type ParametersAction =
    | SetParametersAction
    | SetParametersStatusAction;
