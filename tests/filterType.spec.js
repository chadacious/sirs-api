import axios from 'axios';

describe('filterType resolves', () => {
    test('allFilterTypes', async () => {
        const response = await axios.post('http://localhost:3050/graphql', {
            query: `
            {
                allFilterTypes() {
                    id
                    code
                }
            }
            `,
        });

        const { data } = response;
        expect(data).toMatchObject({
            data: {
                getUserDetail: {
                    id: 1,
                    email: 'VIOLENT_CONTENT',
                },
            },
        });
    });
});
