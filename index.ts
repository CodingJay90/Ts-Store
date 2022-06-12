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

class CreateStore<T extends object> {
  private store: Properties<T>;
  private state: unknown;
  private prevState: T | null;
  private isListeningForChanges: boolean;
  private eventArgs: {
    cb: (prevState: T, changes: Partial<T> | T) => void;
    dependencies: string[];
  } | null;

  constructor(store: Properties<T>) {
    this.store = store;
    this.prevState = null;
    this.eventArgs = null;
    this.isListeningForChanges = true;

    const val = fromJS({ ...this.store.state }, function (key, value, path) {
      return value.toJSON();
    });
    const originalList = List([val]);
    this.state = originalList.get(0);
  }

  public commit(method: string, payload?: unknown) {
    const state = { ...this.getState };
    const findIndexOfMutations = Object.keys(this.store?.mutations!).findIndex(
      (i) => i === method
    );
    if (findIndexOfMutations === -1)
      throw new Error(`Cannot find mutation with the name ${method}`);
    this.store.mutations![method](state, payload); //call on the mutation function
    this.setState = state;
  }

  private set setState(newState: T) {
    if (JSON.stringify(newState) === JSON.stringify(this.state)) {
      console.log("Nothing changed.");
      return;
    }
    this.prevState = this.state as T;
    this.state = newState;
    if (this.isListeningForChanges) this.stateListener();
  }

  public get getState(): T {
    const state = this.state as T;
    const derivedState = { ...state };
    return derivedState;
  }

  public getters(method: string, args?: unknown): any {
    if (this.store.getters) {
      return this.store.getters[method](this.getState, args);
    }
    throw new Error(`${method} not found`);
  }

  private stateListener(): void {
    if (this.eventArgs === null)
      throw new Error(
        "Event subscriptions needs to be registered before a commit"
      );
    const { cb, dependencies } = this.eventArgs;
    const newState = this.state as T;
    const prevState = this.prevState as T;
    const changes = this.compareState(newState, prevState);
    const keys: string[] = Object.keys(changes); //dependencies array to watch

    if (!dependencies.length) return cb(prevState, changes); //if an empty dependency is passed in or no dependency array return the cb function
    //check to see if any item in the dependency array is included in the updated state
    dependencies.forEach((i) => {
      if (keys.includes(i)) cb(prevState, changes);
    });
  }

  public subscribeEvents(
    cb: (args: T, changes: Partial<T> | T) => any,
    dependencies: string[] = []
  ) {
    this.eventArgs = { cb, dependencies };
  }

  public disableEventListeners(): void {
    this.isListeningForChanges = false;
  }

  private compareState(newState: T, prevState: T): Partial<T> | T {
    let diff: { [key: string]: T | Partial<T> | null | undefined | string } =
      {};

    for (const item in newState) {
      if (newState.hasOwnProperty(item)) {
        // check if properties of prevState is the same has newState
        // if (prevState.hasOwnProperty(item)) diff[item] = newState[item];
        //compare the items changed in the object
        if (
          JSON.stringify(newState[item]) !== JSON.stringify(prevState[item])
        ) {
          diff[item] = newState[item];
        }
      }
    }
    return diff as Partial<T> | T;
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
      state.count = state.count + num;
    },
    decrement(state) {
      state.count--;
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

// exampleStoreInstance.getters("getCount"); // 0
// exampleStoreInstance.getters("getTodo", 1); // { id: 1, title: "wash clothes", completed: false },
// exampleStoreInstance.commit("increment", 5); //modify count state
// exampleStoreInstance.getState; // {...state} returns state objects
exampleStoreInstance.subscribeEvents(
  (prevState, changes) => {
    console.log("previous state", prevState);
    console.log("changes made", changes);
  },
  ["count"]
);
setInterval(() => {
  exampleStoreInstance.commit("increment", 2);
}, 2000);
export default CreateStore;
