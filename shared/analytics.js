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

/**
 * Sends a hit to Google Analytics.
 * @param {!Object} data The event data for the Google Analytics hit.
 */
function sendGAHit(data) {
  if (measurementConsentCheck()) {
    const endpoint = 'https://www.google-analytics.com/collect';
    const payload = {
      'v': '1',
      't': 'event',
      'tid': 'UA-188567387-1',
      'cid': ss.getId(),
      'ec': data.category,
      'ea': data.action,
      'el': data.label
    };
    const options = {
      'method': 'post',
      'payload': payload
    };
    UrlFetchApp.fetch(endpoint, options);
  }
}