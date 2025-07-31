// Security utilities for safe logging and error handling

export const secureLog = (message: string, data?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(message, data);
  }
};

export const secureError = (message: string, error?: any) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(message, error);
  }
};

export const sanitizeError = (error: any): string => {
  // Return generic error messages in production
  if (process.env.NODE_ENV === 'production') {
    return 'An error occurred. Please try again.';
  }
  
  // Return detailed error in development
  return error?.message || 'Unknown error occurred';
};

export const validateTournamentData = (data: any): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Basic validation
  if (!data.name || typeof data.name !== 'string' || data.name.length < 1) {
    errors.push('Tournament name is required');
  }
  
  if (!data.buy_in || typeof data.buy_in !== 'number' || data.buy_in < 0) {
    errors.push('Valid buy-in amount is required');
  }
  
  if (!Array.isArray(data.levels) || data.levels.length === 0) {
    errors.push('At least one level is required');
  }
  
  // Validate levels structure
  if (Array.isArray(data.levels)) {
    data.levels.forEach((level: any, index: number) => {
      if (!level.smallBlind || typeof level.smallBlind !== 'number') {
        errors.push(`Level ${index + 1}: Small blind must be a valid number`);
      }
      if (!level.bigBlind || typeof level.bigBlind !== 'number') {
        errors.push(`Level ${index + 1}: Big blind must be a valid number`);
      }
      if (!level.duration || typeof level.duration !== 'number') {
        errors.push(`Level ${index + 1}: Duration must be a valid number`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};