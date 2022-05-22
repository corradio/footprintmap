import { DEFAULT_FLAG_SIZE } from '../helpers/constants';

export const flagUri = function(countryCode, flagSize = DEFAULT_FLAG_SIZE) {
  if (!countryCode) return undefined;
  const flagFile = (countryCode.toLowerCase().split('-')[0] + '.png');
  return '/images/flag-icons/flags_iso/' + flagSize + '/' + flagFile;
};
