# Ts-Store

A state management Library inspired by Vuex

## Usage

```javascript
import CreateStore from './';

const exampleStoreInstance = new CreateStore<{
  count: number;
}>({
  state: {
    counter: 0,
  },
  mutations: {
    increment(state, num: number) {
      state.count = num;
      console.log("increment called", state);
    },
  },
});
```

### State

```javascript
import CreateStore from "./";

interface StateInterface {
  count: number;
  name: string;
}

const exampleStoreInstance =
  new CreateStore() <
  StateInterface >
  {
    state: {
      counter: 0,
      name: "Jimmy",
    },
    mutations: {
      increment(state, num: number) {
        state.count = num;
        console.log("increment called", state);
      },
      changeName(state) {
        state.name = "Ade";
      },
    },
  };

console.log(exampleStoreInstance.getState); // {counter: 0, name: "jimmy"}
```

### Mutations

State are only allowed to be modified through mutations as state is immutable

```javascript
import CreateStore from "./";

interface StateInterface {
  count: number;
  name: string;
}

const exampleStoreInstance =
  new CreateStore() <
  StateInterface >
  {
    state: {
      counter: 0,
      name: "Jimmy",
    },
    mutations: {
      increment(state, num: number) {
        state.count = num;
        console.log("increment called", state);
      },
      changeName(state) {
        state.name = "Ade";
      },
    },
  };

console.log(exampleStoreInstance.getState); // {counter: 0, name: "jimmy"}
exampleStoreInstance.getState.count = 1; // does nothing
exampleStore.commit("increment", 2); // {counter: 2, name: "jimmy"}
exampleStore.commit("changeName"); // {counter: 2, name: "Ade"}
```

### Getters

Getter functions are used to assess some property of a state

```javascript
import CreateStore from "./";

interface StateInterface {
  count: number;
  name: string;
  todo: any[];
  words: string[];
}

const exampleStoreInstance =
  new CreateStore() <
  StateInterface >
  {
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
  };

exampleStoreInstance.getters("getCount"); // 0
exampleStoreInstance.getters("getTodo", 1); // { id: 1, title: "wash clothes", completed: false },
exampleStoreInstance.commit("increment", 5); //modify count state
exampleStoreInstance.getState; // {...state} returns state objects
```

### Subscriptions

Subscriptions are used to to actively listen for state changes.

```javascript
import CreateStore from "./";

interface StateInterface {
  count: number;
  name: string;
  todo: [];
  words: string[];
}

const exampleStoreInstance =
  new CreateStore() <
  StateInterface >
  {
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
  };

const statesToWatch = ["count", "name"];

exampleStoreInstance.subscribeEvents(
  (prevState, changes) => {
    console.log("previous state", prevState);
    console.log("changes made", changes);
  },
  [statesToWatch]
);

setInterval(() => {
  exampleStoreInstance.commit("increment", 2);
}, 2000);
```

To cancel subscriptions to an event,

```javascript
exampleStoreInstance.disableEventListeners();
```
