import { IUserOuput } from '../db/models/User';

// The type could be better but this is most likely sufficient for our use case
// In case we need to update the types, it's Greatly inspired from:
// https://github.com/christianblandford/smartsheet-javascript-sdk-types

export type Cell = {
    columnId: number;
    columnType?: string;
    conditionalFormat?: string;
    displayValue?: string;
    format?: string;
    formula?: string;
    strict?: boolean;
    value: string | number | boolean;
};

export type Column = {
    description: string;
    format: string;
    formula: string;
    hidden: boolean;
    id: number;
    index: number;
    locked: boolean;
    options: string[];
    primary: boolean;
    title: string;
};

export type Sheet = {
    id?: number;
    fromId?: number;
    ownerId?: number;
    columns?: Column[];
    createdAt?: string | number;
    dependenciesEnabled?: boolean;
    effectiveAttachmentOptions?: string[];
    favorite?: boolean;
    ganttEnabled?: boolean;
    hasSummaryFields?: boolean;
    modifiedAt?: string | number;
    name?: string;
    owner?: string;
    permalink?: string;
    readOnly?: boolean;
    rows?: Row[];
    showParentRowsForFilters?: boolean;
    version: number;
};

export type Row = {
    id: number;
    sheetId: number;
    cells: Cell[];
    columns: Column[];
    conditionalFormat: string;
    createdAt: string | number;
    expanded: boolean;
    filteredOut?: boolean;
    format?: string;
    inCriticalPath?: boolean;
    locked: boolean;
    lockedForUser: boolean;
    modifiedAt: string | number;
    permaLink?: string;
    rowNumber: number;
    version: number;
};

export type SubscribeNewsletterPayload = Pick<
    IUserOuput,
    'first_name' | 'last_name' | 'affiliation' | 'roles' | 'newsletter_email'
>;

export type FormattedRow = {
    toTop: boolean;
    cells: {
        columnId: number;
        value: string;
    }[];
};
