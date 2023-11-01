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
 * Writes GTM variables to the validation sheet.
 */
function writeAllGTMVariablesToValidationSheet() {
  const variables = listGTMResources('variables', getSelectedWorkspacePath());
  let formattedVariables = formatGTMVariablesToNamesArray(variables);
  const builtInVariables = listGTMResources(
    'builtInVariables', getSelectedWorkspacePath());
  formattedVariables = formattedVariables.concat(
    formatGTMVariablesToNamesArray(builtInVariables));
  clearRangeContent('validation', 'gtm variables');
  writeToSheet(formattedVariables, 'validation', 'gtm variables');
}

/**
 * Changes an array of variable objects into a double array of variable names.
 * Double curly brackets are added to the begginning and end of each variable
 * name to mimic how it appears in Tag Manager.
 * @param {!Object} variables
 * @return {!Array<!Array<string>>} A double array of variable names.
 */
function formatGTMVariablesToNamesArray(variables) {
  return variables.reduce((arr, variable) => {
    arr.push(['{{' + variable.name + '}}']);
    return arr;
  }, []);
}

/**
 * Writes the configuration settings variables that exist in the GTM
 * workspace to the validation sheet.
 */
function writeConfigurationSettingsVariablesToValidationSheet() {
  const variables = listGTMResources('variables', getSelectedWorkspacePath());
  const configurationVariables = variables.filter(
    variable => variable.type == 'gtcs');
  const formattedVariables = formatGTMVariablesToNamesArray(
    configurationVariables);
  clearRangeContent('validation', 'configuration variables');
  writeToSheet(formattedVariables, 'validation', 'configuration variables');
}

/**
 * Wites the event settings variables that existing in the GTM workspace to
 * the validation sheet.
 */
function writeEventSettingsVariablesToValidationSheet() {
  const variables = listGTMResources('variables', getSelectedWorkspacePath());
  const eventVariables = variables.filter(
    variable => variable.type == 'gtes');
  const formattedVariables = formatGTMVariablesToNamesArray(
    eventVariables);
  clearRangeContent('validation', 'event variables');
  writeToSheet(formattedVariables, 'validation', 'event variables');
}

/**
 * Finds all the UA settings variables in a container and writes them to a
 * specified range and sheet.
 * @param {string} sheetName
 */
function writeAnalyticsSettingsVariableToSheet(sheetName) {
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
  if (variables.length > 0) {
    writeToSheet(analyticsVariables, sheetName, 'settings variable');
  } else {
    ui.alert('There are no UA settings variables for this workspace.')
  }
}

/**
 * Gets the UA settings variable data object from the sheet.
 * @param {string} sheetsMetaField
 * @return {!Object}
 */
function getAnalyticsSettingsVariableData(sheetsMetaField) {
  const rows = getDataFromSheet(sheetsMetaField, 'settings variable');
  const selectedRow = rows.filter(row => row[row.length - 1]);
  try {
    return {
      originalName: selectedRow[0][0],
      trackingId: selectedRow[0][1],
      variableId: selectedRow[0][2],
      newName: selectedRow[0][3],
      selected: selectedRow[0][4] 
    };
  } catch(e) {
    Logger.log(e);
    ui.alert(errorText.missingUASettingsVariable);
    return;
  }
  
   
}