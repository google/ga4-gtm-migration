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

// Functions related to the UA settings variable

/**
 * Finds all the UA settings variables in a container and writes them to a
 * specified range and sheet.
 * @param {string} sheetName
 */
function writeAnalyticsSettingsVariableToSheet(sheetName) {
  checkRelease();
  const variables = listGTMResources('variables', getSelectedWorkspacePath());
  let analyticsVariables = [];
  variables.forEach(variable => {
    if (variable.type == 'gas') {
      const name = variable.name;
      let trackingId = '';
      variable.parameter.forEach(param => {
        if (param.key == 'trackingId') {
          trackingId = param.value;
        }
      });
      const variableId = variable.variableId;
      analyticsVariables.push([name, trackingId, variableId]);
    }
  });
  writeToSheet(analyticsVariables, sheetName, 'settings variable');
}

/**
 * Writes the UA variables in a workspace to the pageview migration sheet.
 */
function writeAnalyticsSettingsVariablesToPageviewSheet() {
  writeAnalyticsSettingsVariableToSheet('pageviewMigration');
}

/**
 * Writes the UA variables in a workspace to the event migration sheet.
 */
function writeAnalyticsSettingsVariablesToEventSheet() {
  writeAnalyticsSettingsVariableToSheet('eventMigration');
}

