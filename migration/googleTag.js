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
 * Writes the custom definition, fields to set, and event data settings from all
 * Universal Analytics tags to the Google Tag sheet.
 */
function writeSettingsToGoogleTagSheet() {
  let values = [];
  const sheetsMetaField = 'googleTag';
  const uaTags = getUATags(
    listGTMResources('tags', getSelectedWorkspacePath()), 'all');
  if (uaTags) {
    uaTags.forEach(tag => {
      values = values.concat(listCustomDefinitions(tag));
      values = values.concat(listFieldsToSet(tag));
      values = values.concat(listUAEventData(tag));
    });
  }
  writeToSheet(values, sheetsMetaField, 'parameters');
}


/**
 * Creates the new Google Tags.
 */
function createGoogleTag() {
  let newTags = [];
  const sheetsMetaField = 'googleTag';
  const tagSettings = getDataFromSheet(sheetsMetaField, 'tag settings');
  const parameters = getDataFromSheet(sheetsMetaField, 'parameters');
  const existingTriggers = getDataFromSheet('validation', 'triggers');
  const workspace = getSelectedWorkspacePath();
  if (tagSettings.length > 0) {
    newTags = tagSettings.reduce((arr, row) => {
      const name = row[0];
      const tagId = row[1];
      const configVar = row[2];
      const eventVar = row[3];
      const useInitAllPagesTrigger = row[4];
      const triggers = row[5];
      const exception = row[6];
      const create = row[7];
      if (create) {
        newGoogleTag = {
          type: 'googtag',
          name: name,
          parameter: [{
            type: 'template',
            key: 'tagId',
            value: tagId
          }]
        }
        if (configVar.length > 0) {
          newGoogleTag.parameter.push({
            type: 'template',
            key: 'configSettingsVariable',
            value: configVar
          });
        }
        if (eventVar.length > 0) {
          newGoogleTag.parameter.push({
            type: 'template',
            key: 'eventSettingsVariable',
            value: eventVar
          })
        }
        if (useInitAllPagesTrigger) {
          newGoogleTag.firingTriggerId = ['2147479573'];
        } else {
          const triggersArray = triggers.split(',');
          const triggerIds = [];
          if (triggersArray.length > 0) {
            triggersArray.forEach(triggerName => {
              existingTriggers.forEach(validationTrigger => {
                if (triggerName == validationTrigger[0]) {
                  triggerIds.push(validationTrigger[1]);
                }
              });
            });
          }
        }
        const blockingTriggerArray = exception.split(',');
        const blockingTriggerIds = [];
        if (blockingTriggerArray.length > 0) {
          blockingTriggerArray.forEach(blockingTriggerName => {
            existingTriggers.forEach(validationTrigger => {
              if (blockingTriggerName == validationTrigger[0]) {
                blockingTriggerIds.push(validationTrigger[1]);
              }
            });
          });
        }
        newGoogleTag.blockingTriggerId = blockingTriggerIds;
      }
      arr.push(newGoogleTag);
      return arr;
    }, []);
  }
  if (newTags.length > 0) {
    let organizedParameters = null;
    if (parameters.length > 0) {
      organizedParameters = parameters.reduce((obj, row) => {
        const tagName = row[0];
        const type = row[1];
        const fieldName = row[2];
        const value = row[3];
        const migrate = row[4];
        if (migrate) {
          if (!obj[tagName]) {
            obj[tagName] = {
              eventParameters: [],
              configParameters: []
            };
          }
          if (type == 'event parameter') {
            obj[tagName].eventParameters.push(
              buildParameterMapObject(fieldName, value));
          } else {
            obj[tagName].configParameters.push(
              buildParameterMapObject(fieldName, value));
          }
        }
        return obj;
      }, {});
    }
    newTags.forEach(tag => {
      if (organizedParameters) {
        if (organizedParameters[tag.name]) {
          if (organizedParameters[tag.name].eventParameters.length > 0) {
            tag.parameter.push({
              type: 'list',
              key: 'eventSettingsTable',
              list: organizedParameters[tag.name].eventParameters
            });
          }
          if (organizedParameters[tag.name].configParameters.length > 0) {
            tag.parameter.push({
              type: 'list',
              key: 'configSettingsTable',
              list: organizedParameters[tag.name].configParameters
            });
          }
        }
        const createdNewTag = createGTMResource('tags', workspace, tag);
        logChange(
          createdNewTag.name, createdNewTag.type, 
          createdNewTag.tagId, 'created', createdNewTag.tagManagerUrl);
      }
    });
  }
}