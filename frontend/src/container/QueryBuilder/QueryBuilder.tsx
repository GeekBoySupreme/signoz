import './QueryBuilder.styles.scss';

import { Button, Col, Divider, Row, Tooltip } from 'antd';
import {
	MAX_FORMULAS,
	MAX_QUERIES,
	OPERATORS,
	PANEL_TYPES,
} from 'constants/queryBuilder';
// ** Hooks
import { useQueryBuilder } from 'hooks/queryBuilder/useQueryBuilder';
import { DatabaseZap, Sigma } from 'lucide-react';
// ** Constants
import { memo, useEffect, useMemo, useRef } from 'react';
import { DataSource } from 'types/common/queryBuilder';

// ** Components
import { Formula, Query } from './components';
// ** Types
import { QueryBuilderProps } from './QueryBuilder.interfaces';

export const QueryBuilder = memo(function QueryBuilder({
	config,
	panelType: newPanelType,
	filterConfigs = {},
	queryComponents,
	isListViewPanel = false,
}: QueryBuilderProps): JSX.Element {
	const {
		currentQuery,
		addNewBuilderQuery,
		addNewFormula,
		handleSetConfig,
		panelType,
		initialDataSource,
	} = useQueryBuilder();

	const containerRef = useRef(null);

	const currentDataSource = useMemo(
		() =>
			(config && config.queryVariant === 'static' && config.initialDataSource) ||
			null,
		[config],
	);

	useEffect(() => {
		if (currentDataSource !== initialDataSource || newPanelType !== panelType) {
			if (panelType === PANEL_TYPES.BAR) {
				handleSetConfig(PANEL_TYPES.BAR, DataSource.METRICS);
				return;
			}
			handleSetConfig(newPanelType, currentDataSource);
		}
	}, [
		handleSetConfig,
		panelType,
		initialDataSource,
		currentDataSource,
		newPanelType,
	]);

	const isDisabledQueryButton = useMemo(
		() => currentQuery.builder.queryData.length >= MAX_QUERIES,
		[currentQuery],
	);

	const isDisabledFormulaButton = useMemo(
		() => currentQuery.builder.queryFormulas.length >= MAX_FORMULAS,
		[currentQuery],
	);

	const isAvailableToDisableQuery = useMemo(
		() =>
			currentQuery.builder.queryData.length > 0 ||
			currentQuery.builder.queryFormulas.length > 0,
		[currentQuery],
	);

	const handleScrollIntoView = (
		entityType: string,
		entityName: string,
	): void => {
		const selectedEntity = document.getElementById(
			`qb-${entityType}-${entityName}`,
		);

		if (selectedEntity) {
			selectedEntity.scrollIntoView({
				behavior: 'smooth',
				block: 'start',
				inline: 'nearest',
			});
		}
	};

	const listViewLogFilterConfigs: QueryBuilderProps['filterConfigs'] = useMemo(() => {
		const config: QueryBuilderProps['filterConfigs'] = {
			stepInterval: { isHidden: true, isDisabled: true },
			having: { isHidden: true, isDisabled: true },
			filters: {
				customKey: 'body',
				customOp: OPERATORS.CONTAINS,
			},
		};

		return config;
	}, []);

	const listViewTracesFilterConfigs: QueryBuilderProps['filterConfigs'] = useMemo(() => {
		const config: QueryBuilderProps['filterConfigs'] = {
			stepInterval: { isHidden: true, isDisabled: true },
			having: { isHidden: true, isDisabled: true },
			limit: { isHidden: true, isDisabled: true },
			filters: {
				customKey: 'body',
				customOp: OPERATORS.CONTAINS,
			},
		};

		return config;
	}, []);

	return (
		<Row
			style={{ width: '100%' }}
			gutter={[0, 20]}
			justify="start"
			className="query-builder-container"
		>
			{!isListViewPanel && (
				<div className="new-query-formula-buttons-container">
					<Button.Group>
						<Tooltip title="Add Query">
							<Button disabled={isDisabledQueryButton} onClick={addNewBuilderQuery}>
								<DatabaseZap size={12} />
							</Button>
						</Tooltip>

						<Tooltip title="Add Formula">
							<Button disabled={isDisabledFormulaButton} onClick={addNewFormula}>
								<Sigma size={12} />
							</Button>
						</Tooltip>
					</Button.Group>
				</div>
			)}

			<Col span={23} className="qb-entities-list">
				<Row>
					<Col span={1} className="query-builder-left-col">
						{' '}
					</Col>

					<Col span={23} className="query-builder">
						<Row
							gutter={[0, 16]}
							className="query-builder-queries-formula-container"
							ref={containerRef}
						>
							{panelType === PANEL_TYPES.LIST && isListViewPanel && (
								<Query
									index={0}
									isAvailableToDisable={isAvailableToDisableQuery}
									queryVariant="dropdown"
									query={currentQuery.builder.queryData[0]}
									filterConfigs={
										currentQuery.builder.queryData[0].dataSource === DataSource.TRACES
											? listViewTracesFilterConfigs
											: listViewLogFilterConfigs
									}
									queryComponents={queryComponents}
									isListViewPanel
								/>
							)}
							{!isListViewPanel &&
								currentQuery.builder.queryData.map((query, index) => (
									<Col
										key={query.queryName}
										span={24}
										className="query"
										id={`qb-query-${query.queryName}`}
									>
										<Query
											index={index}
											isAvailableToDisable={isAvailableToDisableQuery}
											queryVariant={config?.queryVariant || 'dropdown'}
											query={query}
											filterConfigs={filterConfigs}
											queryComponents={queryComponents}
										/>
									</Col>
								))}
							{!isListViewPanel &&
								currentQuery.builder.queryFormulas.map((formula, index) => {
									const isAllMetricDataSource = currentQuery.builder.queryData.every(
										(query) => query.dataSource === DataSource.METRICS,
									);

									const query =
										currentQuery.builder.queryData[index] ||
										currentQuery.builder.queryData[0];

									return (
										<Col
											key={formula.queryName}
											span={24}
											className="formula"
											id={`qb-formula-${formula.queryName}`}
										>
											<Formula
												filterConfigs={filterConfigs}
												query={query}
												isAdditionalFilterEnable={isAllMetricDataSource}
												formula={formula}
												index={index}
											/>
										</Col>
									);
								})}
						</Row>

						<Col span={24} className="divider">
							<Divider />
						</Col>
					</Col>
				</Row>
			</Col>

			{!isListViewPanel && (
				<Col span={1} className="query-builder-mini-map">
					{currentQuery.builder.queryData.map((query) => (
						<Button
							disabled={isDisabledQueryButton}
							className="query-btn"
							key={query.queryName}
							onClick={(): void => handleScrollIntoView('query', query.queryName)}
						>
							{query.queryName}
						</Button>
					))}

					{currentQuery.builder.queryFormulas.map((formula) => (
						<Button
							disabled={isDisabledFormulaButton}
							className="formula-btn"
							key={formula.queryName}
							onClick={(): void => handleScrollIntoView('formula', formula.queryName)}
						>
							{formula.queryName}
						</Button>
					))}
				</Col>
			)}
		</Row>
	);
});
