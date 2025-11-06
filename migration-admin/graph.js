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
      // Filter migrations with valid last ingestion dates
      const validMigrations = migs.filter((m) => m.lastIngestion && m.lastIngestion > 0);

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Group and count customers with ingestions
      const monthGroups = new Map();
      validMigrations.forEach((migration) => {
        const date = new Date(migration.lastIngestion);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        monthGroups.set(monthKey, (monthGroups.get(monthKey) || 0) + 1);
      });

      const dataPointsArray = Array.from(monthGroups.entries())
        .map(([, total]) => total)
        .sort((a, b) => b - a);

      const totalCount = dataPointsArray.length > 0 ? dataPointsArray[0] : 0;
      const maxCount = Number(totalCount);

      // Distribute count across day ranges (sample data)
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(totalCount / dayRanges.length),
        tooltip: `${range} days: ${Math.round(totalCount / dayRanges.length).toLocaleString()} customers`,
      }));

      return { dataPoints: distributedData, maxCount };
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
      // Filter migrations with valid last ingestion dates and total ingestion counts
      const validMigrations = migs.filter(
        (m) => m.lastIngestion && m.lastIngestion > 0 && m.totalIngestions,
      );

      if (validMigrations.length === 0) {
        return { dataPoints: [], maxCount: 0 };
      }

      // Group by month and sum total ingestions
      const monthGroups = new Map();
      validMigrations.forEach((migration) => {
        const date = new Date(migration.lastIngestion);
        const monthKey = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
        const currentTotal = monthGroups.get(monthKey) || 0;
        monthGroups.set(monthKey, currentTotal + (Number(migration.totalIngestions) || 0));
      });

      const dataPointsArray = Array.from(monthGroups.entries())
        .map(([, total]) => total)
        .sort((a, b) => b - a);

      const totalCount = dataPointsArray.length > 0 ? dataPointsArray[0] : 0;
      const maxCount = Number(totalCount);

      // Distribute count across day ranges (sample data)
      const distributedData = dayRanges.map((range) => ({
        range,
        count: Number(totalCount / dayRanges.length),
        tooltip: `${range} days: ${Math.round(totalCount / dayRanges.length).toLocaleString()} total ingestions`,
      }));

      return { dataPoints: distributedData, maxCount };
    },
  });
}
