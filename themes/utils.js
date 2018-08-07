const pathLib = require("path");

const CWD = process.cwd();
const SYSTEM_THEMES = ['default', 'simple', 'amp', 'classic'];


const themeDependencyPath = (themeName) => {
  // TODO: improve in a way to allow having the theme package name instead of guessing the name
  const name = SYSTEM_THEMES.indexOf(themeName) === -1 ? themeName : `liveblog-${themeName}-theme`;
  return `${CWD}/node_modules/${name}/`;
}


/**
 * It check if the given theme has parent theme and loops over ancestors of the theme.
 * It build an array of directories of given theme paths and all it's ancestors
 *
 * @param  {Object} theme     Theme settings extracted normally from JSON file
 * @param  {String} suffix    Folder that might want to be resolved as part of directories
 * @param  {Boolean} flat     If true, return a flat array instead of array of tuples
 * @return {Array}            Array contained resolved directories, either in tuple modes or flat array
 */
const discoverThemePaths = (theme, suffix, flat) => {

  let paths = [];

  const __subBuildAction = (path, theme) => {
    paths.push([theme.name, pathLib.resolve(path, suffix)]);

    if (theme.extends) {
      const parentPath = themeDependencyPath(theme.extends);
      const parentTheme = require(`${parentPath}/theme.json`);
      return __subBuildAction(parentPath, parentTheme);
    }
  }

  const currentThemePath = CWD;
  __subBuildAction(currentThemePath, theme);

  if (flat)
    return paths.map(item => item[1])

  return paths;
}


module.exports = { themeDependencyPath, discoverThemePaths }
