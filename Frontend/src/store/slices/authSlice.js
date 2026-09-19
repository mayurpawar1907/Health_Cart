import { createSlice } from '@reduxjs/toolkit';
function load() {
    try {
        const user = localStorage.getItem('hc_user');
        const accessToken = localStorage.getItem('hc_access');
        return { user: user ? JSON.parse(user) : null, accessToken };
    }
    catch {
        return { user: null, accessToken: null };
    }
}
const authSlice = createSlice({
    name: 'auth',
    initialState: load(),
    reducers: {
        setSession: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
            localStorage.setItem('hc_user', JSON.stringify(action.payload.user));
            localStorage.setItem('hc_access', action.payload.accessToken);
            localStorage.setItem('hc_refresh', action.payload.refreshToken);
        },
        clearSession: (state) => {
            state.user = null;
            state.accessToken = null;
            localStorage.removeItem('hc_user');
            localStorage.removeItem('hc_access');
            localStorage.removeItem('hc_refresh');
        },
        updateUser: (state, action) => {
            if (!state.user)
                return;
            state.user = { ...state.user, ...action.payload };
            localStorage.setItem('hc_user', JSON.stringify(state.user));
        },
        updateTokens: (state, action) => {
            state.accessToken = action.payload.accessToken;
            localStorage.setItem('hc_access', action.payload.accessToken);
            localStorage.setItem('hc_refresh', action.payload.refreshToken);
        },
    },
});
export const { setSession, clearSession, updateUser, updateTokens } = authSlice.actions;
export default authSlice.reducer;
