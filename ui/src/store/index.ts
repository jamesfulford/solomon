import rootReducer from './reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const storeCreator = () => {
    const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

    const store = createStore(
      rootReducer,
      {},
      composeEnhancers(
        applyMiddleware(thunk)
      )
    );

    return store;
}

export const store = storeCreator();