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
import { DateRange } from './DateRange.js';

export const getCustomerMigrationInfo = async (searchBy, dateRange = DateRange.LAST_1_MONTH.value) => {
  try {
    const url = new URL(`${API_ENDPOINT}/customerMigrationInfo`);
    url.searchParams.set('dateRange', dateRange);

    if (searchBy) {
      url.searchParams.set('searchBy', searchBy);
    }

    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    return await response.json();
  } catch (e) {
    return [];
  }
};

export default { getCustomerMigrationInfo };
