// Common color palette for consistent visualization styling
export const colorPalette = {
    primary: ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'],
    accent: ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'],
    semantic: {
      positive: '#22c55e',
      negative: '#ef4444',
      neutral: '#6b7280'
    }
  };
  
  // Base chart theme configuration for consistent appearance
  export const baseChartTheme = {
    textStyle: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: 12,
      color: '#374151'
    },
    title: {
      textStyle: {
        fontSize: 16,
        fontWeight: 500,
        color: '#111827'
      },
      left: 'center',
      top: 10
    },
    grid: {
      containLabel: true,
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%'
    },
    tooltip: {
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      textStyle: {
        color: '#374151'
      },
      extraCssText: 'box-shadow: 0 2px 4px rgba(0,0,0,0.1);'
    }
  };
  
  // Currency formatter for consistent monetary value display
  export const formatCurrency = (value, abbreviate = false) => {
    if (abbreviate) {
      if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `$${(value / 1000).toFixed(1)}K`;
      }
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };
  
  // Date formatter for consistent date display
  export const formatDate = (date, format = 'short') => {
    const dateObj = new Date(date);
    const options = {
      short: { month: 'short', year: 'numeric' },
      medium: { month: 'short', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' }
    };
    return dateObj.toLocaleDateString('en-US', options[format]);
  };
  
  // Calculate percentage change for trend analysis
  export const calculatePercentageChange = (current, previous) => {
    if (!previous) return null;
    return ((current - previous) / previous) * 100;
  };
  
  // Generate gradient colors for continuous scales
  export const generateGradientColors = (startColor, endColor, steps) => {
    const start = parseColor(startColor);
    const end = parseColor(endColor);
    
    return Array.from({ length: steps }, (_, i) => {
      const ratio = i / (steps - 1);
      return rgbToHex(
        Math.round(start.r + (end.r - start.r) * ratio),
        Math.round(start.g + (end.g - start.g) * ratio),
        Math.round(start.b + (end.b - start.b) * ratio)
      );
    });
  };
  
  // Helper function to parse color strings
  const parseColor = (color) => {
    const hex = color.replace('#', '');
    return {
      r: parseInt(hex.slice(0, 2), 16),
      g: parseInt(hex.slice(2, 4), 16),
      b: parseInt(hex.slice(4, 6), 16)
    };
  };
  
  // Helper function to convert RGB to hex
  const rgbToHex = (r, g, b) => {
    return '#' + [r, g, b]
      .map(x => {
        const hex = x.toString(16);
        return hex.length === 1 ? '0' + hex : hex;
      })
      .join('');
  };
  
  // Generate responsive chart dimensions
  export const getResponsiveDimensions = (containerWidth) => {
    const aspectRatio = 0.6; // Default aspect ratio
    return {
      width: containerWidth,
      height: Math.floor(containerWidth * aspectRatio)
    };
  };
  
  // Common axis configurations
  export const axisConfig = {
    currency: {
      axisLabel: {
        formatter: value => formatCurrency(value, true)
      }
    },
    percentage: {
      axisLabel: {
        formatter: '{value}%'
      }
    },
    time: {
      axisLabel: {
        formatter: value => formatDate(value)
      }
    }
  };
  
  // Chart-specific utility functions
  export const generateBoxPlotData = (data) => {
    return {
      min: Math.min(...data),
      q1: calculateQuantile(data, 0.25),
      median: calculateQuantile(data, 0.5),
      q3: calculateQuantile(data, 0.75),
      max: Math.max(...data)
    };
  };
  
  const calculateQuantile = (data, q) => {
    const sorted = [...data].sort((a, b) => a - b);
    const pos = (sorted.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    
    if (sorted[base + 1] !== undefined) {
      return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
    } else {
      return sorted[base];
    }
  };
  
  // Animation configurations for different chart types
  export const chartAnimations = {
    default: {
      animationDuration: 1000,
      animationEasing: 'cubicOut'
    },
    progressive: {
      animationDuration: 1000,
      animationDelay: (idx) => idx * 100,
      animationEasing: 'cubicInOut'
    }
  };
  
  // Legend configurations
  export const legendConfig = {
    default: {
      type: 'scroll',
      orient: 'horizontal',
      bottom: 10,
      textStyle: {
        color: '#374151'
      }
    }
  };
  
  // Export combined chart options for quick setup
  export const getDefaultChartOptions = (type) => {
    return {
      ...baseChartTheme,
      animation: chartAnimations.default,
      legend: legendConfig.default,
      color: colorPalette.primary
    };
  };