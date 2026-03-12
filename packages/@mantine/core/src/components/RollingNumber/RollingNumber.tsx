import { useRef, useState } from 'react';
import { useDidUpdate } from '@mantine/hooks';
import {
  Box,
  BoxProps,
  createVarsResolver,
  ElementProps,
  factory,
  Factory,
  StylesApiProps,
  useProps,
  useStyles,
} from '../../core';
import { DigitColumn } from './DigitColumn';
import classes from './RollingNumber.module.css';

export type RollingNumberStylesNames = 'root' | 'digit' | 'digitColumn' | 'char';
export type RollingNumberCssVariables = {
  root: '--rn-duration' | '--rn-timing-function';
};

function getDigitParts(
  value: number,
  decimalScale: number | undefined,
  fixedDecimalScale: boolean | undefined
) {
  const abs = Math.abs(value);
  let str = decimalScale !== undefined ? abs.toFixed(decimalScale) : String(abs);

  if (!fixedDecimalScale && decimalScale !== undefined) {
    const parts = str.split('.');
    if (parts[1]) {
      const trimmed = parts[1].replace(/0+$/, '');
      str = trimmed ? `${parts[0]}.${trimmed}` : parts[0];
    }
  }

  const dotIdx = str.indexOf('.');
  const intStr = dotIdx >= 0 ? str.slice(0, dotIdx) : str;
  const fracStr = dotIdx >= 0 ? str.slice(dotIdx + 1) : '';

  return {
    negative: value < 0,
    intDigits: intStr.split(''),
    fracDigits: fracStr ? fracStr.split('') : [],
    hasDecimal: dotIdx >= 0,
  };
}

function buildAccessibleValue(
  value: number,
  prefix: string | undefined,
  suffix: string | undefined,
  decimalSeparator: string,
  thousandSeparator: string | boolean | undefined,
  decimalScale: number | undefined,
  fixedDecimalScale: boolean | undefined
): string {
  const parts = getDigitParts(value, decimalScale, fixedDecimalScale);
  let intStr = parts.intDigits.join('');

  if (thousandSeparator) {
    const sep = typeof thousandSeparator === 'string' ? thousandSeparator : ',';
    intStr = intStr.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
  }

  let result = parts.negative ? `-${intStr}` : intStr;
  if (parts.fracDigits.length > 0) {
    result += `${decimalSeparator}${parts.fracDigits.join('')}`;
  }

  return `${prefix || ''}${result}${suffix || ''}`;
}

export interface RollingNumberProps
  extends BoxProps, StylesApiProps<RollingNumberFactory>, ElementProps<'div'> {
  /** Number value to display */
  value: number;

  /** Prefix added before the value */
  prefix?: string;

  /** Suffix added after the value */
  suffix?: string;

  /** Character used as a decimal separator @default '.' */
  decimalSeparator?: string;

  /** Character used to separate thousands, set to `true` for `,` @default false */
  thousandSeparator?: string | boolean;

  /** Number of decimal places to display */
  decimalScale?: number;

  /** If set, trailing zeros are added to match `decimalScale` @default false */
  fixedDecimalScale?: boolean;

  /** Animation duration in milliseconds @default 600 */
  animationDuration?: number;

  /** CSS timing function for animation @default 'ease' */
  timingFunction?: string;

  /** If set, use tabular (monospace) numbers @default true */
  tabularNumbers?: boolean;
}

export type RollingNumberFactory = Factory<{
  props: RollingNumberProps;
  ref: HTMLDivElement;
  stylesNames: RollingNumberStylesNames;
  vars: RollingNumberCssVariables;
}>;

const defaultProps = {
  animationDuration: 600,
  timingFunction: 'ease',
  decimalSeparator: '.',
  tabularNumbers: true,
} satisfies Partial<RollingNumberProps>;

const varsResolver = createVarsResolver<RollingNumberFactory>(
  (_, { animationDuration, timingFunction }) => ({
    root: {
      '--rn-duration': `${animationDuration}ms`,
      '--rn-timing-function': timingFunction,
    },
  })
);

export const RollingNumber = factory<RollingNumberFactory>((_props) => {
  const props = useProps('RollingNumber', defaultProps, _props);
  const {
    classNames,
    className,
    style,
    styles,
    unstyled,
    vars,
    value,
    prefix,
    suffix,
    decimalSeparator,
    thousandSeparator,
    decimalScale,
    fixedDecimalScale,
    animationDuration,
    timingFunction,
    tabularNumbers,
    mod,
    attributes,
    ...others
  } = props;

  const getStyles = useStyles<RollingNumberFactory>({
    name: 'RollingNumber',
    classes,
    props,
    className,
    style,
    classNames,
    styles,
    unstyled,
    attributes,
    vars,
    varsResolver,
  });

  const previousValueRef = useRef(value);
  const [previousValue, setPreviousValue] = useState(value);

  useDidUpdate(() => {
    setPreviousValue(previousValueRef.current);
    previousValueRef.current = value;
  }, [value]);

  const current = getDigitParts(value, decimalScale, fixedDecimalScale);
  const prev = getDigitParts(previousValue, decimalScale, fixedDecimalScale);

  const maxIntLen = Math.max(current.intDigits.length, prev.intDigits.length);
  const maxFracLen = Math.max(current.fracDigits.length, prev.fracDigits.length);

  const currIntPadded: (string | null)[] = [
    ...Array(maxIntLen - current.intDigits.length).fill(null),
    ...current.intDigits,
  ];
  const prevIntPadded: (string | null)[] = [
    ...Array(maxIntLen - prev.intDigits.length).fill(null),
    ...prev.intDigits,
  ];

  const currFracPadded: (string | null)[] = [
    ...current.fracDigits,
    ...Array(maxFracLen - current.fracDigits.length).fill(null),
  ];
  const prevFracPadded: (string | null)[] = [
    ...prev.fracDigits,
    ...Array(maxFracLen - prev.fracDigits.length).fill(null),
  ];

  const sep = thousandSeparator
    ? typeof thousandSeparator === 'string'
      ? thousandSeparator
      : ','
    : null;

  const slots: React.ReactNode[] = [];

  if (prefix) {
    prefix.split('').forEach((c, i) => {
      slots.push(
        <span key={`prefix-${i}`} {...getStyles('char')} aria-hidden="true">
          {c}
        </span>
      );
    });
  }

  if (current.negative || prev.negative) {
    const signEmpty = !current.negative;
    const charStyles = getStyles('char');
    slots.push(
      <span key="sign" {...charStyles} data-empty={signEmpty || undefined} aria-hidden="true">
        -
      </span>
    );
  }

  for (let i = 0; i < maxIntLen; i++) {
    const posFromRight = maxIntLen - 1 - i;
    const currDigit = currIntPadded[i];
    const prevDigit = prevIntPadded[i];
    const isEmpty = currDigit === null;

    slots.push(
      <DigitColumn
        key={`int-${posFromRight}`}
        digit={currDigit ?? '0'}
        previousDigit={prevDigit}
        getStyles={getStyles}
        empty={isEmpty}
      />
    );

    if (sep && posFromRight > 0 && posFromRight % 3 === 0) {
      const charStyles = getStyles('char');
      slots.push(
        <span
          key={`sep-${posFromRight}`}
          {...charStyles}
          data-empty={isEmpty || undefined}
          aria-hidden="true"
        >
          {sep}
        </span>
      );
    }
  }

  if (current.hasDecimal || prev.hasDecimal) {
    const decEmpty = !current.hasDecimal;
    const charStyles = getStyles('char');
    slots.push(
      <span key="dec" {...charStyles} data-empty={decEmpty || undefined} aria-hidden="true">
        {decimalSeparator}
      </span>
    );
  }

  for (let i = 0; i < maxFracLen; i++) {
    const currDigit = currFracPadded[i];
    const prevDigit = prevFracPadded[i];
    const isEmpty = currDigit === null;

    slots.push(
      <DigitColumn
        key={`frac-${i}`}
        digit={currDigit ?? '0'}
        previousDigit={prevDigit}
        getStyles={getStyles}
        empty={isEmpty}
      />
    );
  }

  if (suffix) {
    suffix.split('').forEach((c, i) => {
      slots.push(
        <span key={`suffix-${i}`} {...getStyles('char')} aria-hidden="true">
          {c}
        </span>
      );
    });
  }

  const accessibleValue = buildAccessibleValue(
    value,
    prefix,
    suffix,
    decimalSeparator!,
    thousandSeparator,
    decimalScale,
    fixedDecimalScale
  );

  return (
    <Box
      {...getStyles('root')}
      mod={[{ 'tabular-numbers': tabularNumbers }, mod]}
      role="status"
      aria-label={accessibleValue}
      {...others}
    >
      {slots}
    </Box>
  );
});

RollingNumber.classes = classes;
RollingNumber.varsResolver = varsResolver;
RollingNumber.displayName = '@mantine/core/RollingNumber';
