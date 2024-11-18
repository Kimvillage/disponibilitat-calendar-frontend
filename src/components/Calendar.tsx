// Al principi del fitxer, després dels imports:
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// I canvia totes les crides a fetch per utilitzar API_URL:
// De:
fetch('http://localhost:3001/api/calendar')
// A:
fetch(`${API_URL}/api/calendar`)

// I també:
// De:
fetch('http://localhost:3001/api/calendar', {
// A:
fetch(`${API_URL}/api/calendar`, {
