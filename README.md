# Log Analyzer Tool (support_workspace)

A TypeScript & React-based internal tool for log file analysis with a responsive web UI.

## Features

- **100% Client-Side Parsing:** Extremely fast parsing directly in the browser. Log files never leave your machine (no server upload required).
- **Collapsible Sidebar**: Responsive navigation with collapsible sidebar.
- **Log File Upload**: Support for `.log`, `.out`, `.xml`, `.txt` files.
- **Timestamp Parsing**: Automatic extraction and parsing of standard ISO 8601 and syslog-style timestamps (e.g. `Jan 15 10:30:45`).
- **Log Level Detection**: Auto-detection of `DEBUG`, `INFO`, `WARNING`, `ERROR`, `FATAL` levels, with consistent level normalization.
- **Filtering**: Filter by time range, log level, and text search.
- **Timeline View**: Visual timeline of log events grouped dynamically based on the total time span of log entries.
- **Export**: Export filtered logs to a clean text bundle directly from the browser.

## Installation & Running

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open browser at: [http://localhost:3000](http://localhost:3000)

## Testing

Run unit tests via Vitest:
```bash
npm run test
```
