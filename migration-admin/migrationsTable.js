/**
 * Migrations table component - handles rendering and sorting of migration data
 * @module migrationsTable
 */

import { TABLE_CONFIG, CSS_CLASSES, ELEMENT_IDS } from './constants.js';

/**
 * Sorts table data by specified column and direction
 * @param {Array<Object>} data - Array of migration objects to sort
 * @param {string} columnKey - The key/property to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array<Object>} Sorted array of migrations
 */
function sortTable(data, columnKey, direction) {
  return [...data].sort((a, b) => {
    let aVal = a[columnKey];
    let bVal = b[columnKey];

    // Handle null/undefined values
    if (aVal == null) aVal = '';
    if (bVal == null) bVal = '';

    // Compare based on type
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return direction === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    // Numeric comparison
    return direction === 'asc' ? aVal - bVal : bVal - aVal;
  });
}

/**
 * MigrationsTable class - manages the display and interaction of migration data in a table
 * @class
 */
class MigrationsTable {
  /**
   * Creates a new MigrationsTable instance
   * @constructor
   */
  constructor() {
    /** @type {string} Current sort direction */
    this.sortDirection = TABLE_CONFIG.DEFAULT_SORT_DIRECTION;
    /** @type {boolean} Whether sorting is currently enabled */
    this.isSortingEnabled = false;
    /** @type {HTMLElement|null} Container element for the migrations table */
    this.migrationsContainer = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
  }

  /**
   * Creates a table cell element with optional class name
   * @static
   * @param {string|number} content - Cell content to display
   * @param {string} [className=''] - Optional CSS class name
   * @returns {HTMLTableCellElement} The created table cell
   */
  static createCell(content, className = '') {
    const td = document.createElement('td');
    if (className) td.className = className;
    td.textContent = content;
    return td;
  }

  /**
   * Renders the table with migration data
   * @param {Array<Object>} migrations - Array of migration objects to display
   */
  renderTable(migrations) {
    const tbody = this.migrationsContainer.querySelector('tbody');
    tbody.innerHTML = '';

    /**
     * Formats a timestamp for display in the table
     * @param {number} timestamp - Unix timestamp in milliseconds
     * @param {boolean} [includeTime=false] - Whether to include time in formatted output
     * @returns {string} Formatted date string or '-' if no timestamp
     */
    const formatDate = (timestamp, includeTime = false) => {
      if (!timestamp) return '-';
      const date = new Date(timestamp);

      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      };

      if (includeTime) {
        Object.assign(options, {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }

      const formatted = date.toLocaleString(undefined, options);
      return includeTime ? `${formatted} UTC` : formatted;
    };

    migrations.forEach((migration) => {
      const tr = document.createElement('tr');
      tr.classList.add(CSS_CLASSES.TABLE.MIGRATION_ROW);
      tr.classList.add(CSS_CLASSES.TABLE.MIGRATION_ROW);
      tr.setAttribute('data-migration-id', migration.id || '');
      tr.setAttribute('data-ims-org-id', migration.imsOrgId || '');

      const customerNameCell = document.createElement('td');
      customerNameCell.className = 'string';

      if (migration.imsOrgId && migration.customerName) {
        const link = document.createElement('a');
        link.href = `https://aemcs-workspace.adobe.com/customer/tenant/${migration.imsOrgId}`;
        link.textContent = migration.customerName;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        customerNameCell.appendChild(link);
      } else {
        customerNameCell.textContent = migration.customerName ?? '-';
      }


      const lastBpaCell = MigrationsTable.createCell(formatDate(migration.bpaReportUploaded), 'date');
      const totalProjectsCell = MigrationsTable.createCell(migration.totalProjects ?? '-', 'numeric');
      const firstCell = MigrationsTable.createCell(formatDate(migration.firstIngestion), 'date');
      const lastCell = MigrationsTable.createCell(formatDate(migration.lastIngestion), 'date');
      const totalCell = MigrationsTable.createCell(migration.totalIngestions ?? '-', 'numeric');
      const failedCell = MigrationsTable.createCell(migration.failedIngestions ?? '-', 'numeric');

      tr.append(
        customerNameCell,
        lastBpaCell,
        totalProjectsCell,
        firstCell,
        lastCell,
        totalCell,
        failedCell,
      );
      tbody.appendChild(tr);
    });
  }

  /**
   * Adds sorting functionality to table headers
   * @param {HTMLTableElement} table - The table element
   * @param {Array<Object>} migrations - Array of migration data
   */
  addSortingToTable(table, migrations) {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        if (!this.isSortingEnabled) return;

        const columnKey = header.getAttribute('data-sort');

        // Determine new sort direction BEFORE removing classes
        let newDirection = 'asc';
        if (header.classList.contains(CSS_CLASSES.TABLE.SORTED_ASC)) newDirection = 'desc';

        // Remove sort classes from all headers
        headers.forEach((h) => h.classList.remove(
          CSS_CLASSES.TABLE.SORTED_ASC,
          CSS_CLASSES.TABLE.SORTED_DESC,
        ));

        // Sort data
        const sortedData = sortTable(migrations, columnKey, newDirection);

        // Add arrow class
        header.classList.add(
          newDirection === 'asc'
            ? CSS_CLASSES.TABLE.SORTED_ASC
            : CSS_CLASSES.TABLE.SORTED_DESC,
        );

        this.renderTable(sortedData);
        this.sortDirection = newDirection;
      });
    });
  }

  /**
   * Initializes the table with migration data and default sorting
   * @param {Array<Object>} migrations - Array of migration objects
   */
  initTable(migrations) {
    this.migrationsContainer.innerHTML = '';

    const summaryWrapper = document.createElement('div');
    summaryWrapper.classList.add('table-summary-wrapper');
    this.migrationsContainer.appendChild(summaryWrapper);

    const table = document.createElement('table');
    table.classList.add(CSS_CLASSES.TABLE.STYLED_TABLE);

    table.innerHTML = `
      <thead>
        <tr>
          <th data-sort="${TABLE_CONFIG.COLUMNS.NAME}">Customer Name</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.LAST_BPA_UPLOAD}">Last BPA Upload</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.TOTAL_PROJECTS}">Total Projects</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.FIRST_INGESTION}">First Ingestion</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.LAST_INGESTION}">Latest Ingestion</th>
          <th id="total-ingestions-header" data-sort="${TABLE_CONFIG.COLUMNS.TOTAL_INGESTIONS}">Total Ingestions</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.FAILED_INGESTIONS}">Failed Ingestions</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this.addSortingToTable(table, migrations);
    this.migrationsContainer.appendChild(table);

    // Initial sort
    const sortedMigrations = sortTable(
      migrations,
      TABLE_CONFIG.DEFAULT_SORT_COLUMN,
      this.sortDirection,
    );
    document.querySelector(`th[data-sort="${TABLE_CONFIG.DEFAULT_SORT_COLUMN}"]`)
      .classList.add(CSS_CLASSES.TABLE.SORTED_ASC);

    this.renderTable(sortedMigrations);
  }

  /**
   * Enables sorting functionality for the table
   */
  enableSorting() {
    this.isSortingEnabled = true;
  }
}

export default MigrationsTable;
