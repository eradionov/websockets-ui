export const validateUserInput = (username?: string, password?: string) => {
    if (undefined === username || username.trim().length < 5) {
        throw new Error('Username is required and should be at least 5 characters')
    }

    if (undefined === password || password.trim().length < 5) {
        throw new Error('Password is required and should be at least 5 characters')
    }
};