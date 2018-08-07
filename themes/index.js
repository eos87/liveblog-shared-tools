const path = require('path');
const { FileSystemLoader } = require('nunjucks');
const { PrefixLoader, ChoiceLoader } = require('../template/loaders');
const { themeDependencyPath } = require('./utils');

const CWD = process.cwd();


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

      let self = this;
      this.loaders = [];
      this.delimiter = delimiter;
      this.prefixMappings = {};

      const themePath = path.resolve(`${CWD}`);

      const handleNestedLevels = (theme, themePath) => {
        // default theme `templates/` folder
        const themeTemplatesPath = path.resolve(themePath, 'templates/');
        self.loaders.push(new FileSystemLoader(themeTemplatesPath));

        if (theme.extends) {
          const prefix = theme.extends;
          const parentThemePath = themeDependencyPath(prefix);
          const parentTheme = require(`${parentThemePath}/theme.json`);

          self.prefixMappings[prefix] = new FileSystemLoader(path.resolve(parentThemePath, 'templates/'));

          // keep looking for parents prefixes
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
