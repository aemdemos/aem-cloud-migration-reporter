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

// Table Configuration
export const TABLE_CONFIG = {
  DEFAULT_SORT_DIRECTION: 'asc',
  DEFAULT_SORT_COLUMN: 'customerName',
  COLUMNS: {
    NAME: 'customerName',
    TOTAL: 'totalIngestions',
    FAILED: 'failedIngestions',
    LAST: 'mostRecent.started',
  }
};

// CSS Classes
export const CSS_CLASSES = {
  TABLE: {
    STYLED_TABLE: 'styled-table',
    SORTED_ASC: 'sorted-asc',
    SORTED_DESC: 'sorted-desc',
    MIGRATION_ROW: 'migration-row',
  },

};

// DOM Element IDs
export const ELEMENT_IDS = {
  MIGRATIONS_CONTAINER: 'migrations-container',
  CUSTOMER_SEARCH: 'customer-search',
  NAME: 'customerName',
  MIGRATION: 'migration',
  MIGRATION_CREATED: 'migration-created',
  BPA_REPORTS_UPLOADED: 'bpa-reports-uploaded',
};
