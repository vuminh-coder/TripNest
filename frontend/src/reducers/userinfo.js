
const getInitialUser = () => {
    try {
        const stored = localStorage.getItem('tripnest_user');
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

const userInfo = (state = getInitialUser(), action) => {
    switch (action.type) {
        case "UPDATE":
            return { ...action.payload };
        default:
            return state;
    }
};

export default userInfo;