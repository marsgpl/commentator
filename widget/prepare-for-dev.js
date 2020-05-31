const fs = require('fs');

const apiJsPath = 'src/js/api.js';
let apiJsContent = fs.readFileSync(apiJsPath).toString('utf-8');

apiJsContent = apiJsContent.replace(
    "\n// const API_BASE_URL = 'http://127.0.0.1:42080/api';",
    "\nconst API_BASE_URL = 'http://127.0.0.1:42080/api';");
apiJsContent = apiJsContent.replace(
    "\n// const API_COMMENTATOR_ID = 'abortion';",
    "\nconst API_COMMENTATOR_ID = 'abortion';");
apiJsContent = apiJsContent.replace(
    "\n// const API_LANG = 'ru';",
    "\nconst API_LANG = 'ru';");

apiJsContent = apiJsContent.replace(
    "\nconst API_BASE_URL = '#lang#api_base_url#';",
    "\n// const API_BASE_URL = '#lang#api_base_url#';");
apiJsContent = apiJsContent.replace(
    "\nconst API_COMMENTATOR_ID = '#lang#api_commentator_id#';",
    "\n// const API_COMMENTATOR_ID = '#lang#api_commentator_id#';");
apiJsContent = apiJsContent.replace(
    "\nconst API_LANG = '#lang#language#';",
    "\n// const API_LANG = '#lang#language#';");

fs.writeFileSync(apiJsPath, apiJsContent);
