const CWD = process.cwd();

const buildThemePath = (themeName) => {
  // TODO: add condition to check if system theme
  return `${CWD}/node_modules/liveblog-${themeName}-theme/`;
}

module.exports = { buildThemePath }
