const fs = require('fs');
const readline = require('readline');
const Sequelize = require('sequelize');

const docPattern = /^\s*<li data-ice="doc">\S*(?:<div data-ice="dirPath" class="nav-dir-path">\S*<\/div>)?<span data-ice="kind" class="kind-(class|interface|typedef)">[CIT]<\/span>\S*<span data-ice="name"><span><a href="(\S+)">(\S+)<\/a><\/span><\/span><\/li>\s*$/i;

const typeMap = {
    class: 'Class',
    interface: 'Interface',
    typedef: 'Type'
};

let objects = [];

let rl = readline.createInterface({
    input: fs.createReadStream('rxjs/index.html', 'utf8'),
    terminal: false
});
rl.on('line', line => {
    let matches = docPattern.exec(line);
    if (matches && matches.length === 4) {
        objects.push({
            type: typeMap[matches[1]],
            path: `rxjs/${matches[2]}`,
            name: matches[3]
        });
    }
});

let seq = new Sequelize('database', 'username', 'password', {
    dialect: 'sqlite',
    storage: 'Contents/Resources/docSet.dsidx'
});
let SearchIndex = seq.define('searchIndex', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },
    path: {
        type: Sequelize.STRING
    }
}, {
    freezeTableName: true,
    timestamps: false
});
SearchIndex.sync().then(() => objects.map(item => SearchIndex.build(item).save()));
