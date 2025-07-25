/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './discover_chart_container.scss';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { ExploreServices } from '../../types';
import { useOpenSearchDashboards } from '../../../../opensearch_dashboards_react/public';
import { DiscoverChart } from './chart';
import { useDatasetContext } from '../../application/context/dataset_context/dataset_context';
import {
  histogramResultsProcessor,
  defaultPrepareQueryString,
} from '../../application/utils/state_management/actions/query_actions';
import { RootState } from '../../application/utils/state_management/store';
import { selectShowHistogram } from '../../application/utils/state_management/selectors';
import { CanvasPanel } from '../panel/canvas_panel';
import { Chart } from './utils';

export const DiscoverChartContainer = () => {
  const { services } = useOpenSearchDashboards<ExploreServices>();
  const { uiSettings, data } = services;

  const { interval } = useSelector((state: RootState) => state.legacy);
  const query = useSelector((state: RootState) => state.query);
  const results = useSelector((state: RootState) => state.results);
  const showHistogram = useSelector(selectShowHistogram);

  // Use default cache key computation for histogram data
  const cacheKey = useMemo(() => {
    return defaultPrepareQueryString(query);
  }, [query]);

  const rawResults = cacheKey ? results[cacheKey] : null;

  // Get dataset from centralized context
  const { dataset } = useDatasetContext();

  const isTimeBased = useMemo(() => {
    return dataset ? dataset.isTimeBased() : false;
  }, [dataset]);

  // Process raw results to get chart data
  const processedResults = useMemo(() => {
    if (!rawResults || !dataset) {
      return null;
    }

    // Use defaultResultsProcessor with histogram enabled
    const processed = histogramResultsProcessor(rawResults, dataset, data, interval);
    return processed;
  }, [rawResults, dataset, data, interval]);

  if (!isTimeBased) {
    return null;
  }

  // Return null if no processed results or no chart data
  if (!processedResults || !processedResults.chartData || !processedResults.hits.total) {
    return null;
  }

  return (
    <CanvasPanel className="explore-chart-panel">
      <div className="dscCanvas__chart">
        <DiscoverChart
          bucketInterval={processedResults.bucketInterval}
          chartData={processedResults.chartData as Chart}
          config={uiSettings}
          data={data}
          services={services}
          showHistogram={showHistogram}
        />
      </div>
    </CanvasPanel>
  );
};
