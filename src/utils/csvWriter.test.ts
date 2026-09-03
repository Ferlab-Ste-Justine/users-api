import { PassThrough } from 'stream';

import UserModel from '../db/models/User';
import { writeUserListInCsv } from './csvWriter';

const exportUsers = (users: Partial<UserModel>[]): Promise<string> =>
    new Promise((resolve, reject) => {
        const res = new PassThrough();
        res['setHeader'] = () => undefined;

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);

        writeUserListInCsv(users as UserModel[], res);
    });

describe('writeUserListInCsv', () => {
    it.each(['=1+1', '+1+1', '-1+1', '@SUM(A1:A9)'])('neutralizes a cell starting with %s', async (payload) => {
        const csv = await exportUsers([{ research_area_description: payload }]);

        expect(csv).toContain(`'${payload}`);
    });

    it('neutralizes the elements of an array column', async () => {
        const csv = await exportUsers([{ research_domains: ['=cmd', 'genomics'] }]);

        expect(csv).toContain("'=cmd");
    });

    it('leaves an ordinary value untouched', async () => {
        const csv = await exportUsers([{ first_name: 'Jane', affiliation: 'Sick Kids' }]);

        expect(csv).toContain('Jane');
        expect(csv).not.toContain("'Jane");
    });

    it('leaves non-string columns untouched', async () => {
        const csv = await exportUsers([{ id: -42, deleted: false }]);

        expect(csv).toContain('-42');
        expect(csv).not.toContain("'-42");
    });
});
