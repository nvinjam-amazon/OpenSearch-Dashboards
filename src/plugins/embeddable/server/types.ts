/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 *
 * Any modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import {
  PersistableState,
  PersistableStateDefinition,
  SerializableState,
} from '../../opensearch_dashboards_utils/common';
import { EmbeddableInput } from '../common/types';

export type EmbeddableFactoryRegistry = Map<string, EmbeddableRegistryItem>;
export type EnhancementsRegistry = Map<string, EnhancementRegistryItem>;

export interface EnhancementRegistryDefinition<P extends SerializableState = SerializableState>
  extends PersistableStateDefinition<P> {
  id: string;
}

export interface EnhancementRegistryItem<P extends SerializableState = SerializableState>
  extends PersistableState<P> {
  id: string;
}

export interface EmbeddableRegistryDefinition<P extends EmbeddableInput = EmbeddableInput>
  // @ts-expect-error TS2344 TODO(ts-error): fixme
  extends PersistableStateDefinition<P> {
  id: string;
}

export interface EmbeddableRegistryItem<P extends EmbeddableInput = EmbeddableInput>
  // @ts-expect-error TS2344 TODO(ts-error): fixme
  extends PersistableState<P> {
  id: string;
}
