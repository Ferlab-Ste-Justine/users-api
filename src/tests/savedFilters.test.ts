import { getFilterIDs, removeQueryFromFilters, updateQuery } from '../utils/savedFilters';
import * as savedFilters from '../utils/savedFilters';

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

        it('should remove object with title and id', () => {
            const initialFilters = [
                {
                    id: '924569d4-706f-4658-a349-f5168a1ed966',
                    keycloak_id: '3999fd60-80d2-477d-819e-93f6873efdb2',
                    title: 'Filtre 3',
                    tag: 'snv_exploration_rqdm',
                    type: 'filter',
                    favorite: false,
                    queries: [
                        {
                            id: '0e21dcc6-27ac-4e83-a386-75bcba8db818',
                            op: 'and',
                            content: [
                                {
                                    id: '3355ead1-83c2-4003-9ac2-db87c086e6d3',
                                    op: 'and',
                                    title: 'pill three',
                                    content: [
                                        {
                                            op: 'in',
                                            content: {
                                                field: 'variant_class',
                                                index: 'Variants',
                                                value: ['SNV', 'deletion'],
                                            },
                                        },
                                        {
                                            op: 'in',
                                            content: {
                                                field: 'variant_external_reference',
                                                index: 'Variants',
                                                value: ['DBSNP', 'Clinvar'],
                                            },
                                        },
                                    ],
                                },
                                {
                                    op: 'in',
                                    content: {
                                        field: 'donors.analysis_code',
                                        index: 'Variants',
                                        value: ['MYOC'],
                                    },
                                },
                            ],
                        },
                        {
                            id: 'c23b89df-36ef-47cf-92c0-28971dea9385',
                            op: 'and',
                            content: [
                                {
                                    op: 'in',
                                    content: {
                                        field: 'donors.analysis_code',
                                        index: 'Variants',
                                        value: ['MYOC', 'RGDI', 'EXTUM'],
                                    },
                                },
                            ],
                        },
                    ],
                    creation_date: '2023-08-07T19:07:13.904Z',
                    updated_date: '2023-08-07T19:07:13.904Z',
                },
            ];

            const result = removeQueryFromFilters(initialFilters, '3355ead1-83c2-4003-9ac2-db87c086e6d3');

            expect(JSON.stringify(result)).not.toContain('3355ead1-83c2-4003-9ac2-db87c086e6d3');
        });

        it('replace object containing filterID with query content', async () => {
            const value = new Promise((resolve) => {
                resolve({ query: { content: 'abcde' }, title: 'fghijklm', filterID: '1234' });
            });
            jest.spyOn(savedFilters, 'getPillContent').mockReturnValue(value as any);
            const query = { content: [{ filterID: '0a1292c2-0bab-4190-a8d1-6db6e125af8a' }] };
            const updatedQuery = await updateQuery(query);
            expect(updatedQuery).toEqual({
                content: [{ content: 'abcde', title: 'fghijklm', id: '0a1292c2-0bab-4190-a8d1-6db6e125af8a' }],
            });
        });

        describe('Should create pills that are not saved in the database before saving new filter', function () {
            it('should retrieve all filterID in any json structure', async () => {
                const aJson = [
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
                                        title: 'une pilule, encore',
                                        content: [],
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
                                        title: 'une pilule',
                                        content: [],
                                    },
                                    {
                                        filterID: '0a1292c2-0bab-4190-a8d1-6db6e125a7890',
                                        title: 'une autre pilule',
                                        content: [],
                                    },
                                    {
                                        filterID: '0a1292c2-0bab-4190-a8d1-6db6e125a7890',
                                        title: 'une autre pilule',
                                        content: [],
                                    },
                                ],
                            },
                        ],
                        title: 'une query 2 pilules',
                    },
                ];

                const result = getFilterIDs(aJson);
                const expectedResult = {
                    '0a1292c2-0bab-4190-a8d1-6db6e125af8a': {
                        filterID: '0a1292c2-0bab-4190-a8d1-6db6e125af8a',
                        title: 'une pilule, encore',
                        content: [],
                    },
                    '78709fbb-429a-44c7-9f38-ed6afcb61234': {
                        filterID: '78709fbb-429a-44c7-9f38-ed6afcb61234',
                        title: 'une pilule',
                        content: [],
                    },
                    '0a1292c2-0bab-4190-a8d1-6db6e125a7890': {
                        filterID: '0a1292c2-0bab-4190-a8d1-6db6e125a7890',
                        title: 'une autre pilule',
                        content: [],
                    },
                };

                expect(expectedResult).toEqual(result);
            });
        });
    });
});
``;
