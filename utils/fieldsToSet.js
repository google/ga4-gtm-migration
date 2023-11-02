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
 * Attempts to convert camel case field names to snake case.
 * @param {!Array<?Object>} fields A list of all fields.
 * @return {!Array<?Array<string>>} A list of all fields.
 */
function convertToSnakeCase(fields) {
  fields.forEach(field => {
    if (/{{/.test(field[2]) == false) {
			const convertedName = field[2].replace( /([A-Z])/g, " $1" );
			field[2] = convertedName.split(' ').join('_').toLowerCase();
    }
  });
  return fields;
}

/**
 * Lists the values for the "Fields to set" settings for a given Universal 
 * Analytics tag or settings variable.
 * @param {!Object} Either a Universal Analytics tag or variable object.
 * @return {!Array} An array of the field to set settings.
 */
function listFieldsToSet(entity) {
  const fields = formatFieldsToSet(entity);
  const snakeCaseFieldNames = convertToSnakeCase(fields);
  return snakeCaseFieldNames;
}

/**
 * Returns a nested array to of field name and value pairs.
 * @param {!Object} entity A tag or variable object.
 * @return {!Array<?Array<string>>} An array of arrays containing entity ID,
 * field name, and value strings.
 */
function formatFieldsToSet(entity) {
  let fieldsToSet = [];
  if (entity.parameter != undefined) {
    entity.parameter.forEach(param => {
      if (param.key == 'fieldsToSet') {
        param.list.forEach(field => {
          let tempArray = [];
          field.map.forEach(map => {
            if (map.key == 'fieldName') {
              tempArray[0] = entity.name;
              tempArray[1] = entity.tagId || entity.variableId;
              tempArray[2] = 'fields to set';
              tempArray[3] = map.value;
            } else if (map.key == 'value') {
              tempArray[4] = map.value;
            }
          });
          fieldsToSet.push(tempArray);
        });
      }
    });
  }
  return fieldsToSet;
}