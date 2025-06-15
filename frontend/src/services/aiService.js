async function fetchWithAuth(url, token, options = {}) {
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
    };
    const response = await fetch(url, { ...options, headers });
    return response; // Return raw response
}

export async function getVocabularyExplanation(apiBaseUrl, token, word) {
    return fetchWithAuth(`${apiBaseUrl}/vocabulary`, token, {
        method: 'POST',
        body: JSON.stringify({ word }),
    });
}

export async function getEssayBrainstorming(apiBaseUrl, token, topic) {
    return fetchWithAuth(`${apiBaseUrl}/essay-brainstorm`, token, {
        method: 'POST',
        body: JSON.stringify({ topic }),
    });
}

export async function solveMathProblem(apiBaseUrl, token, problem) {
    return fetchWithAuth(`${apiBaseUrl}/math-solver`, token, {
        method: 'POST',
        body: JSON.stringify({ problem }),
    });
}

export async function sendChatMessage(apiBaseUrl, token, chatHistory) {
    return fetchWithAuth(`${apiBaseUrl}/chat`, token, {
        method: 'POST',
        body: JSON.stringify({ chatHistory }),
    });
}

export async function generatePassage(apiBaseUrl, token, { genre, wordCount, topic }) {
    return fetchWithAuth(`${apiBaseUrl}/passages/generate`, token, {
        method: 'POST',
        body: JSON.stringify({ genre, wordCount, topic }),
    });
}

export async function generateQuestions(apiBaseUrl, token, { subject, count, difficulty, type, passageId }) {
    return fetchWithAuth(`${apiBaseUrl}/questions/generate`, token, {
        method: 'POST',
        body: JSON.stringify({ subject, count, difficulty, type, passageId }),
    });
}
