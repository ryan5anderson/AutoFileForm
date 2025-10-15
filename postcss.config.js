module.exports = {
  plugins: [
    require('postcss-custom-media')({
      // Enable custom media queries for CSS Modules
      preserve: false,
      importFrom: [
        'src/styles/tokens.css'
      ]
    }),
    require('autoprefixer'),
  ],
};