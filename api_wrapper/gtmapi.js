/**
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const gtmAPIResources = {
  accounts: TagManager.Accounts,
  containers: TagManager.Accounts.Containers,
  workspaces: TagManager.Accounts.Containers.Workspaces,
  variables: TagManager.Accounts.Containers.Workspaces.Variables,
  tags: TagManager.Accounts.Containers.Workspaces.Tags,
  triggers: TagManager.Accounts.Containers.Workspaces.Triggers,
  builtInVariables: TagManager.Accounts.Containers.Workspaces.Built_in_variables
};

const gtmRequestDelay = parseInt(getDataFromSheet('settings', 'request delay')[0][0]) || 4000;

function gtmResources() {
  const resources = {}
  for (let field in gtmAPIResources) {
    resources[field] = field;
  }
  return resources;
}

/**
 * Request a list of GTM resources.
 * @param {string} resourceKey The resource to be listed.
 * @param {string} parent The parent resource URL.
 */
function listGTMResourcesRequest(resourceKey, parent) {
  try {
    const options = {pageSize: 200};
    let response = {};
    if (parent != undefined) {
      response = gtmAPIResources[resourceKey].list(parent, options);
    } else {
      response = gtmAPIResources[resourceKey].list(options);
    }
    options.pageToken = response.nextPageToken;
    Utilities.sleep(gtmRequestDelay);
    while (options.pageToken != undefined) {
      let nextPage = null;
      if (parent != undefined) {
        nextPage = gtmAPIResources[resourceKey].list(parent, options);
      } else {
        nextPage = gtmAPIResources[resourceKey].list(options);
      }
      response[resourceKey] = response[resourceKey].concat(nextPage[resourceKey.slice(0, resourceKey.length - 1)]);
      options.pageToken = nextPage.nextPageToken;
      Utilities.sleep(gtmRequestDelay);
    }
    return response;
  } catch(e) {
    console.log(e);
  }
}

/**
 * List of GTM resources.
 * @param {string} resourceKey The resource to be listed.
 * @param {string} parent The parent resource URL.
 */
function listGTMResources(resourceKey, parent) {
  if (cachingEnabled) {
    const cached = retrieveFromBatches(resourceKey, 'cache');
    if (cached != null) {
      return JSON.parse(cached);
    } else {
      const data = listGTMResourcesRequest(resourceKey, parent)[resourceKey.slice(0, resourceKey.length - 1)];
      saveInBatches(resourceKey, data, 'cache');
      return data;
    }
  } else {
    return listGTMResourcesRequest(resourceKey, parent)[resourceKey.slice(0, resourceKey.length - 1)];
  }
}

/**
 * Makes an API call to retrieve a single variable in a GTM container.
 * @param {string} resourceKey The resource to be retrieved.
 * @param {number} id The ID for a variable in the GTM container.
 * @return {?Object} A variable object.
 */
function getGTMResource(resourceKey, id) {
  console.log(getSelectedWorkspacePath() + '/' + resourceKey + '/' + id);
  return gtmAPIResources[resourceKey].get(getSelectedWorkspacePath() + '/' + resourceKey + '/' + id);
}

/**
 * Create a GTM tag.
 * @param {string} resourceKey The resource type to be created.
 * @param {string} parent
 * @param {!Object} payload
 */
function createGTMResource(resourceKey, parent, payload) {
  try {
    response = gtmAPIResources[resourceKey].create(payload, parent);
    Utilities.sleep(gtmRequestDelay);
    return response;
  } catch(e) {
    console.log(e)
  }
}