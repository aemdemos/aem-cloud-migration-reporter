import sortTable from './utils.js';
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

      const customerNameCell = MigrationsTable.createCell(migration.customerName || '');
      const lastBpaCell = MigrationsTable.createCell(formatDate(migration.bpaReportUploaded), 'date');
      const totalProjectsCell = MigrationsTable.createCell(migration.totalProjects ?? '-', 'numeric');
      const firstCell = MigrationsTable.createCell(formatDate(migration.firstIngestion), 'date');
      const lastCell = MigrationsTable.createCell(formatDate(migration.lastIngestion), 'date');
      const totalCell = MigrationsTable.createCell(migration.totalIngestions ?? '-', 'numeric');
      const failedCell = MigrationsTable.createCell(migration.failedIngestions ?? '-', 'numeric');

      tr.append(customerNameCell, lastBpaCell, totalProjectsCell, firstCell, lastCell, totalCell, failedCell);
      tbody.appendChild(tr);
    });
  }

  toggleSortDirection() {
    this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
  }

  addSortingToTable(table) {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        if (!this.isSortingEnabled) return;

        const columnKey = header.getAttribute('data-sort');

        // Determine new direction relative to this header's current arrow class
        const newDirection = header.classList.contains(CSS_CLASSES.TABLE.SORTED_ASC) ? 'desc' : 'asc';

        // Remove sort classes from all headers
        headers.forEach((h) => h.classList.remove(
          CSS_CLASSES.TABLE.SORTED_ASC,
          CSS_CLASSES.TABLE.SORTED_DESC,
        ));

        // Sort using the instance's current data
        const sortedData = sortTable(this.currentMigrations, columnKey, newDirection);

        // Replace the instance data with the newly-sorted array
        this.currentMigrations = sortedData.slice();

        // Add arrow class to clicked header
        header.classList.add(
          newDirection === 'asc'
            ? CSS_CLASSES.TABLE.SORTED_ASC
            : CSS_CLASSES.TABLE.SORTED_DESC,
        );

        // Re-render with sorted data
        this.renderTable(sortedData);
        this.sortDirection = newDirection;
      });
    });
  }

  addSortingToTable(table) {
    const headers = table.querySelectorAll('th[data-sort]');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        if (!this.isSortingEnabled) return;

        const columnKey = header.getAttribute('data-sort');

        // Determine new direction relative to this header's current arrow class
        const newDirection = header.classList.contains(CSS_CLASSES.TABLE.SORTED_ASC) ? 'desc' : 'asc';

        // Remove sort classes from all headers
        headers.forEach((h) => h.classList.remove(
          CSS_CLASSES.TABLE.SORTED_ASC,
          CSS_CLASSES.TABLE.SORTED_DESC,
        ));

        // Sort using the instance's current data
        const sortedData = sortTable(this.currentMigrations, columnKey, newDirection);

        // Replace the instance data with the newly-sorted array
        this.currentMigrations = sortedData.slice();

        // Add arrow class to clicked header
        header.classList.add(
          newDirection === 'asc'
            ? CSS_CLASSES.TABLE.SORTED_ASC
            : CSS_CLASSES.TABLE.SORTED_DESC,
        );

        // Re-render with sorted data
        this.renderTable(sortedData);
        this.sortDirection = newDirection;
      });
    });
  }
  enableSorting() {
    this.isSortingEnabled = true;
  }
}

export default MigrationsTable;
