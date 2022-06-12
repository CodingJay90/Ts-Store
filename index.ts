import { List, Set, Map, fromJS, isKeyed } from "immutable";

interface Mutations<T> {
  [index: string]: (x: T, y?: any) => void;
}
type GProps<T> = { [x: number | string]: T };

interface Getters<T> {
  [index: string]: (x: T, y?: any) => keyof GProps<T> | T;
}
interface Properties<T> {
  readonly state: T;
  mutations?: Mutations<T>;
  getters?: Getters<T>;
  actions?: any;
}

class CreateStore<T> {
  private store: Properties<T>;
  private state: unknown;

  constructor(store: Properties<T>) {
    this.store = store;

    const val = fromJS({ ...this.store.state }, function (key, value, path) {
      return value.toJSON();
    });
    const originalList = List([val]);
    this.state = originalList.get(0);
  }

  public commit(method: string, payload?: unknown) {
    const newState = this.state as T;
    const findIndexOfMutations = Object.keys(this.store?.mutations!).findIndex(
      (i) => i === method
    );
    if (findIndexOfMutations === -1)
      throw new Error(`Cannot find mutation with the name ${method}`);
    this.store.mutations![method](newState, payload); //call on the mutation function
  }

  public get getState(): T {
    const state = this.state as T;
    const derivedState = { ...state };
    return derivedState;
  }

  public getters(method: string, args?: unknown): any {
    const state = this.state as T;
    const derivedState = { ...state };
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
const exampleStoreInstance = new CreateStore<{
  count: number;
  name: string;
  todo: any[];
  words: string[];
}>({
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
    increment(state, num: number) {
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
      return state.count + 2;
    },
    getTodo(state, id) {
      return state.todo.find((i) => i.id === id);
    },
  },
});

exampleStoreInstance.getters("getCount"); // 0
exampleStoreInstance.getters("getTodo", 1); // { id: 1, title: "wash clothes", completed: false },
exampleStoreInstance.commit("increment", 5); //modify count state
exampleStoreInstance.getState; // {...state} returns state objects
export default CreateStore;
