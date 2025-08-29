document.addEventListener("DOMContentLoaded", async () => {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const domainKey = new URL(tab.url).hostname;
        const storageKey = domainKey + "_notes";

        chrome.storage.local.get([storageKey], function(result) {
            if (result[storageKey]) {
                document.getElementById('notes').value = result[storageKey];
            }
        });
    } catch (error) {
        console.error(error);
    }

    // Set up button event listeners
    document.getElementById("performOperation").addEventListener('click', performOperation);
    document.getElementById("saveNotesBtn").addEventListener('click', saveNotes);
    document.getElementById("resetNotesBtn").addEventListener('click', resetNotes);
    document.getElementById("copyToNotesBtn").addEventListener('click', copyToNotes);
});

// Perform selected AI operation on selected text
async function performOperation() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const [{ result }] = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => window.getSelection().toString()
        });

        if (!result) {
            showResult('Please select some text first');
            return;
        }

        document.getElementById("results").innerText = "Processing...";

        const response = await fetch("http://localhost:8080/research/generateResponse", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                content: result,
                operation: document.getElementById("operationButton").value
            })
        });

        if (!response.ok) {
            throw new Error(`Backend Error: ${response.status}`);
        }

        const text = await response.text();
        showResult(text.replace(/\n/g, '<br>'));

    } catch (error) {
        console.error(error);
        showResult("Error performing operation: " + error.message);
    }
}

// Utility: set storage with Promise wrapper
function setStorage(key, value) {
    return new Promise((resolve, reject) => {
        chrome.storage.local.set({ [key]: value }, () => {
            if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
            else resolve();
        });
    });
}

// Save notes per domain
async function saveNotes() {
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) {
            showResult("Cannot save notes for this page.");
            return;
        }

        const notesTextarea = document.getElementById("notes");
        const notes = notesTextarea.value;

        if (!notes.trim()) {
            showResult("Cannot save empty notes.");
            return;
        }

        const domainKey = new URL(tab.url).hostname;
        const storageKey = domainKey + "_notes";

        await setStorage(storageKey, notes);
        showResult(`Notes saved for ${domainKey}!`);
    } catch (error) {
        console.error(error);
        showResult("Error saving notes");
    }
}



// Reset notes for current domain
async function resetNotes() {
    document.getElementById("operationButton").value = 'paraphrase';
    document.getElementById("notes").value = '';
    document.getElementById("results").innerText = '';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (!tab || !tab.url) return;

        const domainKey = new URL(tab.url).hostname;
        const storageKey = domainKey + "_notes";

        await setStorage(storageKey, "");
        showResult(`Notes reset for ${domainKey}!`);
    } catch (error) {
        console.error(error);
        showResult("Error resetting notes");
    }
}

// Display results in popup
function showResult(content) {
    document.getElementById('results').innerHTML = `<div class="result-item"><div class="result-content">${content}</div></div>`;
}

function copyToNotes() {
    const resultsDiv = document.getElementById("results");
    const notesTextarea = document.getElementById("notes");

    if (!resultsDiv.innerHTML.trim()) {
        showResult("No generated response to copy.");
        return;
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = resultsDiv.innerHTML;

    // Convert <li> elements to "- item" text
    tempDiv.querySelectorAll("li").forEach(li => {
        li.innerText = "- " + li.innerText;
    });

    // Convert <br> to newlines
    tempDiv.querySelectorAll("br").forEach(br => br.replaceWith("\n"));

    // Get plain text
    const resultsText = tempDiv.innerText.trim();

    if (!resultsText) {
        showResult("No generated response to copy.");
        return;
    }

    // Append to existing notes or replace if empty
    if (notesTextarea.value.trim()) {
        notesTextarea.value += "\n\n" + resultsText;
    } else {
        notesTextarea.value = resultsText;
    }

    showResult("Copied generated response to notes!");
}
