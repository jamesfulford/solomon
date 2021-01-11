import { AppState } from "..";
import { IFlags } from "./actions";

export function getIsHighLowEnabled(state: AppState): boolean {
    return state.flags.flags.highLowEnabled;
}

export function getFlags(state: AppState): IFlags {
    return state.flags.flags;
}
