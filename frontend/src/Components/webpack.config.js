module.exports = {
    // ... other configurations
    module: {
      rules: [
        {
          test: /\.svg$/,
          loader: 'url-loader',
          options: {
            limit: 10000, // Inline SVGs below this size
            name: '[name].[ext]', // Output filename format
          },
        },
        // ... other rules
      ],
    },
    // ... other configurations
  };
  