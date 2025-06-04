const fs = require('fs');
const path = require('path');

// Правила именования файлов
const namingRules = {
  components: /^[A-Z][a-zA-Z]*\.(tsx|jsx)$/,
  pages: /^[A-Z][a-zA-Z]*\.(tsx|jsx)$/,
  hooks: /^use[A-Z][a-zA-Z]*\.(ts|tsx)$/,
  utils: /^[a-z][a-zA-Z]*\.(ts|js)$/,
  types: /^[A-Z][a-zA-Z]*\.(ts|d\.ts)$/,
  constants: /^[A-Z][A-Z_]*\.(ts|js)$/,
  styles: /^[a-z][a-zA-Z]*\.(css|scss|module\.css|module\.scss)$/,
  tests: /^[A-Z][a-zA-Z]*\.(test|spec)\.(ts|tsx|js|jsx)$/
};

// Директории для проверки
const directories = {
  components: 'client/src/components',
  pages: 'client/src/pages',
  hooks: 'client/src/hooks',
  utils: 'client/src/utils',
  types: 'client/src/types',
  constants: 'client/src/constants',
  styles: 'client/src/styles',
  tests: 'client/src/__tests__'
};

// Функция для проверки файла
function checkFile(filePath, rule) {
  const fileName = path.basename(filePath);
  if (!rule.test(fileName)) {
    console.error(`❌ ${filePath} не соответствует правилам именования`);
    return false;
  }
  return true;
}

// Функция для рекурсивного обхода директории
function checkDirectory(dir, rule) {
  if (!fs.existsSync(dir)) return true;
  
  const files = fs.readdirSync(dir);
  let isValid = true;

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      isValid = checkDirectory(filePath, rule) && isValid;
    } else {
      isValid = checkFile(filePath, rule) && isValid;
    }
  }

  return isValid;
}

// Основная функция проверки
function checkNamingConventions() {
  console.log('🔍 Проверка правил именования файлов...\n');
  
  let hasErrors = false;

  for (const [type, rule] of Object.entries(namingRules)) {
    const dir = directories[type];
    console.log(`\nПроверка ${type}...`);
    
    if (!checkDirectory(dir, rule)) {
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.error('\n❌ Найдены ошибки в именовании файлов');
    process.exit(1);
  } else {
    console.log('\n✅ Все файлы соответствуют правилам именования');
  }
}

// Запуск проверки
checkNamingConventions(); 