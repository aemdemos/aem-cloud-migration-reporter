import { sortTable } from './utils.js';
import { TABLE_CONFIG, CSS_CLASSES, ELEMENT_IDS } from './constants.js';

class MigrationsTable {
  constructor() {
    this.sortDirection = TABLE_CONFIG.DEFAULT_SORT_DIRECTION;
    this.isSortingEnabled = false;
    this.migrationsContainer = document.getElementById(ELEMENT_IDS.MIGRATIONS_CONTAINER);
  }

  static createCell(content, className = '') {
    const td = document.createElement('td');
    if (className) td.className = className;
    td.textContent = content;
    return td;
  }

  renderTable(migrations) {
    const tbody = this.migrationsContainer.querySelector('tbody');
    tbody.innerHTML = '';

    const formatDate = (timestamp) => {
      if (!timestamp) return '-';
      const date = new Date(timestamp);
      const options = {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'UTC', // ensures UTC time
      };
      return date.toLocaleString(undefined, options) + ' UTC';
    };


    migrations.forEach((migration) => {
      const tr = document.createElement('tr');
      tr.classList.add(CSS_CLASSES.TABLE.MIGRATION_ROW);
      tr.classList.add(CSS_CLASSES.TABLE.MIGRATION_ROW);
      tr.setAttribute('data-migration-id', migration.id || '');
      tr.setAttribute('data-ims-org-id', migration.imsOrgId || '');

      const customerNameCell = MigrationsTable.createCell(migration.customerName || '');
      const lastBpaCell = MigrationsTable.createCell(formatDate(migration.bpaReportUploaded), 'date');
      const totalCell = MigrationsTable.createCell(migration.totalIngestions ?? '-', 'numeric');
      const failedCell = MigrationsTable.createCell(migration.failedIngestions ?? '-', 'numeric');
      const lastCell = MigrationsTable.createCell(formatDate(migration.lastIngestion), 'date');

      tr.append(customerNameCell, lastBpaCell, totalCell, failedCell, lastCell);
      tbody.appendChild(tr);
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

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
          CSS_CLASSES.TABLE.SORTED_DESC
        ));

        // Sort data
        const sortedData = sortTable(migrations, columnKey, newDirection);

        // Add arrow class
        header.classList.add(
          newDirection === 'asc'
            ? CSS_CLASSES.TABLE.SORTED_ASC
            : CSS_CLASSES.TABLE.SORTED_DESC
        );

        this.renderTable(sortedData);
        this.sortDirection = newDirection;
      });
    });
  }

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
          <th data-sort="${TABLE_CONFIG.COLUMNS.TOTAL}">Total Ingestions</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.FAILED}">Failed Ingestions</th>
          <th data-sort="${TABLE_CONFIG.COLUMNS.LAST_INGESTION}">Last Ingestion Started</th>
        </tr>
      </thead>
    `;

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    this.addSortingToTable(table, migrations);
    this.migrationsContainer.appendChild(table);

    // Initial sort
    const sortedMigrations = sortTable(migrations, TABLE_CONFIG.DEFAULT_SORT_COLUMN, this.sortDirection);
    document.querySelector(`th[data-sort="${TABLE_CONFIG.DEFAULT_SORT_COLUMN}"]`)
    .classList.add(CSS_CLASSES.TABLE.SORTED_ASC);

    this.renderTable(sortedMigrations);
  }

  enableSorting() {
    this.isSortingEnabled = true;
  }
}

export default MigrationsTable;
