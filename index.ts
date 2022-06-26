import { List, Set, Map, fromJS, isKeyed } from "immutable";

interface Mutations<T> {
  [index: string]: (x: T, y?: any) => any;
}
type GProps<T> = { [x: number | string]: T };

interface Getters<T> {
  [index: string]: (x: T, y?: any) => keyof GProps<T> | T;
}
interface Properties<T> {
  state: T;
  mutations?: Mutations<T>;
  getters?: Getters<T>;
  actions?: any;
}

class CreateStore<T extends object> {
  private store: Readonly<Properties<T>>;
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
    this.isListeningForChanges = false;

    const val = fromJS({ ...this.store.state }, function (key, value, path) {
      return value.toJSON();
    });
    const originalList = List([val]);
    this.state = originalList.get(0);
  }

  public commit(method: string, payload?: unknown) {
    let n = structuredClone(JSON.parse(JSON.stringify(this.getState))); //create a new copy
    this.prevState = JSON.parse(JSON.stringify(this.state));
    const findIndexOfMutations = Object.keys(this.store?.mutations!).findIndex(
      (i) => i === method
    );
    if (findIndexOfMutations === -1)
      throw new Error(`Cannot find mutation with the name ${method}`);
    this.store.mutations![method](n, payload); //call on the mutation function

    this.setState = this.compareState(n, this.store.state) as T;
  }

  private typeCheck(value: any) {
    const return_value = Object.prototype.toString.call(value);
    const type = return_value.substring(
      return_value.indexOf(" ") + 1,
      return_value.indexOf("]")
    );

    return type.toLowerCase();
  }

  private set setState(newState: T) {
    Object.entries(newState).map(([key, value]) => {
      let state = this.state as any;
      switch (this.typeCheck(value)) {
        case "array":
          state[key] = [...value];
          break;
        case "date":
        case "number":
        case "boolean":
        case "null":
        case "undefined":
        case "function":
        case "symbol":
          state[key] = value;
          break;
        case "object":
          state[key] = { ...state[key], ...value };
          break;
        default:
          state[key] = value;
          break;
      }
    });

    if (this.isListeningForChanges) this.stateListener(newState);
  }
  public get getState(): T {
    const derivedState = Object.freeze(
      structuredClone(JSON.parse(JSON.stringify(this.state)))
    );
    return derivedState;
  }

  public getters(method: string, args?: unknown): any {
    if (this.store.getters) {
      return this.store.getters[method](this.getState, args);
    }
    throw new Error(`${method} not found`);
  }

  private stateListener(changes: Partial<T> | T): void {
    if (this.eventArgs === null)
      throw new Error(
        "Event subscriptions needs to be registered before a commit"
      );
    const { cb, dependencies } = this.eventArgs;
    const prevState = this.prevState as T;
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
    this.isListeningForChanges = true;
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

export default CreateStore;
