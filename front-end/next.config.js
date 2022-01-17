/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // https://stackoverflow.com/questions/65487914/error-image-optimization-using-next-js-default-loader-is-not-compatible-with-n
    loader: 'akamai',
    path: '',
  },
  reactStrictMode: true,
}

module.exports = nextConfig
