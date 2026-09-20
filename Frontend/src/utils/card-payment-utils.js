function digitsOnly(value, max) {
    return value.replace(/\D/g, '').slice(0, max);
}

export function formatCardNumber(value) {
    const digits = digitsOnly(value, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
}

export function formatCardExpiry(value) {
    const digits = digitsOnly(value, 4);
    if (digits.length <= 2)
        return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateCardForm({ cardNumber, cardName, expiry, cvv }) {
    const num = digitsOnly(cardNumber, 16);
    const errors = {};
    if (num.length !== 16)
        errors.cardNumber = 'Enter a valid 16-digit card number';
    if (!cardName.trim())
        errors.cardName = 'Name on card is required';
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
        errors.expiry = 'Use MM/YY format';
    }
    else {
        const [mm, yy] = expiry.split('/').map(Number);
        if (mm < 1 || mm > 12)
            errors.expiry = 'Invalid expiry month';
        else {
            const now = new Date();
            const exp = new Date(2000 + yy, mm, 0, 23, 59, 59);
            if (exp < now)
                errors.expiry = 'Card has expired';
        }
    }
    if (!/^\d{3,4}$/.test(cvv))
        errors.cvv = 'Enter 3 or 4 digit CVV';
    return errors;
}

export function isCardFormValid(form) {
    return Object.keys(validateCardForm(form)).length === 0;
}

export { digitsOnly };
