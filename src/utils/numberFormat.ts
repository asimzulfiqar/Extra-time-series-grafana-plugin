import { NumberFormat } from 'types';

const commaDecimalFormatter = new Intl.NumberFormat('de-DE', {
  useGrouping: true,
  maximumFractionDigits: 20,
});

const commaDecimalFixedTwoFormatter = new Intl.NumberFormat('de-DE', {
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatNumber = (value: number, numberFormat = NumberFormat.Default, fixedDecimals?: number): string => {
  if (numberFormat === NumberFormat.CommaDecimal) {
    return fixedDecimals === 2 ? commaDecimalFixedTwoFormatter.format(value) : commaDecimalFormatter.format(value);
  }

  return fixedDecimals === 2 ? value.toFixed(2) : String(value);
};

export const formatNumericText = (value: string, numberFormat = NumberFormat.Default): string => {
  if (numberFormat !== NumberFormat.CommaDecimal) {
    return value;
  }

  return value.replace(/(-?\d{1,3}(?:,\d{3})+|-?\d+)(?:\.(\d+))?/g, (match, integerPart, fractionalPart) => {
    const localizedInteger = String(integerPart).replace(/,/g, '.');
    return fractionalPart == null ? localizedInteger : `${localizedInteger},${fractionalPart}`;
  });
};
