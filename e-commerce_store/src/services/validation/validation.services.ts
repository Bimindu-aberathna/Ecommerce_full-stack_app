export const validateUser = (data: any) => {
  
    const errors: string[] = [];
    
    // Check if required fields are present
    if (!data.firstName || typeof data.firstName !== 'string' || !/^[A-Z][a-z]+(?:[-'][A-Z][a-z]+)*(?: [A-Z][a-z]+(?:[-'][A-Z][a-z]+)*)*$/.test(data.firstName)) {
        errors.push('First name is required and must be a valid name.');
    }
    if (!data.lastName || typeof data.lastName !== 'string' || !/^[A-Z][a-z]+(?:[-'][A-Z][a-z]+)*(?: [A-Z][a-z]+(?:[-'][A-Z][a-z]+)*)*$/.test(data.lastName)) {
        errors.push('Last name is required and must be a valid name.');
    }
    if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) {
        errors.push('A valid email is required.');
    }
    if (!data.mobile || !/^\+?[\d\s\-\(\)]{10,}$/.test(data.mobile)) {
        errors.push('A valid mobile number is required.');
    }
    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
        errors.push('Address is required.');
    }
    if (!data.postalCode || !/^\d{5}(-\d{4})?$/.test(data.postalCode)) {
        errors.push('A valid postal code is required.');
    }
    if (!data.password || data.password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }
    
    return errors;
};

