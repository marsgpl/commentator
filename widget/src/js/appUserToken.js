const APP_USER_TOKEN = storageRead(STORAGE_KEY_APP_USER_TOKEN) ||
    storageWrite(STORAGE_KEY_APP_USER_TOKEN, uuid());
