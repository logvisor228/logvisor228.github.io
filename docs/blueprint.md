# **App Name**: LogVisor

## Core Features:

- Log File Upload: Allows the user to upload a JSON file with logs and parses the content into structured `LogData`.
- Interactive Map Visualization: Displays location entries on a Yandex map with connected polylines, highlighting the selected location event, smoothly moves when necessary using the API key.
- Log Details View: Presents detailed information about selected log entries (location, notifications, text, connectivity) along with navigation buttons for location entries.
- Notifications Display: Lists notification log entries in reverse chronological order, and allows the selected entry to highlight the appropriate location or item.
- Text Logs Aggregation: Groups text log entries by package, displaying continuous entries as combined blocks and allows the selected entry to highlight the appropriate location or item.
- Unified Timeline: Renders a timeline of all log entries (all types), marking each event with an icon, and scrolling to a highlighted, selected item when an item is chosen.
- GitHub Pages instructions: Creates the homepage in package.json with instructions for building and deploying to GitHub Pages.

## Style Guidelines:

- Background: Dark grey (#1E1A26) to provide a high contrast dark theme.
- Foreground: Light grey (#F2F2F2) to ensure text is readable on dark backgrounds.
- Primary: Vibrant purple (#A23CBC) for main interactive elements to reflect a strong brand identity.
- Accent: Soft lavender (#C773E5) used sparingly to highlight less prominent interactive elements.
- Body and headline font: 'Inter' sans-serif for a modern and readable interface.
- Icons should be simple and monochromatic, in shades that complement the accent color.
- Use adaptive layouts to ensure that tabs and data displays reflow correctly on different screen sizes.
- Subtle transition animations to the interface's different elements.