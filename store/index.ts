import { configureStore } from "@reduxjs/toolkit";
// import userReducer from "./userSlice"; // ← Xoá dòng này
import notificationReducer from "./notificationSlice";
import courseReducer from "./courseSlice";
import exerciseReducer from "./exerciseSlice";

export const store = configureStore({
    reducer: {
        // user: userReducer, // ← Xoá dòng này
        notification: notificationReducer,
        course: courseReducer,
        exercise: exerciseReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;