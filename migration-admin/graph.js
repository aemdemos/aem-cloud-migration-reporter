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

/**
 * Generic function to create a bar graph with day ranges on X-axis
 * @param {Object} config - Configuration object
 * @param {Array} config.migrations - Array of migration data
 * @param {string} config.title - Graph title
 * @param {string} config.barColor - Bar color (hex)
 * @param {Function} config.calculateData - Function to calculate bar data from migrations
 * @returns {HTMLElement} - The graph container element
 */
function createBarGraph(config) {
  const {
    migrations, title, barColor, calculateData,
  } = config;

  const container = document.createElement('div');
  container.className = 'graph-container';

  // Calculate data based on provided function
  const { dataPoints, maxCount } = calculateData(migrations);

  if (dataPoints.length === 0) {
    container.innerHTML = '<p class="no-data">No ingestion data available</p>';
    return container;
  }

  // Graph dimensions
  const width = 800;
  const height = 300;
  const padding = {
    top: 30, right: 30, bottom: 50, left: 60,
  };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('class', 'graph-svg');

  // Create title
  const titleElement = document.createElement('h3');
  titleElement.className = 'graph-title';
  titleElement.textContent = title;

  // Create grid lines
  const gridGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  gridGroup.setAttribute('class', 'grid-lines');
  const ySteps = 5;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= ySteps; i++) {
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + (graphHeight * i / ySteps);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', String(padding.left));
    line.setAttribute('y1', String(y));
    line.setAttribute('x2', String(padding.left + graphWidth));
    line.setAttribute('y2', String(y));
    line.setAttribute('stroke', '#e5e7eb');
    line.setAttribute('stroke-width', '1');
    gridGroup.appendChild(line);
  }
  svg.appendChild(gridGroup);

  // Create bars - one for each day range
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];
  const barWidth = (graphWidth / dayRanges.length) * 0.8;
  const barSpacing = (graphWidth / dayRanges.length) * 0.2;

  dataPoints.forEach((point, index) => {
    // eslint-disable-next-line no-mixed-operators
    const x = padding.left + (index * graphWidth / dayRanges.length) + (barSpacing / 2);
    // eslint-disable-next-line no-mixed-operators
    const barHeight = (point.count / maxCount * graphHeight);
    const y = padding.top + graphHeight - barHeight;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', String(x));
    rect.setAttribute('y', String(y));
    rect.setAttribute('width', String(barWidth));
    rect.setAttribute('height', String(barHeight));
    rect.setAttribute('fill', barColor);
    rect.setAttribute('opacity', '0.8');
    rect.setAttribute('rx', '4');
    rect.setAttribute('class', 'data-bar');

    rect.innerHTML = `<title>${point.tooltip}</title>`;

    svg.appendChild(rect);
  });

  // Y-axis labels - counts
  const yAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  yAxisGroup.setAttribute('class', 'y-axis');
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i <= ySteps; i++) {
    // eslint-disable-next-line no-mixed-operators
    const value = Math.round(maxCount - (maxCount * i / ySteps));
    // eslint-disable-next-line no-mixed-operators
    const y = padding.top + (graphHeight * i / ySteps);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(padding.left - 10));
    text.setAttribute('y', String(y + 5));
    text.setAttribute('text-anchor', 'end');
    text.setAttribute('class', 'axis-label');
    text.textContent = String(value);
    yAxisGroup.appendChild(text);
  }
  svg.appendChild(yAxisGroup);

  // X-axis labels - day ranges
  const xAxisGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  xAxisGroup.setAttribute('class', 'x-axis');

  dayRanges.forEach((range, index) => {
    // eslint-disable-next-line no-mixed-operators
    const x = padding.left + (index * graphWidth / dayRanges.length)
      + (graphWidth / dayRanges.length / 2);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('x', String(x));
    text.setAttribute('y', String(height - padding.bottom + 20));
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('class', 'axis-label');
    text.textContent = range;
    xAxisGroup.appendChild(text);
  });

  svg.appendChild(xAxisGroup);

  // Y-axis label
  const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  yAxisLabel.setAttribute('x', String(-height / 2));
  yAxisLabel.setAttribute('y', String(20));
  yAxisLabel.setAttribute('transform', 'rotate(-90)');
  yAxisLabel.setAttribute('text-anchor', 'middle');
  yAxisLabel.setAttribute('class', 'axis-title');
  yAxisLabel.textContent = 'Count';
  svg.appendChild(yAxisLabel);

  // X-axis label
  const xAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  xAxisLabel.setAttribute('x', String(padding.left + graphWidth / 2));
  xAxisLabel.setAttribute('y', String(height - 5));
  xAxisLabel.setAttribute('text-anchor', 'middle');
  xAxisLabel.setAttribute('class', 'axis-title');
  xAxisLabel.textContent = 'Days';
  svg.appendChild(xAxisLabel);

  // Assemble container
  container.appendChild(titleElement);
  container.appendChild(svg);
  return container;
}

/**
 * Creates a bar graph showing customers running migrations.
 */
export function createCustomersGraph(migrations) {
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  return createBarGraph({
    migrations,
    title: 'Customers Running Ingestions Last 60 Days',
    barColor: '#3b82f6',
    calculateData: (migs) => {
      const now = Date.now();
      const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

      // Filter migrations with ingestionStartDates
      const validMigrations = migs.filter(
        (m) => m.ingestionStartDates && Array.isArray(m.ingestionStartDates),
      );

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Count unique customers per day range
      const customersPerRange = {
        '1-10': new Set(),
        '11-20': new Set(),
        '21-30': new Set(),
        '31-40': new Set(),
        '41-50': new Set(),
        '51-60': new Set(),
      };

      validMigrations.forEach((migration) => {
        migration.ingestionStartDates.forEach((timestamp) => {
          // Only count ingestions in the last 60 days
          if (timestamp >= sixtyDaysAgo && timestamp <= now) {
            const daysAgo = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));

            if (daysAgo >= 0 && daysAgo < 10) {
              customersPerRange['1-10'].add(migration.customerName);
            } else if (daysAgo >= 10 && daysAgo < 20) {
              customersPerRange['11-20'].add(migration.customerName);
            } else if (daysAgo >= 20 && daysAgo < 30) {
              customersPerRange['21-30'].add(migration.customerName);
            } else if (daysAgo >= 30 && daysAgo < 40) {
              customersPerRange['31-40'].add(migration.customerName);
            } else if (daysAgo >= 40 && daysAgo < 50) {
              customersPerRange['41-50'].add(migration.customerName);
            } else if (daysAgo >= 50 && daysAgo < 60) {
              customersPerRange['51-60'].add(migration.customerName);
            }
          }
        });
      });

      // Convert Sets to counts and create data points
      const rangeCounts = {};
      dayRanges.forEach((range) => {
        rangeCounts[range] = customersPerRange[range].size;
      });

      const maxCount = Math.max(...Object.values(rangeCounts));

      // Create distributed data
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(rangeCounts[range]),
        tooltip: `${range} days: ${rangeCounts[range].toLocaleString()} customers`,
      }));

      return { dataPoints: distributedData, maxCount: maxCount || 1 };
    },
  });
}

/**
 * Creates a bar graph showing number of ingestions.
 */
export function createIngestionsGraph(migrations) {
  const dayRanges = ['1-10', '11-20', '21-30', '31-40', '41-50', '51-60'];

  return createBarGraph({
    migrations,
    title: 'Number of Ingestions Last 60 Days',
    barColor: '#10b981',
    calculateData: (migs) => {
      const now = Date.now();
      const sixtyDaysAgo = now - (60 * 24 * 60 * 60 * 1000);

      // Filter migrations with ingestionStartDates
      const validMigrations = migs.filter(
        (m) => m.ingestionStartDates && Array.isArray(m.ingestionStartDates),
      );

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Initialize counts for each day range
      const rangeCounts = {
        '1-10': 0,
        '11-20': 0,
        '21-30': 0,
        '31-40': 0,
        '41-50': 0,
        '51-60': 0,
      };

      // Count ingestions per day range
      validMigrations.forEach((migration) => {
        migration.ingestionStartDates.forEach((timestamp) => {
          // Only count ingestions in the last 60 days
          if (timestamp >= sixtyDaysAgo && timestamp <= now) {
            const daysAgo = Math.floor((now - timestamp) / (24 * 60 * 60 * 1000));

            if (daysAgo >= 0 && daysAgo < 10) {
              rangeCounts['1-10'] += 1;
            } else if (daysAgo >= 10 && daysAgo < 20) {
              rangeCounts['11-20'] += 1;
            } else if (daysAgo >= 20 && daysAgo < 30) {
              rangeCounts['21-30'] += 1;
            } else if (daysAgo >= 30 && daysAgo < 40) {
              rangeCounts['31-40'] += 1;
            } else if (daysAgo >= 40 && daysAgo < 50) {
              rangeCounts['41-50'] += 1;
            } else if (daysAgo >= 50 && daysAgo < 60) {
              rangeCounts['51-60'] += 1;
            }
          }
        });
      });

      const maxCount = Math.max(...Object.values(rangeCounts));

      // Create distributed data
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(rangeCounts[range]),
        tooltip: `${range} days: ${rangeCounts[range].toLocaleString()} ingestions`,
      }));

      return { dataPoints: distributedData, maxCount: maxCount || 1 };
    },
  });
}
