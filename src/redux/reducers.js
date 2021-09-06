import { combineReducers } from "redux";

import counter from "@redux/slices/counter";

import { store } from "./store";

const rootReducer = combineReducers({ counter });

export default rootReducer;
