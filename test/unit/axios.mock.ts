export = {
  CancelToken: {
    source: jest.fn(() => {
      return {
        token: 'TOKEN',
      };
    }),
  },
  post: jest.fn(),
};
