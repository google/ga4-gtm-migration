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
 * Writes the Universal Analytics event tag information to the event tags sheet.
 */
function writeUATagsToEventSheet() {
  const allTags = listGTMResources('tags', getSelectedWorkspacePath());
  const uaTags = getUATags(allTags, 'all');
  const formattedTagData = uaTags.reduce((arr, tag) => {
    let tagType = tag.parameter.find(param => param.key == 'trackType').value;
    tagType = tagType.split('_')[1];
    arr.push([tag.name, tag.tagId, tagType]);
    return arr;
  }, []);
  writeToSheet(formattedTagData, 'eventTag', 'tags');
}

/**
 * Writes the fields to set, custom definition, and event data settings from all
 * selected Universal Analytics event tags to the event tags sheet.
 */
function writeUASettingsToEventSheet() {
  const tagsFromSheet = getDataFromSheet('eventTag', 'tags');
  const allTags = listGTMResources('tags', getSelectedWorkspacePath());
  const uaTags = getUATags(allTags, 'all');
  let finalValues = [];
  if (tagsFromSheet.length > 0) {
    tagsFromSheet.forEach(sheetTag => {
      const sheetTagId = sheetTag[1];
      const migrate = sheetTag[sheetTag.length - 1];
      if (migrate) {
        let settingValues = [];
        const selectedTag = uaTags.find(tag => tag.tagId == sheetTagId);
        settingValues = settingValues.concat(listCustomDefinitions(selectedTag));
        settingValues = settingValues.concat(listFieldsToSet(selectedTag));
        settingValues = settingValues.concat(listUAEventData(selectedTag));
        let uaTagType = selectedTag.parameter.find(
          param => param.key == 'trackType').value;
        uaTagType = uaTagType.split('_')[1];
        settingValues.forEach(arr => arr.splice(2, 0, uaTagType));
        finalValues = finalValues.concat(settingValues);
      }
    });
  }
  writeToSheet(finalValues, 'eventTag', 'parameters');
}

/**
 * Creates the new GA4 event tags based on the settings in the sheet and the
 * existing settings that are part of the old Universal Analytics tags.
 */
function migrateUATags() {
  const tagsFromSheet = getDataFromSheet('eventTag', 'tags');
  const settingsFromSheet = getDataFromSheet('eventTag', 'parameters');
  const allTags = listGTMResources('tags', getSelectedWorkspacePath());
  const uaTags = getUATags(allTags, 'all');
  const workspace = getSelectedWorkspacePath();

  if (tagsFromSheet.length > 0) {
    tagsFromSheet.forEach(sheetTag => {
      const sheetTagId = sheetTag[1];
      const ga4TagName = sheetTag[3];
      const measurementId = sheetTag[4];
      const ga4EventName = sheetTag[5];
      const sendEcommData = sheetTag[6];
      const ecommObject = sheetTag[7];
      const eventSettingsVariable = sheetTag[8];
      const migrateTag = sheetTag[sheetTag.length - 1];
      if (migrateTag) {
        const selectedTag = uaTags.find(tag => tag.tagId == sheetTagId);
        const selectedTagSkeleton = createTagSkeleton(selectedTag);
        selectedTagSkeleton.name = ga4TagName;
        selectedTagSkeleton.type = 'gaawe';
        selectedTagSkeleton.parameter = [
          {
            "type": "template",
            "key": "eventName",
            "value": ga4EventName
          },
          {
            "type": "template",
            "key": "measurementIdOverride",
            "value": measurementId
          }];
        if (eventSettingsVariable.length > 0) {
          selectedTagSkeleton.parameter.push({
            "type": "template",
            "key": "eventSettingsVariable",
            "value": eventSettingsVariable
          });
        }
        if (sendEcommData) {
          selectedTagSkeleton.parameter.push({
            "type": "boolean",
            "key": "sendEcommerceData",
            "value": sendEcommData.toString()
          });
          if (ecommObject == 'dataLayer') {
            selectedTagSkeleton.parameter.push({
              "type": "template",
              "key": "getEcommerceDataFrom",
              "value": ecommObject
            });
          } else {
            skeletonEventTag.parameter.push({
              key: 'ecommerceMacroData',
              type: 'template',
              value: ecommObject
            }, {
              key: 'getEcommerceDataFrom',
              type: 'template',
              value: 'customObject'
            });
          }
        }
        const params = [];
        const userProperties = [];
        for (let i = 0; i < settingsFromSheet.length; i++) {
          const currentSettingRow = settingsFromSheet[i];
          const uaTagId = currentSettingRow[1];
          const settingType = currentSettingRow[6];
          const settingName = currentSettingRow[7];
          const settingValue = currentSettingRow[8];
          const migrateSetting = currentSettingRow[9];
          if (migrateSetting) {
            if (sheetTagId == uaTagId) {
              if (settingType == 'parameter') {
                params.push(buildParameterMapObject(settingName, settingValue));
              } else if (settingType == 'user_property') {
                userProperties.push(buildUserPropertyMapObject(
                  settingName,
                  settingValue
                ));
              }
              settingsFromSheet.splice(i, 1);
              --i;
            }
          } else {
            settingsFromSheet.splice(i, 1);
          }
        }
        if (params.length > 0) {
          selectedTagSkeleton.parameter.push({
            type: 'list',
            key: 'eventSettingsTable',
            list: params
          });
        }
        if (userProperties.length > 0) {
          selectedTagSkeleton.parameter.push({
            type: 'list',
            key: 'userProperties',
            list: userProperties
          });
        }
        newTag = createGTMResource('tags', workspace, selectedTagSkeleton);
        logChange(newTag.name, newTag.type, newTag.tagId, 
          'created', newTag.tagManagerUrl);
      }
    });
  }
}