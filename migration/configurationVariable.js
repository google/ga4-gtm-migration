/**
 * Copyright 2023 Google LLC
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
 * Writes the UA variables in a workspace to the "Create Configuration 
 * Variables" sheet.
 */
function writeAnalyticsSettingsVariablesToConfigurationVariableSheet() {
  writeAnalyticsSettingsVariableToSheet('configurationVariable');
}

/**
 * Writes the fields to set and custom definition settings from the selected 
 * Universal Analytics settings variable to the configuration settings sheet.
 */
function writeConfigurationSettingsToSheet() {
  let values = [];
  const sheetsMetaField = 'configurationVariable';
  const analyticSettingsVariableData = 
    getAnalyticsSettingsVariableData(sheetsMetaField);
  analyticSettingsVariableId = analyticSettingsVariableData.variableId
  const analyticsSettingsVariable = 
    getGTMResource('variables', analyticSettingsVariableId);
  const fieldsToSet = listFieldsToSet(analyticsSettingsVariable);
  const customDefinitions = listCustomDefinitions(analyticsSettingsVariable);
  values = values.concat(fieldsToSet, customDefinitions);
  writeToSheet(values, sheetsMetaField, 'parameters');
}

/**
 * Retrieves the settings to be to a configuration settings variable from the 
 * sheet.
 * @return {!Array} An array of the settings to be created in the new 
 * configuration variable.
 */
function getConfigurationVariableSettingsFromSheet() {
  const sheetsMetaField = 'configurationVariable';
  const data = getDataFromSheet(sheetsMetaField, 'parameters');
  const parameters = data.reduce((arr, row) => {
    const name = row[0];
    const value = row[1];
    const migrate = row[row.length - 1];
    if (migrate) {
      arr.push(buildParameterMapObject(name, value));
    }
    return arr;
  }, []);
  return parameters;
}

/**
 * Creates the new configuration settings variable.
 */
function createConfigurationVariable() {
  const parametersList = getConfigurationVariableSettingsFromSheet();
  const configurationVariableName = getAnalyticsSettingsVariableData(
    'configurationVariable').newName;
  const newConfigurationVariable = {
    name: configurationVariableName,
    type: 'gtcs',
    parameter: {
      type: 'list',
      key: 'configSettingsTable',
      list: parametersList
    }
  }
  const newVar = createGTMResource(
    'variables', getSelectedWorkspacePath(), newConfigurationVariable);
  logChange(newVar.name, newVar.type, newVar.variableId, 
    'created', newVar.tagManagerUrl);
}