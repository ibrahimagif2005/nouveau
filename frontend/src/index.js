// frontend/src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client'; // Pour React 18+
// Pour React < 18, utilisez : import ReactDOM from 'react-dom';
import App from './App';
// import reportWebVitals from './reportWebVitals'; // Optionnel, pour mesurer la performance

// Importation du fichier CSS principal (souvent là où Tailwind est importé ou configuré)
import './index.css'; // Assurez-vous que ce fichier existe et est configuré pour Tailwind

const rootElement = document.getElementById('root');

// Pour React 18+
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Pour React < 18, utilisez :
// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   rootElement
// );

// Si vous voulez commencer à mesurer la performance dans votre application, passez une fonction
// pour logger les résultats (par exemple: reportWebVitals(console.log))
// ou envoyez vers un point de terminaison d'analyse. En savoir plus : https://bit.ly/CRA-vitals
// reportWebVitals();
