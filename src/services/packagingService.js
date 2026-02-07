// Packaging Service - Local Options (no API dependency)

// Default packaging options (no API call needed - use local options)
export const DEFAULT_PACKAGING_OPTIONS = [
  { id: 'box', name: 'Box', icon: '📦', description: 'Standard box packaging' },
  { id: 'bag', name: 'Bag', icon: '👜', description: 'Cloth bag packaging' },
  { id: 'polythene', name: 'Polythene', icon: '🛍️', description: 'Plastic polythene' },
  { id: 'pouch', name: 'Pouch', icon: '👝', description: 'Velvet pouch' },
  { id: 'gift_wrap', name: 'Gift Wrap', icon: '🎁', description: 'Premium gift wrapping' },
];

// Get Packaging Options - Use local defaults (API not available yet)
export const getPackagingOptions = async () => {
  // Return default options directly - no API call
  // API endpoint /packaging/options is not available on backend yet
  return {
    success: true,
    data: DEFAULT_PACKAGING_OPTIONS,
  };
};

export default {
  getPackagingOptions,
  DEFAULT_PACKAGING_OPTIONS,
};
