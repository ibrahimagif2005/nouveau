// backend/jest.config.js
module.exports = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./tests/setup.js'], // Fichier de setup pour la BDD en mémoire, etc.
  testPathIgnorePatterns: ['/node_modules/', '/frontend/'], // Ignorer les node_modules et le dossier frontend
  coveragePathIgnorePatterns: ['/node_modules/', '/frontend/'],
  // Optionnel: collecter la couverture de code
  // collectCoverage: true,
  // coverageDirectory: "coverage",
  // coverageReporters: ["json", "lcov", "text", "clover"],
  // reporters: [ "default", "jest-junit" ] // Pour l'intégration CI/CD
};
