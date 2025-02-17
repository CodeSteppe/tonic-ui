import { callAll, dataAttr } from '@tonic-ui/utils';
import { ensureArray } from 'ensure-type';
import _get from 'lodash.get';
import React, { forwardRef } from 'react';
import { Box, ControlBox } from '../box';
import { useTheme } from '../theme';
import { VisuallyHidden } from '../visually-hidden';
import IconCheck from './IconCheck';
import IconMinus from './IconMinus';
import useCheckboxGroup from './useCheckboxGroup';
import { useCheckboxStyle } from './styles';

const sizes = {
  lg: '6x',
  md: '4x',
  sm: '3x',
};

const defaultSize = 'md';
const defaultVariantColor = 'blue';

const Checkbox = forwardRef((
  {
    checked,
    children,
    defaultChecked,
    disabled,
    iconColor,
    id,
    indeterminate,
    name,
    readOnly,
    size,
    value,
    variantColor,
    onBlur,
    onChange,
    onClick,
    onFocus,
    ...rest
  },
  ref,
) => {
  const checkboxGroupContext = useCheckboxGroup();
  const _defaultChecked = defaultChecked ? undefined : checked;
  checked = readOnly ? Boolean(checked) : _defaultChecked;

  if (checkboxGroupContext) {
    const {
      disabled: checkboxGroupDisabled,
      name: checkboxGroupName,
      size: checkboxGroupSize,
      value: checkboxGroupValue,
      variantColor: checkboxGroupVariantColor,
      onChange: checkboxGroupOnChange
    } = { ...checkboxGroupContext };
    if (checkboxGroupValue !== undefined) {
      checked = ensureArray(checkboxGroupValue).includes(value);
    }
    disabled = checkboxGroupDisabled || disabled;
    name = checkboxGroupName ?? name;
    onChange = callAll(
      onChange,
      checkboxGroupOnChange,
    );
    // Use the default value if the value is null or undefined
    size = (size ?? checkboxGroupSize) ?? defaultSize;
    variantColor = (variantColor ?? checkboxGroupVariantColor) ?? defaultVariantColor;
  } else {
    // Use the default value if the value is null or undefined
    size = size ?? defaultSize;
    variantColor = variantColor ?? defaultVariantColor;
  }

  const { sizes: themeSizes } = useTheme();
  const _size = sizes[size];
  const themeSize = _get(themeSizes, _size);
  const iconSize = themeSize;
  const styleProps = useCheckboxStyle({
    color: variantColor,
    indeterminate,
    width: _size,
    height: _size,
  });

  return (
    <Box
      as="label"
      display="inline-flex"
      verticalAlign="top"
      alignItems="center"
      cursor={disabled || readOnly ? 'not-allowed' : 'pointer'}
      {...rest}
    >
      <VisuallyHidden
        as="input"
        type="checkbox"
        id={id}
        ref={ref}
        name={name}
        value={value}
        defaultChecked={readOnly ? undefined : defaultChecked}
        onChange={readOnly ? undefined : onChange}
        onClick={readOnly ? undefined : onClick}
        onBlur={onBlur}
        onFocus={onFocus}
        checked={checked}
        disabled={disabled}
        readOnly={readOnly}
        data-indeterminate={dataAttr(indeterminate)}
      />
      <ControlBox
        type="checkbox"
        {...styleProps}
      >
        {/* This Box is for rendering background color of Checkbox which is focused. */}
        <Box
          zIndex="-1"
          position="absolute"
          top="0"
          bottom="0"
          left="0"
          right="0"
        />
        {
          indeterminate
            ? <IconMinus size={iconSize} color={iconColor} />
            : <IconCheck size={iconSize} color={iconColor} />
        }
      </ControlBox>
      {children && (
        <Box
          ml="2x"
          userSelect="none"
          opacity={readOnly || disabled ? 0.28 : 1}
        >
          {children}
        </Box>
      )}
    </Box>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
