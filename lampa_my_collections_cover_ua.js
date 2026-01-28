(function () {

    if (typeof Lampa === 'undefined') return;

    const KEY = 'lampa_collections_v2';

    function load() {
        try {
            return JSON.parse(localStorage.getItem(KEY)) || {};
        } catch (e) {
            return {};
        }
    }

    function save(data) {
        localStorage.setItem(KEY, JSON.stringify(data));
    }

    function addMovie(movie) {
        const collections = load();
        const name = prompt('Назва колекції');
        if (!name) return;

        collections[name] = collections[name] || { cover: null, movies: [] };

        if (collections[name].movies.find(m => m.id === movie.id)) {
            Lampa.Noty.show('Фільм уже є');
            return;
        }

        const data = {
            id: movie.id,
            title: movie.title,
            poster: movie.poster
        };

        collections[name].movies.push(data);
        if (!collections[name].cover) collections[name].cover = movie.poster;

        save(collections);
        Lampa.Noty.show('Додано до колекції');
    }

    function openCollections() {
        const collections = load();

        const items = Object.keys(collections).map(name => ({
            title: '⭐ ' + name,
            subtitle: collections[name].movies.length + ' фільмів',
            poster: collections[name].cover,
            onClick: () => openCollection(name)
        }));

        Lampa.Activity.push({
            component: 'list',
            title: 'Мої колекції',
            items,
            onBack: () => Lampa.Activity.pop()
        });
    }

    function openCollection(name) {
        const collections = load();
        const movies = collections[name].movies;

        const items = movies.map((m, i) => ({
            title: m.title,
            poster: m.poster,
            onClick: () => Lampa.Activity.push({
                component: 'full',
                data: m
            }),
            onContext: () => {
                movies.splice(i, 1);
                save(collections);
                Lampa.Noty.show('Видалено');
                openCollection(name);
            }
        }));

        Lampa.Activity.push({
            component: 'list',
            title: name,
            items,
            onBack: () => Lampa.Activity.pop()
        });
    }

    /* ====== КНОПКА В КАРТЦІ ФІЛЬМУ ====== */
    Lampa.Listener.follow('full', function (e) {
        if (e.type === 'build' && e.object && e.object.menu) {
            e.object.menu.append({
                title: '➕ У колекцію',
                onClick: () => addMovie(e.object.data)
            });
        }
    });

    /* ====== КНОПКА В ГОЛОВНОМУ МЕНЮ (2 СПОСОБИ) ====== */
    function addToMenu(e) {
        if (e.type !== 'build') return;

        e.object.items.push({
            title: '⭐ Мої колекції',
            onClick: openCollections
        });
    }

    Lampa.Listener.follow('menu', addToMenu);
    Lampa.Listener.follow('main', addToMenu);

})();
