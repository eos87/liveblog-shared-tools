const { Loader } = require('nunjucks');

/**
 * A loader that is passed a dict of loaders where each loader is bound
 * to a prefix.  The prefix is delimited from the template by a slash per
 * default, which can be changed by setting the `delimiter` argument to
 * something else
 *
 * let loader = new PrefixLoader({
 *      'prefix': new FileSystemLoader('/path/to/user/templates'),
 *      'theme_prefix': new FileSystemLoader('/path/to/templates')
 * })
 *
 * By loading ``'prefix/index.html'`` the file from the `prefix` loader
 *
 * @extends Loader
 */
class PrefixLoader extends Loader {

    /**
     * @param {Object} mappings Key-Value object with all available loaders
     * @param {String} [delimiter='/'] Template name delimiter. Default to: '/'
     */
    constructor(mappings, delimiter='/') {
        super();

        this.mappings = mappings;
        this.delimiter = delimiter;
    }

    getLoader(template) {
        const [prefix, name] = template.split(this.delimiter);
        const loader = this.mappings[prefix];

        if (typeof prefix === 'undefined')
            return null;

        return loader;
    }

    getSource(name) {
        const loader = this.getLoader(name);
        return loader.getSource(name);
    }
}


/**
 * This loader works like the `PrefixLoader` just that no prefix is
 * specified.  If a template could not be found by one loader the next one
 * is tried.
 *
 * loader = new ChoiceLoader([
 *     new FileSystemLoader('/path/to/user/templates'),
 *     new FileSystemLoader('/path/to/system/templates')
 * ])
 *
 * @extends Loader
 */
class ChoiceLoader extends Loader {

    /**
     * @param {Array} loaders Array of loaders to be tried
     */
    constructor(loaders) {
        super();
        this.loaders = loaders;
    }

    getSource(template) {
        for (let loader of this.loaders) {
            source = loader.getSource(template)

            if (source) return source;
        }

        return null;
    }
}

module.exports = {
    PrefixLoader: PrefixLoader,
    ChoiceLoader: ChoiceLoader
}
