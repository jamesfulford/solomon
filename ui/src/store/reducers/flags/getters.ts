import { AppState } from "..";

export function getIsHighLowEnabled(state: AppState): boolean {
    return state.flags.flags.highLowEnabled;
}
