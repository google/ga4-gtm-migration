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
 * Lists the category, action, and label values in a given tag.
 * @param {!Object} entity A tag object.
 * @return {!Array<!Object>}
 */
function listUAEventData(entity) {
  let eventData = [];
  if (entity.parameter) {
    entity.parameter.forEach(param => {
      const entityName = entity.name;
      const id = entity.variableId || entity.tagId;
      if (param.key == 'eventCategory' ||
      param.key == 'eventAction' ||
      param.key == 'eventLabel') {
        eventData.push([
          entityName,
          id,
          'event data',
          param.key,
          param.value
        ]);
      }
    });
  }
  return eventData;
}