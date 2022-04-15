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

/**
 * Writes a user's GTM accounts to the sheet.
 */
function writeGtmAccountsToSheet() {
  const accounts = listGTMResources('accounts');
  if (accounts.length > 0) {
    const formattedAccounts = accounts.reduce((arr, account) => {
      arr.push([account.name, account.path]);
      return arr;
    }, []);
    writeToSheet(formattedAccounts, 'gtmWorkspace', 'accounts list');
  } 
}

/**
 * Writes a user's GTM containers to the sheet.
 */
function writeSelectedGtmContainersToSheet() {
  const accounts = getDataFromSheet('gtmWorkspace', 'accounts list');
  const selectedAccounts = accounts.filter(account => account[2]);
  const containers = listGTMResources('containers', selectedAccounts[0][1]);
  if (containers.length > 0) {
    const formattedContainers = containers.reduce((arr, container) => {
      arr.push([container.name, container.path]);
      return arr;
    }, []);
    writeToSheet(formattedContainers, 'gtmWorkspace', 'containers list');
  } 
}

/**
 * Writes a user's GTM workspaces to the sheet.
 */
function writeSelectedGtmWorkspacesToSheet() {
  const containers = getDataFromSheet('gtmWorkspace', 'containers list');
  const selectedContainers = containers.filter(container => container[2]);
  const workspaces = listGTMResources('workspaces', selectedContainers[0][1]);
  if (workspaces.length > 0) {
    const formattedWorkspaces = workspaces.reduce((arr, workspace) => {
      arr.push([workspace.name, workspace.path]);
      return arr;
    }, []);
    writeToSheet(formattedWorkspaces, 'gtmWorkspace', 'workspaces list');
  } 
}

/**
 * Gets the selected workspace path from the GTM Workspace sheet.
 * return {string} The selected workspace path.
 */
function getSelectedWorkspacePath() {
  const workspaces = getDataFromSheet('gtmWorkspace', 'workspaces list');
  const selectedWorkspace = workspaces.filter(workspace => workspace[2]);
  if (selectedWorkspace.length == 0) {
    ui.alert(messageText.missingGTMWorkspace);
    return '';
  } else {
   return selectedWorkspace[0][1];
  }
  return workspaces.filter(workspace => workspace[2])[0][1];
}