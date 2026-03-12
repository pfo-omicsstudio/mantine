import { DatePickerType } from '../../types';
import type {
  DateTimePickerFactory,
  DateTimePickerProps,
  DateTimePickerStylesNames,
} from './DateTimePicker';

export { DateTimePicker } from './DateTimePicker';

export type { DateTimePickerProps, DateTimePickerStylesNames, DateTimePickerFactory };

export namespace DateTimePicker {
  export type Props<Type extends DatePickerType = 'default'> = DateTimePickerProps<Type>;
  export type StylesNames = DateTimePickerStylesNames;
  export type Factory = DateTimePickerFactory;
}
