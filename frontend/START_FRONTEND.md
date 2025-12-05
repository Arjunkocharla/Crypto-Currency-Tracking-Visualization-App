# Frontend Setup & Start Guide

## Quick Start

### 1. Install Dependencies (First Time Only)

```bash
cd frontend
npm install
```

This will install all React dependencies from `package.json`.

### 2. Create Environment File

Create a `.env` file in the `frontend` directory:

```bash
echo "REACT_APP_API_URL=http://127.0.0.1:8085/api" > .env
```

Or manually create `.env` with:
```
REACT_APP_API_URL=http://127.0.0.1:8085/api
```

### 3. Start the Frontend

```bash
npm start
```

The app will automatically open in your browser at `http://localhost:3000`

## What Happens

- React development server starts
- Hot reload enabled (changes auto-refresh)
- Opens browser automatically
- Runs on port 3000 by default

## Troubleshooting

### Port Already in Use

If port 3000 is busy, React will ask to use a different port (like 3001).

### Dependencies Not Installed

If you see module errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### API Connection Issues

Make sure:
1. Backend is running on `http://127.0.0.1:8085`
2. `.env` file has correct API URL
3. CORS is configured in backend

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Notes

- Keep the terminal open while the server is running
- Press `Ctrl+C` to stop the server
- Changes to code will auto-reload in browser

