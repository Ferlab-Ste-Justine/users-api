import { removeQueryFromFilters, updateQuery } from '../utils/savedFilters';
import * as savedFilters from '../utils/savedFilters';
jest.spyOn(savedFilters, 'getPillContent').mockImplementation(
    () =>
        new Promise((resolve) => {
            resolve({ query: { content: 'abcde' }, title: 'fghijklm' });
        }),
);

describe('Validate filters handle query pills', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('remove query from filter', () => {
        it('should remove the object with filterID', () => {
            const initialFilters = [
                {
                    id: '70b998bc-85db-4ae4-9bbe-bada23ec2a91',
                    type: 'filter',
                    queries: [
                        {
                            id: '53adc865-907a-4589-87ba-cb925de6f6a5',
                            op: 'and',
                            content: [
                                {
                                    op: 'in',
                                    content: {
                                        field: 'consequences.biotype',
                                        index: 'Variants',
                                        value: ['protein_coding'],
                                    },
                                },
                                {
                                    op: 'in',
                                    content: {
                                        field: 'donors.zygosity',
                                        index: 'Variants',
                                        value: ['HET', 'HEM'],
                                    },
                                },
                                {
                                    op: 'in',
                                    content: {
                                        field: 'donors.affected_status_code',
                                        index: 'Variants',
                                        value: ['affected'],
                                    },
                                },
                            ],
                        },
                        {
                            id: '53adc865-907a-4589-87ba-cb925de6f6a9',
                            op: 'and',
                            content: [
                                {
                                    filterID: '0a1292c2-0bab-4190-a8d1-6db6e125af8a',
                                },
                            ],
                        },
                    ],
                    title: 'NOUVEAU',
                },
                {
                    id: '78809fbb-429a-44c7-9f38-ed6afcb61234',
                    type: 'filter',
                    queries: [
                        {
                            id: '53adc865-907a-4589-87ba-cb925de51234',
                            op: 'or',
                            content: [
                                {
                                    filterID: '78709fbb-429a-44c7-9f38-ed6afcb61234',
                                },
                                {
                                    filterID: '0a1292c2-0bab-4190-a8d1-6db6e125af8a',
                                },
                            ],
                        },
                    ],
                    title: 'une query 2 pilules',
                },
            ];

            const result = removeQueryFromFilters(initialFilters, '0a1292c2-0bab-4190-a8d1-6db6e125af8a');

            expect(JSON.stringify(result)).not.toContain('0a1292c2-0bab-4190-a8d1-6db6e125af8a');
        });

        it('replace object containing filterID with query content', async () => {
            const query = { content: [{ filterID: '0a1292c2-0bab-4190-a8d1-6db6e125af8a' }] };
            const updatedQuery = await updateQuery(query);
            expect(updatedQuery).toEqual({ content: [{ content: 'abcde', title: 'fghijklm' }] });
        });
    });
});
``;
