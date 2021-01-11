import { IApiTransaction } from "../../../pages/plan/transactions/ITransaction";
import { RequestStatus, TransactionAction, TransactionsType } from "./actions";

export interface TransactionsState {
    transactions: IApiTransaction[],
    status: RequestStatus,
};

const initialState = {
    transactions: [],
    status: RequestStatus.STABLE,
};

export default (
    state: TransactionsState = initialState,
    action: TransactionAction,
): TransactionsState => {
    switch (action.type) {
        case TransactionsType.SET:
            return { ...state, transactions: action.transactions };
        case TransactionsType.SET_STATUS:
            return { ...state, status: action.status };
        default:
            return state;
    }
}
