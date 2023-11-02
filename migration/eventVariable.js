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
 * Writes the UA variables in a workspace to the "Create Event Tag 
 * Variables" sheet.
 */
function writeAnalyticsSettingsVariablesToEventVariableSheet() {
  writeAnalyticsSettingsVariableToSheet('eventVariable');
}

/**
 * Writes the fields to set, custom definition settings, and event data settings
 * from the selected Universal Analytics settings variable and event tags to the
 * event settings sheet.
 */
function writeSettingsToEventTagSheet() {
  let values = [];
  const sheetsMetaField = 'eventVariable';
  const analyticSettingsVariableData = 
    getAnalyticsSettingsVariableData(sheetsMetaField);
  const analyticsSettingsVariable = 
    getGTMResource('variables', analyticSettingsVariableData.variableId);
  const fieldsToSet = listFieldsToSet(analyticsSettingsVariable);
  const customDefinitions = listCustomDefinitions(analyticsSettingsVariable);
  values = values.concat(fieldsToSet, customDefinitions);

  settingsVariableName = 
    getAnalyticsSettingsVariableData(sheetsMetaField).originalName;
  const uaTags = getUATags(
    listGTMResources('tags', getSelectedWorkspacePath()), 
    analyticSettingsVariableData.originalName);
  if (uaTags) {
    uaTags.forEach(tag => {
      values = values.concat(listCustomDefinitions(tag));
      values = values.concat(listFieldsToSet(tag));
      values = values.concat(listUAEventData(tag));
    })
  }
  writeToSheet(values, sheetsMetaField, 'parameters');
}

/**
 * Retrieves the settings to be to a event settings variable from the sheet.
 * @return {!Object} An object contain the parameter and user property settings
 * to be created in the new variable settings sheet.
 */
function getEventVariableSettingsFromSheet() {
  const sheetsMetaField = 'eventVariable';
  const data = getDataFromSheet(sheetsMetaField, 'parameters');
  const values = data.reduce((obj, row) => {
    const type = row[0];
    const name = row[1];
    const value = row[2];
    const migrate = row[row.length - 1];
    if (migrate) {
      if (type == 'parameter') {
        obj.parameters.push(buildParameterMapObject(name, value));
      } else if (type == 'user_property') {
        obj.userProperties.push(buildUserPropertyMapObject(name, value));
      }
    }
    return obj;
  }, {parameters: [], userProperties: []});
  return values;
}

/**
 * Creates the new event settings variable.
 */
function createEventVariable() {
  const settings = getEventVariableSettingsFromSheet();
  const eventVariableName = 
  getAnalyticsSettingsVariableData('eventVariable').newName;
  const newEventVariable = {
    name: eventVariableName,
    type: 'gtes',
    parameter: []
  }
  if (settings.parameters.length > 0) {
    newEventVariable.parameter.push({
      type: 'list',
      key: 'eventSettingsTable',
      list: settings.parameters
    });
  }
  if (settings.userProperties.length > 0) {
    newEventVariable.parameter.push({
      type: 'list',
      key: 'userProperties',
      list: settings.userProperties
    });
  }
  const newVar = createGTMResource(
    'variables', getSelectedWorkspacePath(), newEventVariable);
  logChange(newVar.name, newVar.type, newVar.variableId, 
    'created', newVar.tagManagerUrl);
}