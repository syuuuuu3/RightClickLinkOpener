# Range Link Selector

A Chrome extension that allows you to select multiple links within a dragged area and open them in background tabs.

## Features

- **Alt + Left Click Drag**: Select links within a rectangular area
- **Real-time Highlighting**: Links are highlighted with red borders during selection
- **Safety Limit**: Maximum 10 links can be opened at once
- **Background Tabs**: All selected links open in new background tabs
- **Visual Feedback**: Selection box and link highlighting for clear visual indication

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the extension directory
5. The extension will be installed and ready to use

## Usage

1. **Start Selection**: Hold `Alt` and click-drag on any webpage to create a selection area
2. **Visual Feedback**: 
   - A blue dashed box shows your selection area
   - Links within the area are highlighted with red borders
   - Your cursor changes to a crosshair during selection
3. **Complete Selection**: Release the mouse button to open all highlighted links
4. **Cancel Selection**: Press `Escape` to cancel the current selection

## Safety Features

- **Link Limit**: If more than 10 links are selected, an alert will appear and no links will be opened
- **URL Filtering**: Excludes anchor links (`#`) and JavaScript URLs
- **Confirmation**: Links are briefly highlighted before opening to show what will be opened

## Technical Details

### Files Structure
```
├── manifest.json          # Extension manifest
├── background.js          # Background script for tab management
├── rangeLinkSelector.js   # Content script for range selection
└── README.md             # This file
```

### Permissions
- `scripting`: For content script injection
- `activeTab`: For accessing current tab
- `tabs`: For opening new tabs
- `<all_urls>`: For running on all websites

## Browser Compatibility

- Chrome (Manifest V3)
- Chromium-based browsers

## Known Limitations

- Only works on standard web pages (not on Chrome internal pages)
- Links must be visible and have proper href attributes
- Maximum 10 links per selection for safety

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve this extension.

## License

MIT License - feel free to use and modify as needed.
