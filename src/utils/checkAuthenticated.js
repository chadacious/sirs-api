import chalk from 'chalk';

const createResolver = (resolver) => {
    const baseResolver = resolver;
    baseResolver.createResolver = (childResolver) => {
        const newResolver = async (parent, args, context) => {
            await resolver(parent, args, context);
            return childResolver(parent, args, context);
        };
        return createResolver(newResolver);
    };
    return baseResolver;
};

// requiresAuth This will resolve first to check if the user is authenticated
export default createResolver((parent, args, { user }) => {
    if (!user || !user.id) {
        if (process.env.NODE_ENV !== 'test') {
            throw new Error('Not authenticated');
        } else {
            // eslint-disable-next-line
            console.log(chalk.bgMagenta('CI Testing mode'));
        }
    }
});
