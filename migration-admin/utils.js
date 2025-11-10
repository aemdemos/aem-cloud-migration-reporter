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
/* eslint-disable no-underscore-dangle */

const sortTable = (data, key, direction = 'asc', type = 'string') => {
  const dir = direction === 'asc' ? 1 : -1;
  const getValue = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : null), obj);

  return [...data].sort((a, b) => {
    const valA = getValue(a, key);
    const valB = getValue(b, key);

    if (valA == null && valB != null) return 1;
    if (valB == null && valA != null) return -1;
    if (valA == null && valB == null) return 0;

    switch (type) {
      case 'numeric':
        return ((parseFloat(valA) || 0) - (parseFloat(valB) || 0)) * dir;

      case 'date':
        return ((new Date(valA).getTime() || 0) - (new Date(valB).getTime() || 0)) * dir;

      default: // string
        return String(valA).localeCompare(String(valB), undefined, { sensitivity: 'base' }) * dir;
    }
  });
};

export default sortTable;
