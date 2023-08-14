import type { WidgetComposeItem } from '../../../widgets-types';

export type Spacing =
  [top: number, right: number, bottom: number, left: number]
  | [top: number, horizontal: number, bottom: number]
  | [vertical: number, horizontal: number]
  | number;

export type ResolvedSpacing = {
  top: number
  left: number
  right: number
  bottom: number
}

export interface BaseLayout {
  layout: string;
  padding?: Spacing;
  gap?: number;
  // fixed size on axis, default is flexible (undefined)
  size?: number;
  // like flex-grow, if size not set. default to `1`
  grow?: number;
  children: Layout[];
}

export interface VerticalLayout extends BaseLayout {
  layout: 'vertical';
}

export interface HorizontalLayout extends BaseLayout {
  layout: 'horizontal';
}

export interface WidgetLayout extends BaseLayout {
  layout: 'widget';
  widget: string;
  parameters: Record<string, any>;
  data: any;
}

export type Layout = VerticalLayout | HorizontalLayout | WidgetLayout;

export class LayoutBuilder<L extends Layout> {
  layout: L;

  constructor (layout: L) {
    this.layout = layout;
  }

  fix (size: number) {
    this.layout.size = size;
    this.layout.grow = undefined;
    return this;
  }

  flex (grow: number = 1) {
    this.layout.size = undefined;
    this.layout.grow = grow;
    return this;
  }

  gap (size: number) {
    this.layout.gap = size;
    return this;
  }

  padding (padding: Spacing) {
    this.layout.padding = padding;
    return this;
  }
}

export function vertical (...children: Array<Layout | LayoutBuilder<any>>): LayoutBuilder<VerticalLayout> {
  return new LayoutBuilder({
    layout: 'vertical',
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: children.map(l => l instanceof LayoutBuilder ? l.layout : l),
  });
}

export function horizontal (...children: Array<Layout | LayoutBuilder<any>>): LayoutBuilder<HorizontalLayout> {
  return new LayoutBuilder({
    layout: 'horizontal',
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: children.map(l => l instanceof LayoutBuilder ? l.layout : l),
  });
}

export function widget (name: string, data: any, parameters: Record<string, any>) {
  return new LayoutBuilder({
    layout: 'widget',
    widget: name,
    data,
    parameters,
    padding: 0,
    gap: 0,
    size: undefined,
    grow: undefined,
    children: [],
  });
}

export function computeLayout (input: Layout | LayoutBuilder<any>, left: number, top: number, width: number, height: number): WidgetComposeItem[] {
  const layout: Layout = input instanceof LayoutBuilder ? input.layout : input;
  const padding = resolveSpacing(layout.padding);
  const gap = layout.gap ?? 0;
  switch (layout.layout) {
    case 'widget':
      return [{
        widget: layout.widget,
        left: left + padding.left,
        top: top + padding.top,
        width: width - padding.left - padding.right,
        height: height - padding.top - padding.bottom,
        parameters: layout.parameters,
        data: layout.data,
      }];
    case 'vertical':
    case 'horizontal': {
      let restSize: number;

      if (layout.layout === 'vertical') {
        restSize = height - padding.top - padding.bottom - layout.gap * (layout.children.length - 1);
      } else {
        restSize = width - padding.left - padding.right - layout.gap * (layout.children.length - 1);
      }

      let flexibleChildren: Array<{ index: number, grow: number }> = [];
      for (let i = 0; i < layout.children.length; i++) {
        let child = layout.children[i];
        if (child.size > 0) {
          restSize -= child.size;
        } else {
          flexibleChildren.push({ index: i, grow: child.grow > 0 ? child.grow : 1 });
        }
      }
      if (restSize > 0 && flexibleChildren.length > 0) {
        const sumGrow = flexibleChildren.reduce((sum, item) => sum + (item.grow ?? 1), 0);
        for (let flexibleChild of flexibleChildren) {
          layout.children[flexibleChild.index].size = flexibleChild.grow / sumGrow * restSize;
        }
      } else if (restSize <= 0 && flexibleChildren.length > 0) {
        console.warn('children have no enough space.');
        for (let flexibleChild of flexibleChildren) {
          layout.children[flexibleChild.index].size = 0;
        }
      }

      if (layout.layout === 'vertical') {
        let sum = 0;
        return layout.children.flatMap((child, i) => {
          const result = computeLayout(child, left + padding.left, top + padding.top + gap * i + sum, width - padding.left - padding.right, child.size);
          sum += child.size;
          return result;
        });
      } else {
        let sum = 0;
        return layout.children.flatMap((child, i) => {
          const result = computeLayout(child, left + gap * i + sum + padding.left, top + padding.top, child.size, height - padding.top - padding.bottom);
          sum += child.size;
          return result;
        });
      }
    }
    default:
      console.warn(`unknown layout type ${layout}`);
      return [];
  }
}

function resolveSpacing (spacing: Spacing | undefined): ResolvedSpacing {
  if (!spacing) {
    return { top: 0, left: 0, bottom: 0, right: 0 };
  }
  if (typeof spacing === 'number') {
    return { top: spacing, left: spacing, bottom: spacing, right: spacing };
  } else {
    switch (spacing.length) {
      case 2:
        return { top: spacing[0], bottom: spacing[0], left: spacing[1], right: spacing[1] };
      case 3:
        return { top: spacing[0], left: spacing[1], right: spacing[1], bottom: spacing[2] };
      case 4:
        return { top: spacing[0], right: spacing[1], bottom: spacing[2], left: spacing[3] };
      default:
        throw new Error('bad spacing value');
    }
  }
}