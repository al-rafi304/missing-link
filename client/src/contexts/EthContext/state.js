const actions = {
    init: 'INIT',
};

const initialState = {
    artifacts: {},
    contracts: {},
    web3: null,
    accounts: [],
    networkID: null,
};

const reducer = (state, action) => {
    switch (action.type) {
        case actions.init:
            return { ...state, ...action.data };
        default:
            return state;
    }
};

export { actions, initialState, reducer };
