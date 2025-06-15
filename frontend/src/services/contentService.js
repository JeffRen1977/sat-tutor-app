async function fetchWithAuth(url, token, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    return response; // Return raw response
}

export async function fetchSatQuestions(apiBaseUrl, token, { subject, count, type, difficulty }) {
    let url = `${apiBaseUrl}/questions/fetch?subject=${subject}&count=${count}`;
    if (type) url += `&type=${type}`;
    if (difficulty) url += `&difficulty=${difficulty}`;

    return fetchWithAuth(url, token, { method: 'GET' });
}

export async function fetchPassageById(apiBaseUrl, token, passageId) {
    return fetchWithAuth(`${apiBaseUrl}/passages/fetch?passageId=${passageId}`, token, { method: 'GET' });
}

export async function saveTestResult(apiBaseUrl, token, { questionId, isCorrect, userAnswer, selectedOption }) {
    return fetchWithAuth(`${apiBaseUrl}/test_results/save`, token, {
        method: 'POST',
        body: JSON.stringify({
            questionId,
            isCorrect,
            userAnswer,
            selectedOption,
        }),
    });
}
