
export enum FlagsType {
    SET = "parameters/set",
    SET_STATUS = "parameters/status",
}

export interface IFlags {
    highLowEnabled: boolean;
}

interface SetFlagAction {
    type: FlagsType.SET;
    flags: Partial<IFlags>
}
export function setFlags(flags: Partial<IFlags>): SetFlagAction {
    return {
        type: FlagsType.SET,
        flags,
    }
}


export enum RequestStatus {
    STABLE = "STABLE",
    LOADING = "LOADING",
    ERROR = "ERROR",
}
interface SetFlagStatusAction {
    type: FlagsType.SET_STATUS;
    status: RequestStatus;
}
export function setFlagStatus(status: RequestStatus): SetFlagStatusAction {
    return {
        type: FlagsType.SET_STATUS,
        status
    }
}

// Aggregate
export type FlagsAction =
    | SetFlagAction
    | SetFlagStatusAction;
