/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

let cachedUserProfile = null;
let fetchPromise = null;

const getUserProfile = async () => {
  if (cachedUserProfile) return cachedUserProfile;

  if (!fetchPromise) {
    fetchPromise = (async () => {
      try {
        const response = await fetch('https://admin.hlx.page/status/aemdemos/aem-cloud-migration-tracker/main/index.html');
        if (response.ok) {
          const data = await response.json();
          cachedUserProfile = data.profile;
          return cachedUserProfile;
        }
        return null;
      } catch (e) {
        return null;
      } finally {
        fetchPromise = null; // Reset fetchPromise after completion
      }
    })();
  }

  return fetchPromise;
};

export default getUserProfile;
