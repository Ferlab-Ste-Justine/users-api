import { convertToPersona, Persona, validateUniqPersonas } from './persona';

describe('validateUniqPersonas', () => {
    const p: Persona = { egoId: '1' } as Persona;
    it('should return true if no duplicate', () => {
        const personas = [p, { ...p, egoId: '2' }, { ...p, egoId: '3' }];

        expect(validateUniqPersonas(personas)).toBeTruthy();
    });

    it('should return false if at least 1 duplicate', () => {
        const personas = [p, { ...p, egoId: '2' }, { ...p, egoId: '2' }];

        expect(validateUniqPersonas(personas)).toBeFalsy();
    });
});

describe('convertToPersona', () => {
    const emptyInput = {
        id: '',
        isPublic: '',
        isActive: '',
        title: '',
        firstName: '',
        lastName: '',
        role: '',
        loginEmail: '',
        institution: '',
        department: '',
        jobTitle: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        country: '',
        phone: '',
        institutionalEmail: '',
        eraCommonsID: '',
        website: '',
        twitter: '',
        orchid: '',
        linkedin: '',
        googleScholarId: '',
        github: '',
        facebook: '',
        acceptedTerms: '',
        acceptedNihOptIn: '',
        acceptedKfOptIn: '',
        acceptedDatasetSub: '',
        interests: '',
        egoId: '',
        story: '',
        bio: '',
    };

    it('should transform boolean', () => {
        const input = {
            ...emptyInput,
            isPublic: 'true',
            isActive: 'true',
            acceptedTerms: 'false',
            acceptedNihOptIn: '0',
            acceptedKfOptIn: '1',
            acceptedDatasetSub: '',
        };

        const persona = convertToPersona(input);

        expect(persona.isPublic).toBeTruthy();
        expect(persona.isActive).toBeTruthy();
        expect(persona.acceptedTerms).toBeFalsy();
        expect(persona.acceptedNihOptIn).toBeFalsy();
        expect(persona.acceptedKfOptIn).toBeFalsy();
        expect(persona.acceptedDatasetSub).toBeFalsy();
    });

    it('should replace empty string by null', () => {
        const persona = convertToPersona(emptyInput);

        expect(persona.firstName).toBeNull();
        expect(persona.lastName).toBeNull();
        expect(persona.loginEmail).toBeNull();
        expect(persona.institution).toBeNull();
        expect(persona.state).toBeNull();
        expect(persona.country).toBeNull();
        expect(persona.institutionalEmail).toBeNull();
        expect(persona.eraCommonsID).toBeNull();
        expect(persona.website).toBeNull();
        expect(persona.linkedin).toBeNull();
        expect(persona.egoId).toBeNull();
    });

    it('should split arrays of string', () => {
        const input = {
            ...emptyInput,
            role: 'a,b',
            interests: 'c,d',
        };

        const personaEmpty = convertToPersona(emptyInput);
        const persona = convertToPersona(input);

        expect(personaEmpty.role).toEqual([]);
        expect(personaEmpty.interests).toEqual([]);
        expect(persona.role).toEqual(['a', 'b']);
        expect(persona.interests).toEqual(['c', 'd']);
    });

    it('should trim', () => {
        const input = {
            ...emptyInput,
            firstName: ' firstName ',
            lastName: ' lastName ',
            loginEmail: ' login@email.com ',
            institution: ' institution ',
            state: ' state ',
            country: ' country ',
            institutionalEmail: ' institutional@email.com ',
            eraCommonsID: ' eraCommonsID ',
            website: ' http://www.website.org ',
            linkedin: ' http://www.linkedin.com/in/test ',
            egoId: ' egoId ',
        };

        const persona = convertToPersona(input);

        expect(persona.firstName).toBe('firstName');
        expect(persona.lastName).toBe('lastName');
        expect(persona.loginEmail).toBe('login@email.com');
        expect(persona.institution).toBe('institution');
        expect(persona.state).toBe('state');
        expect(persona.country).toBe('country');
        expect(persona.institutionalEmail).toBe('institutional@email.com');
        expect(persona.eraCommonsID).toBe('eraCommonsID');
        expect(persona.website).toBe('http://www.website.org');
        expect(persona.linkedin).toBe('http://www.linkedin.com/in/test');
        expect(persona.egoId).toBe('egoId');
    });

    it('should validate URL', () => {
        const inputValid = {
            ...emptyInput,
            website: 'http://www.website.org',
        };

        const inputInvalid = {
            ...emptyInput,
            website: 'invalid_url',
        };

        const personaValidUrl = convertToPersona(inputValid);
        const personaInvalidUrl = convertToPersona(inputInvalid);

        expect(personaValidUrl.website).toBe('http://www.website.org');
        expect(personaInvalidUrl.website).toBeNull();
    });

    it('should validate emails', () => {
        const inputValid = {
            ...emptyInput,
            loginEmail: 'login@email.com',
            institutionalEmail: 'institutional@email.com',
        };

        const inputInvalid = {
            ...emptyInput,
            loginEmail: 'invalid_login_email',
            institutionalEmail: 'invalid_institutional_email',
        };

        const personaValidEmails = convertToPersona(inputValid);
        const personaInvalidEmails = convertToPersona(inputInvalid);

        expect(personaValidEmails.loginEmail).toBe('login@email.com');
        expect(personaValidEmails.institutionalEmail).toBe('institutional@email.com');
        expect(personaInvalidEmails.loginEmail).toBeNull();
        expect(personaInvalidEmails.institutionalEmail).toBeNull();
    });

    it('should validate linkedin link', () => {
        const inputValid = {
            ...emptyInput,
            linkedin: 'http://www.linkedin.com/in/test',
        };

        const inputInvalid = {
            ...emptyInput,
            linkedin: 'invalid_linkedin',
        };

        const personaValidLinkedin = convertToPersona(inputValid);
        const personaInvalidLinkedin = convertToPersona(inputInvalid);

        expect(personaValidLinkedin.linkedin).toBe('http://www.linkedin.com/in/test');
        expect(personaInvalidLinkedin.linkedin).toBeNull();
    });
});
