"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const immutable_1 = require("immutable");
class CreateStore {
    constructor(store) {
        this.store = store;
        this.immutable = false;
        const val = (0, immutable_1.fromJS)(Object.assign({}, this.store.state), function (key, value, path) {
            return value.toJSON();
        });
        const originalList = (0, immutable_1.List)([val]);
        this.state = originalList.get(0);
        // console.log(this.store.getters);
        // console.log(originalList.get(0));
        // this.state = convertedState as T;
        // const convertedState = originalList.get(0) as unknown;
        // if (!this.immutable) Object.freeze(this.store.state);
        // Object.freeze(this.store.state);
        // Object.defineProperty(this.store, "state", {
        //   value: store,
        //   writable: false,
        // });
    }
    commit(method, payload) {
        var _a;
        this.immutable = true;
        const newState = this.state;
        const findIndexOfMutations = Object.keys((_a = this.store) === null || _a === void 0 ? void 0 : _a.mutations).findIndex((i) => i === method);
        if (findIndexOfMutations === -1)
            throw new Error(`Cannot find mutation with the name ${method}`);
        this.store.mutations[method](newState, payload); //call on the mutation function
    }
    get getState() {
        const derivedState = this.state;
        return derivedState;
    }
    getters(method, args) {
        const derivedState = this.state;
        if (this.store.getters) {
            return this.store.getters[method](derivedState, args);
        }
    }
}
/** @CreateStore<StateInterface>
 * @params {
 *  state: initialState,
 *  mutations: {
 *    mutationFunctions() {}
 *  },
 *  getters: {
 *    getterFunctions(state, additionalArgs) {
 *      return state.whatever
 *    }
 *  }
 * }
 
 */
const exampleStoreInstance = new CreateStore({
    state: {
        count: 0,
        name: "John",
        words: ["state"],
        todo: [
            { id: 1, title: "wash clothes", completed: false },
            { id: 2, title: "watch movie", completed: true },
        ],
    },
    mutations: {
        increment(state, num) {
            state.count = num;
            console.log("increment called", state);
        },
        decrement(state) {
            state.count--;
            console.log("decrement called", state);
        },
    },
    getters: {
        getCount(state) {
            return state.count;
        },
        getCountsPlus(state) {
            console.log("wow");
            return state.count + 2;
        },
        getTodo(state, id) {
            return state.todo.find((i) => i.id === id);
        },
    },
});
exports.default = CreateStore;
