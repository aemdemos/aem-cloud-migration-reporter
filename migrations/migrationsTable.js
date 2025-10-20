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

import {
  sortTable,
} from './utils.js';
import {
  TABLE_CONFIG,
  CSS_CLASSES,
  ELEMENT_IDS,
} from './constants.js';

/**
 * Migrations Table Module
 * Handles rendering and interaction of the migrations table
 */
class MigrationsTable {
  constructor() {
    this.sortDirection = TABLE_CONFIG.DEFAULT_SORT_DIRECTION;
    this.isSortingEnabled = false;
    this.migrationsContainer = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
  }

  /**
     * Creates a table cell with optional CSS class
     * @param {string} content - Cell content
     * @param {string} className - Optional CSS class
     * @returns {HTMLTableCellElement} The created cell
     */
  static createCell(content, className = '') {
    const td = document.createElement('td');
    if (className) td.className = className;
    td.textContent = content;
    return td;
  }

  /**
     * Renders the table body with migration data
     * @param {Array} migrations - Array of migration objects
     */
  renderTable(migrations) {
    const tbody = this.migrationsContainer.querySelector('tbody');
    tbody.innerHTML = '';

    migrations.forEach((migration) => {
      const tr = document.createElement('tr');
      tr.classList.add(CSS_CLASSES.TABLE.MIGRATION_ROW);
      tr.setAttribute('data-migration-id', migration.id);

      // Customer Name
      const tenantCell = MigrationsTable.createCell(migration.tenant || '', '');
      // BPA Report Uploads
      const bpaReportUploadsCell = MigrationsTable.createCell(
        typeof migration.bpaReportUploads === 'number' ? migration.bpaReportUploads.toString() : '',
        '',
      );
      // Total Extractions
      const totalExtractionsCell = MigrationsTable.createCell(
        typeof migration.totalExtractions === 'number' ? migration.totalExtractions.toString() : '',
        '',
      );
      // Total Ingestions
      const totalIngestionsCell = MigrationsTable.createCell(
        typeof migration.totalIngestions === 'number' ? migration.totalIngestions.toString() : '',
        '',
      );
      // First Extraction
      const firstExtractionCell = MigrationsTable.createCell(migration.firstExtraction || '', '');
      // First Ingestion
      const firstIngestionCell = MigrationsTable.createCell(migration.firstIngestion || '', '');
      // Last Extraction
      const lastExtractionCell = MigrationsTable.createCell(migration.lastExtraction || '', '');
      // Last Ingestion
      const lastIngestionCell = MigrationsTable.createCell(migration.lastIngestion || '', '');

      tr.append(
        tenantCell,
        bpaReportUploadsCell,
        totalExtractionsCell,
        totalIngestionsCell,
        firstExtractionCell,
        firstIngestionCell,
        lastExtractionCell,
        lastIngestionCell,
      );
      tbody.appendChild(tr);
    });
  }

  /**
     * Toggles the sort direction between ascending and descending
     */
  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  /**
   * Adds sorting functionality to table headers
   * @param {HTMLTableElement} table - The table element
   * @param migrations
   */
  addSortingToTable(table, migrations) {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        if (!this.isSortingEnabled) return;

        const columnKey = header.getAttribute('data-sort');

        // Determine new sort direction BEFORE removing classes
        let newDirection = 'asc';
        if (header.classList.contains(CSS_CLASSES.TABLE.SORTED_ASC)) {
          newDirection = 'desc';
        }

        // Remove sort classes from all headers
        headers.forEach((h) => h.classList.remove(
          CSS_CLASSES.TABLE.SORTED_ASC,
          CSS_CLASSES.TABLE.SORTED_DESC,
        ));

        // Sort data
        const sortedData = sortTable(migrations, columnKey, newDirection);

        // Add the appropriate arrow class
        header.classList.add(
          newDirection === 'asc'
            ? CSS_CLASSES.TABLE.SORTED_ASC
            : CSS_CLASSES.TABLE.SORTED_DESC,
        );

        this.renderTable(sortedData);
        // Set the new sort direction for next click
        this.sortDirection = newDirection;
      });
    });
  }

  /**
     * Initializes the table with migrations data
     * @param {Array<Object>} migrations - Array of migration objects to display in the table
     */
  initTable(migrations) {
    this.migrationsContainer.innerHTML = '';

    // Create summary wrapper
    const summaryWrapper = document.createElement('div');
    summaryWrapper.classList.add('table-summary-wrapper');

    this.migrationsContainer.appendChild(summaryWrapper);

    // Create table structure
    const table = document.createElement('table');
    table.classList.add(CSS_CLASSES.TABLE.STYLED_TABLE);

    table.innerHTML = `
      <thead>
        <tr>
          <th data-sort="${TABLE_CONFIG.COLUMNS.NAME}">Customer Name</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.BPA_REPORT_UPLOADS}">BPA Report Uploads</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.TOTAL_EXTRACTIONS}">Total Extractions</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.TOTAL_INGESTIONS}">Total Ingestions</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.FIRST_EXTRACTION}">First Extraction</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.FIRST_INGESTION}">First Ingestion</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.LAST_EXTRACTION}">Last Extraction</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.LAST_INGESTION}">Last Ingestion</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this.addSortingToTable(table, migrations);
    this.migrationsContainer.appendChild(table);

    // Apply initial sorting
    const initialSortKey = TABLE_CONFIG.DEFAULT_SORT_COLUMN;
    const sortedMigrations = sortTable(migrations, initialSortKey, this.sortDirection);
    document.querySelector(`th[data-sort="${initialSortKey}"]`).classList.add(CSS_CLASSES.TABLE.SORTED_ASC);
    this.renderTable(sortedMigrations);
    this.toggleSortDirection();

    // Render initial data
    this.renderTable(migrations);
  }

  /**
     * Enables sorting functionality for the table
     */
  enableSorting() {
    this.isSortingEnabled = true;
    // Optionally, visually indicate that sorting is enabled (e.g., by adding a class)
  }
}

export default MigrationsTable;
