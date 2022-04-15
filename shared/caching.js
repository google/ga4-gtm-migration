/**
 * Gets data from or sets data to the property / cache.
 * @param {string} storage The property / cache. (required).
 * @param {string} key Used to get data stored in the property / cache.
 * (required).
 * @param {string} scope The storage scope. Valid scopes - user, script,
 * document (required).
 * @param {string} dataType The property / cache data type. Possible values:
 * json, bool, string (required when action is set).
 * @param {string} action The action performed, get / set the property / cache
 * (required if the action is set).
 * @param {string} value The value if action === 'set', value to be set.
 * (required if the action is set)
 * @param {number} expirationDuration The duration after wich the cache expires.
 * @return {string} The data stored in the property / cache.
 */
function getSetStorage(
    storage, key, scope, dataType, action, value, expirationDuration) {
  expirationDuration = expirationDuration || 21600;
  let store = storage === 'cache' ? CacheService : PropertiesService;
  let val;

  if (scope === 'user') {
    store = store[storage === 'cache' ? 'getUserCache' : 'getUserProperties']();
  } else if (scope === 'script') {
    store =
        store[storage === 'cache' ? 'getScriptCache' : 'getScriptProperties']();
  } else {
    store =
        store[storage === 'cache' ? 'getDocumentCache' : 'getDocumentProperties']();
  }

  if (action === 'set') {
    val = value;
    const argsTobePassed =
        [key, dataType === 'json' ? JSON.stringify(value) : value];

    if (storage === 'cache') argsTobePassed.push(expirationDuration);

    store[storage === 'cache' ? 'put' : 'setProperty'](...argsTobePassed);
  } else {
    const storedValue = store[storage === 'cache' ? 'get' : 'getProperty'](key);
    if (!storedValue) return null;

    if (dataType === 'json')
      val = JSON.parse(storedValue);
    else if (dataType === 'bool')
      val = storedValue === 'true';
    else
      val = storedValue;
  }

  return val;
}

/**
 * Converts string to byte length.
 * @param {string} str The string value to be converted to size.
 * @return {number} The byte size of the string passed.
 */
function byteLength(str) {
  // returns the byte length of an utf8 string
  let s = str.length;
  for (let i = str.length - 1; i >= 0; i -= 1) {
    const code = str.charCodeAt(i);
    if (code > 0x7f && code <= 0x7ff)
      s += 1;
    else if (code > 0x7ff && code <= 0xffff)
      s += 2;
    if (code >= 0xdc00 && code <= 0xdfff) i -= 1;  // trail surrogate
  }
  return s;
}

/**
 * Returns the length of the string to save in the storage based on its
 * limitation.
 * @param {!Array} value The value to be stored.
 * @param {string} type The cache / property type.
 * @return {number} The length of the string.
 */
const getChunkSize = (value, type) => {
  // Sets the max limit of a chunk. For cache, it is 95KB and for property it
  // is 8.5KB
  const sizeLimit = (type === 'cache' ? 95 : 8.5) * 1024;

  let newValue = value;
  let byteSize = byteLength(newValue);

  while (byteSize > sizeLimit) {
    // Slices the string in half till it is within the size limit
    newValue = value.slice(0, (newValue.length / 2));
    byteSize = byteLength(newValue);
  }
  return newValue.length;
};

/**
 * Saves the property within the chache size limit.
 * @param {string} name The name of the property.
 * @param {!Array} value The value of the property.
 * @param {string} type The type of the storage property / cache.
 * @param {string} scope The scope of the storage user / document / script.
 */
function saveInBatches(name, value, type, scope) {
  type = type || 'property';
  scope = scope || 'user';
  const jsonStr = JSON.stringify(value);
  const strSliceLength = getChunkSize(jsonStr, type);

  // Number of iterations to perform
  const totalChunkedIterations = Math.ceil(jsonStr.length / strSliceLength);
  let counter = 0;

  for (let i = 0; i < jsonStr.length; i += strSliceLength) {
    const prop = jsonStr.slice(i, i + strSliceLength);

    getSetStorage(type, `${name}_${counter}`, scope, 'string', 'set', prop);
    counter += 1;
  }

  // Stores the total number of chunks stored to be used when retrieving
  getSetStorage(
      type, `${name}_total`, scope, 'number', 'set', totalChunkedIterations);
}

/**
 * Retreive the property in batches to avoid Argument too large error.
 * @param {string} name The name of the property.
 * @param {string} type The type of the storage property / cache.
 * @param {string} scope The scope of the storage user / document / script.
 * @return {!Object} The value in the property after fetching from batches.
 */
function retrieveFromBatches(name, type, scope) {
  type = type || 'property';
  scope = scope || 'scope';
  const count =
      Number(getSetStorage(type, `${name}_total`, scope, 'number')) || 0;
  if (count === 0) return undefined;

  let jsonStr = '';

  for (let i = 0; i < count; i += 1) {
    const tempStr = getSetStorage(type, `${name}_${i}`, scope, 'string');

    // JSON string is stitched here
    jsonStr += tempStr;
  }

  // JSON string is parsed and returned
  return JSON.parse(jsonStr);
}

/**
 * Deletes all the saved batches.
 * @param {string} name The name of the property.
 * @param {string} type The type of the storage property / cache.
 * @param {string} scope The scope of the storage user / document / script.
 */
function deleteBatches(name, type, scope) {
  type = type || 'property';
  scope = scope || 'user';
  const count =
      Number(getSetStorage(type, `${name}_total`, scope, 'number')) || 0;
  const serviceFunc = type === 'property' ? PropertiesService : CacheService;

  // Returns the method to be used based on the type of storage and scope
  const funcMethod = {
    property: {
      user: 'getUserProperties',
      document: 'getDocumentProperties',
      script: 'getScriptProperties',
    },
    cache: {
      user: 'getUserCache',
      document: 'getDocumentCache',
      script: 'getScriptCache',
    },
  }[type][scope];
  const deleteObj = serviceFunc[funcMethod]();
  const deleteMethod = type === 'property' ? 'deleteProperty' : 'remove';

  for (let i = 0; i < count; i += 1) {
    deleteObj[deleteMethod](`${name}_${i}`);
  }

  deleteObj[deleteMethod](`${name}_total`);
}