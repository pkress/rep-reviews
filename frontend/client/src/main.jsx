import React from 'react'; 
import ReactDOM from 'react-dom/client'; 
import App from './App';
import { SessionProvider } from './context/SessionProvider';
import { ViewModeProvider } from './context/ViewModeContext';
 
const root = ReactDOM.createRoot(document.getElementById('root'));
 
root.render(
  <React.StrictMode>
    <SessionProvider>
      <ViewModeProvider>
        <App />
      </ViewModeProvider>
    </SessionProvider>
  </React.StrictMode>
);
