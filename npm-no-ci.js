// Este es un script que impide que Heroku ejecute npm ci
// Debe estar ubicado en la carpeta scripts

console.log('Evitando la ejecución de npm ci...');
console.log('Ejecutando npm install en su lugar...');

const { execSync } = require('child_process');

try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('npm install ejecutado con éxito');
} catch (error) {
  console.error('Error ejecutando npm install:', error);
  process.exit(1);
}

console.log('Iniciando aplicación...');
