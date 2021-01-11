import rootReducer from './reducers';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';

const storeCreator = () => {
    const store = createStore(
      rootReducer,
      compose(
        applyMiddleware(thunk),
        (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
          (window as any).__REDUX_DEVTOOLS_EXTENSION__()
      )
    );

    return store;
}

export const store = storeCreator();