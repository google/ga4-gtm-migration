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
 * Lists the custom definitions in a given tag or variable.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} Either an empty array or a double array of
 * custom definitions in a given tag or variable.
 */
function listCustomDefinitions(resource) {
  let definitions = [];
  if (resource.parameter != undefined) {
    resource.parameter.forEach(param => {
      if (param.key == 'dimension' || param.key == 'metric') {
        param.list.forEach(entity => {
          let tempArray = [];
          let indexNumber = '0';
          entity.map.forEach(map => {
            if (map.key == 'index') {
              indexNumber = map.value;
            } else if (map.key == 'dimension' || map.key == 'metric') {
              tempArray[0] = resource.name;
              tempArray[1] = resource.tagId || resource.variableId;
              tempArray[2] = map.key;
              tempArray[3] = indexNumber;
              tempArray[4] = map.value;
            }
          });
          definitions.push(tempArray);
        });
      }
    });
  }
  return definitions;
}