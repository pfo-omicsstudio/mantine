import type {
  TreeSelectFactory,
  TreeSelectMode,
  TreeSelectProps,
  TreeSelectStylesNames,
} from './TreeSelect';

export { TreeSelect } from './TreeSelect';
export { TreeSelectOption } from './TreeSelectOption';
export type { TreeSelectRenderNodePayload } from './TreeSelectOption';
export type { CheckedStrategy } from './get-checked-values-by-strategy';
export type { TreeSelectProps, TreeSelectStylesNames, TreeSelectFactory, TreeSelectMode };

export namespace TreeSelect {
  export type Props = TreeSelectProps;
  export type StylesNames = TreeSelectStylesNames;
  export type Factory = TreeSelectFactory;
  export type Mode = TreeSelectMode;
}
