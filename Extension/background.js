// background.js — Color Picker Pro service worker

// Handle keyboard commands
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'copy-last-color') {
        // Copy the most recent color from history to clipboard
        // Uses the Offscreen API to write to clipboard from background
        const { colorHistory = [] } = await chrome.storage.local.get('colorHistory');
        if (colorHistory.length === 0) return;

        const color = colorHistory[0];

        // Try offscreen clipboard approach (Chrome 116+)
        try {
            await chrome.offscreen?.createDocument?.({
                url: 'offscreen.html',
                reasons: ['CLIPBOARD'],
                justification: 'Copy color to clipboard via keyboard shortcut'
            });
        } catch(_) { /* already exists or not supported */ }

        // Fallback: store in a "pending copy" slot for popup to pick up
        await chrome.storage.local.set({ pendingCopy: color });

        // Notify via badge briefly
        chrome.action.setBadgeText({ text: '✓' });
        chrome.action.setBadgeBackgroundColor({ color: '#22c55e' });
        setTimeout(() => chrome.action.setBadgeText({ text: '' }), 1500);
    }
});