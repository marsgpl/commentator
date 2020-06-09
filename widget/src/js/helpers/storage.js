const storage = window.localStorage;

const storageRead = key => storage.getItem(key);

const storageWrite = (key, value) => {
    storage.setItem(key, value);
    return value;
};

const storageDelete = key => storage.removeItem(key);
