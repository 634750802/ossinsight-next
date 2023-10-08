import type { EChartsOption } from 'echarts';
import type * as colors from 'tailwindcss/colors';

export interface WidgetBaseContext<P extends Record<string, any> = Record<string, any>> {
  runtime: 'server' | 'client';
  parameters: P;

  getTimeParams (): { zone: string, period: string };
}

export interface LinkedDataContext {
  getRepo (id: number): { id: number, fullName: string } | undefined;

  getUser (id: number): { id: number, login: string } | undefined;

  getCollection (id: number): { id: number, name: string, public: boolean } | undefined;

  getOrg (id: number): { id: number, login: string } | undefined;
}

export interface VisualizationContext {
  /**
   * The container ***LOGICAL*** width when executing the visualization function.
   */
  width: number;

  /**
   * The container ***LOGICAL*** height when executing the visualization function.
   */
  height: number;

  /**
   * The rendering target's device pixel ratio.
   */
  dpr: number;

  theme: {
    colors: typeof colors
    colorScheme: string
    echartsColorPalette: string[]
  };
}

export interface WidgetVisualizerContext<P extends Record<string, any> = Record<string, any>> extends WidgetBaseContext<P>, LinkedDataContext, VisualizationContext {
}

export interface WidgetMetadataContext<P extends Record<string, any> = Record<string, any>> extends WidgetBaseContext<P>, LinkedDataContext {
}

export type EChartsVisualizationConfig = EChartsOption;

export type WidgetComposeItem = {
  widget: string
  parameters: Record<string, any>
  data: any

  // These sizes should be ***LOGICAL*** value not real value
  left: number
  top: number
  width: number
  height: number
}

export type ComposeVisualizationConfig = WidgetComposeItem[]

export type VisualizeFunction<R, D, P> = (data: D, ctx: WidgetVisualizerContext<P>) => R

export interface WidgetMeta {
  name: string;
  description?: string;
  private?: boolean;
  version: string;
  keywords?: string[];
  author?: string | Partial<{ email: string, name: string, url: string }>;
}

export interface VisualizerModule<Type extends string, VisualizationResult, Data, Params, VisualizerInstance = any> {
  type: Type;
  default: VisualizeFunction<VisualizationResult, Data, Params>;

  /**
   *
   * @param instance instance of visualizer provider. like 'EChartsInstance'
   * @param result last result generated by visualization function
   * @param width new container width
   * @param height new container height
   */
  onSizeChange?: (instance: VisualizerInstance, result: VisualizationResult, width: number, height: number) => void;

  /**
   *
   * @param instance instance of visualizer provider. like 'EChartsInstance'
   * @param result last result generated by visualization function
   * @param colorScheme new color scheme
   */
  onColorSchemeChange?: (instance: VisualizerInstance, result: VisualizationResult, colorScheme: 'light' | 'dark') => void;

  computeDynamicHeight?: (data: Data) => number;

  width?: number;
  height?: number;
}

declare const SYMBOL_FOR_TYPING: unique symbol;

export interface BaseParameterDefinition<T> {
  [SYMBOL_FOR_TYPING]?: T;
  type: string;
  title?: string;
  array?: boolean;
  description?: string;
  required: boolean;
  default?: unknown;
}

export interface RepoIdParameterDefinition extends BaseParameterDefinition<number> {
  type: 'repo-id';
  orgParamName?: string;
}

export interface UserIdParameterDefinition extends BaseParameterDefinition<number> {
  type: 'user-id';
}

export interface OrgIdParameterDefinition extends BaseParameterDefinition<number> {
  type: 'owner-id';
}

export interface CollectionIdParameterDefinition extends BaseParameterDefinition<number> {
  type: 'collection-id';
}

export interface TimePeriodParameterDefinition extends BaseParameterDefinition<string> {
  type: 'time-period';
  enums?: string[];
}

export interface TimeZoneParameterDefinition extends BaseParameterDefinition<string> {
  type: 'time-zone';
}

export interface ActivityTypeParameterDefinition extends BaseParameterDefinition<string> {
  type: 'activity-type';
  enums?: string[];
}

export interface EventTypeParameterDefinition extends BaseParameterDefinition<string> {
  type: 'event-type';
  enums?: string[];
}

export interface LimitParameterDefinition extends BaseParameterDefinition<number> {
  type: 'limit';
  enums?: string[];
}

export interface DateParameterDefinition extends BaseParameterDefinition<string> {
  type: 'day' | 'month';
  expression?: string;
}

export interface RepoIdsParameterDefinition extends BaseParameterDefinition<number[]> {
  type: 'repo-ids';
}

export type ExtractParameterType<T extends BaseParameterDefinition<any>> = T extends BaseParameterDefinition<infer E> ? E : never;

export type ParameterDefinition = ParameterDefinitionMap[keyof ParameterDefinitionMap];

export interface ParameterDefinitionMap {
  'repo-id': RepoIdParameterDefinition;
  'user-id': UserIdParameterDefinition;
  'owner-id': OrgIdParameterDefinition;
  'collection-id': CollectionIdParameterDefinition;
  'time-zone': TimeZoneParameterDefinition;
  'time-period': TimePeriodParameterDefinition;
  'activity-type': ActivityTypeParameterDefinition;
  'event-type': EventTypeParameterDefinition;
  'limit': LimitParameterDefinition;
  'day': DateParameterDefinition;
  'month': DateParameterDefinition;
  'repo-ids': RepoIdsParameterDefinition;
}

export type ParameterDefinitions = Record<string, ParameterDefinition>;

export type MetadataGenerator<P> = (ctx: WidgetMetadataContext<P>) => Partial<{ title: string, description: string, keywords: [] }>
