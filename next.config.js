module.exports = {
  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.plugins.push({
        apply(compiler) {
          // Next 12 restores its default devtool before creating the compiler.
          // Set it here so client modules can run under CSP without eval.
          compiler.options.devtool = "cheap-module-source-map";
        },
      });
    }
    return config;
  },
};
