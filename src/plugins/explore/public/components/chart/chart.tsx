/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import './_histogram.scss';

import React, { useCallback, useMemo } from 'react';
import moment from 'moment';
import dateMath from '@elastic/datemath';
import { EuiButtonIcon, EuiFlexGroup, EuiFlexItem, EuiToolTip } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { IUiSettingsClient } from 'opensearch-dashboards/public';
import { useDispatch, useSelector } from 'react-redux';
import { DataPublicPluginStart, search } from '../../../../data/public';
import { TimechartHeader, TimechartHeaderBucketInterval } from './timechart_header';
import { DiscoverHistogram } from './histogram/histogram';
import { ExploreServices } from '../../types';
import { Chart } from './utils';
import {
  setInterval,
  clearResults,
  clearResultsByKey,
  clearQueryStatusMap,
  clearQueryStatusMapByKey,
  setShowHistogram,
} from '../../application/utils/state_management/slices';
import { RootState } from '../../application/utils/state_management/store';
import {
  executeQueries,
  executeHistogramQuery,
  defaultPrepareQueryString,
} from '../../application/utils/state_management/actions/query_actions';

interface DiscoverChartProps {
  bucketInterval?: TimechartHeaderBucketInterval;
  chartData?: Chart;
  config: IUiSettingsClient;
  data: DataPublicPluginStart;
  services: ExploreServices;
  showHistogram: boolean;
}

export const DiscoverChart = ({
  bucketInterval,
  chartData,
  config,
  data,
  services,
  showHistogram,
}: DiscoverChartProps) => {
  const { from, to } = data.query.timefilter.timefilter.getTime();
  const timeRange = useMemo(() => {
    return {
      from: dateMath.parse(from)?.format('YYYY-MM-DDTHH:mm:ss.SSSZ') || '',
      to: dateMath.parse(to, { roundUp: true })?.format('YYYY-MM-DDTHH:mm:ss.SSSZ') || '',
    };
  }, [from, to]);
  const { interval } = useSelector((state: RootState) => state.legacy);
  const query = useSelector((state: RootState) => state.query);
  const dispatch = useDispatch();
  const cacheKey = defaultPrepareQueryString(query);
  const onChangeInterval = (newInterval: string) => {
    dispatch(setInterval(newInterval));
    dispatch(clearResultsByKey(cacheKey));
    dispatch(clearQueryStatusMapByKey(cacheKey));
    dispatch(executeHistogramQuery({ services, cacheKey, interval: newInterval }));
  };
  const timefilterUpdateHandler = useCallback(
    (ranges: { from: number; to: number }) => {
      data.query.timefilter.timefilter.setTime({
        from: moment(ranges.from).toISOString(),
        to: moment(ranges.to).toISOString(),
        mode: 'absolute',
      });
      dispatch(clearResults());
      dispatch(clearQueryStatusMap());
      dispatch(executeQueries({ services }));
    },
    [data, dispatch, services]
  );

  const timeChartHeader = (
    <div className="exploreChart__TimechartHeader" data-test-subj="dscChartTimechartHeader">
      <TimechartHeader
        bucketInterval={bucketInterval}
        dateFormat={config.get('dateFormat')}
        timeRange={timeRange}
        options={search.aggs.intervalOptions}
        onChangeInterval={onChangeInterval}
        stateInterval={interval || ''}
      />
    </div>
  );

  const toggleLabel = i18n.translate('explore.discover.histogram.collapse', {
    defaultMessage: 'Toggle histogram',
  });

  const toggle = (
    <EuiToolTip content={toggleLabel}>
      <EuiButtonIcon
        aria-expanded={showHistogram}
        aria-label={toggleLabel}
        data-test-subj="histogramCollapseBtn"
        onClick={() => dispatch(setShowHistogram(!showHistogram))}
        iconType={showHistogram ? 'arrowDown' : 'arrowRight'}
        iconSize="m"
        color="text"
      />
    </EuiToolTip>
  );

  const queryEnhancedHistogramHeader = (
    <EuiFlexGroup
      direction="row"
      gutterSize="m"
      className="exploreChart__chartheader"
      data-test-subj="dscChartChartheader"
    >
      <EuiFlexItem grow={false}>{toggle}</EuiFlexItem>
      <EuiFlexItem grow={true} style={{ justifyContent: 'flex-start' }}>
        {timeChartHeader}
      </EuiFlexItem>
    </EuiFlexGroup>
  );

  return (
    <EuiFlexGroup
      direction="column"
      gutterSize="none"
      className="exploreChart__wrapper exploreChart__wrapper--enhancement"
      data-test-subj="dscChartWrapper"
    >
      {queryEnhancedHistogramHeader}
      {chartData && showHistogram && (
        <EuiFlexItem grow={false}>
          <section
            aria-label={i18n.translate('explore.discover.histogramOfFoundDocumentsAriaLabel', {
              defaultMessage: 'Histogram of found documents',
            })}
            className="dscTimechart"
            data-test-subj="dscTimechart"
          >
            <div className="exploreHistogram" data-test-subj="discoverChart">
              <DiscoverHistogram
                chartData={chartData}
                timefilterUpdateHandler={timefilterUpdateHandler}
                services={services}
              />
            </div>
          </section>
        </EuiFlexItem>
      )}
    </EuiFlexGroup>
  );
};
