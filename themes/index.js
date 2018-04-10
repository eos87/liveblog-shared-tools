const path = require('path');
const {FileSystemLoader} = require('nunjucks');
const {PrefixLoader, ChoiceLoader} = require('../template/loaders');


class ThemeTemplatesLoader extends ChoiceLoader {
    /**
     * A Mixed logic template loader module. It's based on our python CompiledThemeTemplateLoader
     * This will use a combination of `FileSystemLoader` and our custom `PrefixLoader`
     * `ChoiceLoader` in order to access parent theme templates like what nunjucks `PrefixLoader`
     * module does. It will also fallback on default templates/ directory of both themes (current and parent)
     *
     * @param {JSON} theme Theme json data extracted from theme.json file
     */
    constructor(theme) {
        super([]);

        this.loaders = [];

        const CWD = process.cwd();
        const themePath = path.resolve(`${CWD}`);
        const themeTemplatesPath = path.resolve(themePath, 'templates');

        // default theme `templates/` folder
        this.loaders.push(new FileSystemLoader(themeTemplatesPath));

        // theme root directory as fallback
        this.loaders.push(new FileSystemLoader(themePath));

        if (theme.extends) {
            const parentThemePath = path.resolve(`${CWD}/node_modules/liveblog-${theme.extends}-theme/`);
            const parentTemplatesPath = path.resolve(parentThemePath, 'templates');
            let mappings = {};

            mappings[`${theme.extends}`] = new FileSystemLoader(themeTemplatesPath);
            let parentLoader = new PrefixLoader(mappings);

            // parent theme root directory as fallback
            this.loaders.push(new FileSystemLoader(themePath));

            this.loaders.push(parentLoader);
            // TODO: add support for another level of parent inheritance (parent of parent)
        }
    }
}


module.exports = {
    ThemeTemplatesLoader: ThemeTemplatesLoader
}
