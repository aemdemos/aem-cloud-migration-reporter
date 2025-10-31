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

import API_ENDPOINT from './config.js';

export const getLast30DaysIngestions = async () => {
  try {
    const response = await fetch(`${API_ENDPOINT}/ingestionsLast30Days`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Error fetching ingestions:', e);
    return [];
  }
};

export const getBpaReports = async (imsOrgId) => {
  try {
    const url = new URL(`${API_ENDPOINT}/bpaReports`);
    if (imsOrgId) url.searchParams.set('imsOrgId', imsOrgId);

    const response = await fetch(url.toString());
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (e) {
    console.error('Error fetching BPA reports:', e);
    return [];
  }
};

export default { getLast30DaysIngestions, getBpaReports };
