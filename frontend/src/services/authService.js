export async function loginUser(apiBaseUrl, email, password) {
    const response = await fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    return response; // Return the raw response to be handled by the component
}

export async function registerUser(apiBaseUrl, email, password) {
    const response = await fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
    });
    return response; // Return the raw response
}
