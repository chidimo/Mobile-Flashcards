import React from 'react';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux'
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

import ConnectedNavigation, { AppStatusBar } from './components/ConnectedNavigation';
import { reducer } from './reducers/reducer';

const logger = createLogger()
const store = createStore(reducer, applyMiddleware(thunk, logger))

export default class App extends React.Component {
    render() {
        return (
            <Provider store={store}>
                <AppStatusBar />
                <ConnectedNavigation />
            </Provider>
        );
    }
}
