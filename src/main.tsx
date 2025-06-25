
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log('Main.tsx loading...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error('Root element not found!');
  document.body.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error: No se pudo cargar la aplicación</h1><p>El elemento root no se encontró en el HTML.</p></div>';
} else {
  console.log('Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  try {
    root.render(<App />);
    console.log('App rendered successfully');
  } catch (error) {
    console.error('Error rendering app:', error);
    rootElement.innerHTML = '<div style="padding: 20px; text-align: center;"><h1>Error de Renderizado</h1><p>No se pudo renderizar la aplicación. Ver consola para detalles.</p></div>';
  }
}
