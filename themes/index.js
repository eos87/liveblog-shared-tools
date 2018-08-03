const path = require('path');
const { FileSystemLoader } = require('nunjucks');
const { PrefixLoader, ChoiceLoader } = require('../template/loaders');
const { buildThemePath } = require('./utils');

const CWD = process.cwd();


/**
 * Recursive function that looks for parent themes and their templates paths
 * @param {object} theme Theme json data extracted from theme.json file
 * @return {array}
 */
const buildParentPaths = (theme, paths) => {
  const themePath = buildThemePath(theme.name);
  const templatesPath = path.resolve(themePath, 'templates/');

  paths.push(templatesPath);

  if (theme.extends) {
    const parentThemePath = buildThemePath(theme.extends);
    const parentTheme = require(`${parentThemePath}/theme.json`);

    buildParentPaths(parentTheme, paths);
  }

  return paths;
}

class ThemeTemplatesLoader extends ChoiceLoader {
    /**
     * A Mixed logic template loader module. It's based on our python CompiledThemeTemplateLoader
     * This will use a combination of `FileSystemLoader` and our custom `PrefixLoader`
     * `ChoiceLoader` in order to access parent theme templates like what nunjucks `PrefixLoader`
     * module does. It will also fallback on default templates/ directory of both themes (current and parent)
     *
     * @param {JSON} theme Theme json data extracted from theme.json file
     */
    constructor(theme, delimiter = '/') {
      super();

      this.loaders = [];
      this.delimiter = delimiter;
      this.prefixMappings = {};

      const themePath = path.resolve(`${CWD}`);
      let self = this;

      const handleNestedLevels = (theme, themePath) => {
        const themeTemplatesPath = path.resolve(themePath, 'templates/');

        // default theme `templates/` folder
        self.loaders.push(new FileSystemLoader(themeTemplatesPath));

        if (theme.extends) {
          const prefix = theme.extends;
          const parentThemePath = buildThemePath(prefix);
          const parentTheme = require(`${parentThemePath}/theme.json`);

          let compoundPaths = [];
          compoundPaths = buildParentPaths(parentTheme, compoundPaths)

          self.prefixMappings[prefix] = new FileSystemLoader(compoundPaths);

          //keep looking for parents prefixes
          handleNestedLevels(parentTheme, parentThemePath)
        }
      }

      // populate the prefix map
      handleNestedLevels(theme, themePath);

      // then create the prefixLoader instance and append it to loaders
      self.loaders.push(new PrefixLoader(self.prefixMappings), delimiter);
    }
}


module.exports = { ThemeTemplatesLoader }
