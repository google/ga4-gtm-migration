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
 * Returns an array of universal analytics tags.
 * @param {!Array<?Object>} tags
 * @param {string} settingsVariableName The settings variable name without the 
 * double curly brackets or "all".
 * @return {?Array<?Object>}
 */
function getUATags(tags, settingsVariableName) {
  try {
    let uaTags = [];
    if (settingsVariableName == 'all') {
      uaTags = tags.filter(tag => {
        if (tag.type == analyticsVersion.ua) {
          return tag;
        }
      });
    } else {
      settingsVariableName = `{{${settingsVariableName}}}`;

      uaTags = tags.filter(tag => {
        if (tag.type == analyticsVersion.ua) {
          const gaSettingsParam = tag.parameter.find(
            param => param.key == 'gaSettings');
          if (gaSettingsParam) {
            if (gaSettingsParam.value == settingsVariableName) {
              return tag;
            }
          }
        }
      });
      if (uaTags.length > 0) {
        return uaTags;
      } else {
        throw new Error('No Universal Analytics tags.')
      }
    }
    
  } catch(e) {
    Logger.log(e);
    ui.alert(e);
  }
}

/**
 * Removes tag object properties that are not needed or will be set later,
 * creating a shell that still includes the trigger, exception, and some 
 * advanced settings for a tag.
 * @param {!Object} tag The tag object to remove properties from.
 * @return {!Object} A tag object with fewer properties.
 */
function createTagSkeleton(tag) {
  delete tag.name;
  delete tag.path;
  delete tag.parameter;
  delete tag.fingerprint;
  delete tag.type;
  delete tag.tagManagerUrl;
  delete tag.workspaceId;
  delete tag.tagId;
  delete tag.accountId;
  delete tag.containerId;
  return tag;
}