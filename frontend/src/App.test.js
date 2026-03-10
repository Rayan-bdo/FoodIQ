import React from 'react';
import ReactDOM from 'react-dom/client';
import './setupTests';
import App from './App';

describe('App', () => {
  test('renders without crashing', () => {
    const root = ReactDOM.createRoot(document.createElement('div'));
    root.render(<App />);
  });
});
