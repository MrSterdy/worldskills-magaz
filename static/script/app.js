/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} thumbnailUrl
 * @property {string} name
 * @property {number} price
 * @property {number|null} discount
 * @property {number} ram
 * @property {number} storage
 * @property {string} manufacturer
 */

/**
 * @typedef {Object} CartEntry
 * @property {string} productId
 * @property {number} amount
 */

class ProductRepository {
    static #KEY = "products";

    /**
     * @returns {Product[]}
     */
    getAll() {
        return JSON.parse(localStorage.getItem(ProductRepository.#KEY) ?? "[]");
    }

    /**
     * @param {string} id
     * @returns {Product}|null}
     */
    getById(id) {
        return this.getAll().find(p => p.id === id) ?? null;
    }

    clear() {
        localStorage.removeItem(ProductRepository.#KEY);
    }

    /**
     * @param {Product} product
     */
    add(product) {
        const products = this.getAll();

        if (products.some(p => product.id === p.id)) {
            return;
        }

        products.push(product);

        localStorage.setItem(ProductRepository.#KEY, JSON.stringify(products));
    }
}

class CartRepository {
    static #KEY = "cart";

    /**
     * @returns {CartEntry[]}
     */
    getAll() {
        return JSON.parse(localStorage.getItem(CartRepository.#KEY) ?? "[]");
    }

    /**
     * @param {string} productId
     * @returns {CartEntry|null}
     */
    getByProductId(productId) {
        return this.getAll().find(p => p.productId === productId) ?? null;
    }

    /**
     * @param {string} productId
     */
    add(productId) {
        const entries = this.getAll();
        const index = entries.findIndex(e => e.productId === productId);
        if (index === -1) {
            entries.push({ productId, amount: 1 });
        } else {
            entries[index].amount++;
        }
        localStorage.setItem(CartRepository.#KEY, JSON.stringify(entries));
    }

    /**
     * @param {string} productId
     */
    remove(productId) {
        const entries = this.getAll();
        const index = entries.findIndex(e => e.productId === productId);
        if (index !== -1) {
            const entry = entries[index];
            if (entry.amount <= 1) {
                entries.splice(index, 1);
            } else {
                entry.amount--;
            }
            localStorage.setItem(CartRepository.#KEY, JSON.stringify(entries));
        }
    }
}

const productRepository = new ProductRepository();
const cartRepository = new CartRepository();

const productTemplate = `
<li class="product" data-id="{{ID}}" data-in-cart="{{IN_CART}}">
    <img src="{{IMG}}">
    <div class="product-info">
        <h2 class="title">{{TITLE}}</h2>
        <div class="price-info">
            <h3 class="price">{{PRICE}}</h3>
            <h4 class="old-price">{{OLD_PRICE}}</h4>
        </div>
        <div class="product-actions">
            <button class="add-product add-product-main">ДОБАВИТЬ В КОРЗИНУ</button>
            
            <div class="add-product-counter">
                <button class="add-product">+</button>
                <span class="counter">{{COUNT}}</span>
                <button class="remove-product">-</button>
            </div>
        </div>
    </div>
</li>
`;

const manufacturerTemplate = `
    <li>
        <label>
            {{MANUFACTURER}}
            <input type="checkbox" name="manufacturer" value="{{MANUFACTURER}}">
        </label>
    </li>
`;

const cartProductsTemplate = `
    <ul id="cart-items" data-empty="{{EMPTY}}">
        {{ITEMS}}
    </ul>
    <button type="button" id="buy-button">Купить за {{PRICE}} р.</button>
`;

function seed() {
    /** @type Product */
    const first = {
        id: "1",
        name: "Смартфон DEXP A440 8 ГБ розовый",
        thumbnailUrl: "./static/images/1.jpg",
        price: 3200,
        discount: null,
        ram: 1,
        storage: 8,
        manufacturer: "DEXP"
    };

    /** @type Product */
    const second = {
        id: "2",
        name: "Samsung Galaxy M52",
        thumbnailUrl: "./static/images/2.jpg",
        price: 40999,
        discount: 4,
        ram: 6,
        storage: 256,
        manufacturer: "Samsung"
    };

    /** @type Product */
    const third = {
        id: "3",
        name: "Смартфон POCO F3 Черный",
        thumbnailUrl: "./static/images/3.jpg",
        price: 32999,
        discount: null,
        ram: 6,
        storage: 128,
        manufacturer: "POCO"
    };

    /** @type Product */
    const fourth = {
        id: "4",
        name: "Смартфон POCO F3 Белый",
        thumbnailUrl: "./static/images/4.jpg",
        price: 34999,
        discount: 6,
        ram: 6,
        storage: 128,
        manufacturer: "POCO"
    };

    productRepository.add(first);
    productRepository.add(second);
    productRepository.add(third);
    productRepository.add(fourth);
}

const query = new URLSearchParams(location.search);
const search = query.get("search") ?? "";
const priceSort = query.get("price-sort") ?? "descending";
const minPrice = isNaN(parseInt(query.get("min-price")))
    ? Math.min(...productRepository.getAll().map(p => p.price))
    : parseInt(query.get("min-price"));
const maxPrice = isNaN(parseInt(query.get("max-price")))
    ? Math.max(...productRepository.getAll().map(p => p.price))
    : parseInt(query.get("max-price"));
const minRam = isNaN(parseInt(query.get("min-ram")))
    ? Math.min(...productRepository.getAll().map(p => p.ram))
    : parseInt(query.get("min-ram"));
const maxRam = isNaN(parseInt(query.get("max-ram")))
    ? Math.max(...productRepository.getAll().map(p => p.ram))
    : parseInt(query.get("max-ram"));
const minStorage = isNaN(parseInt(query.get("min-storage")))
    ? Math.min(...productRepository.getAll().map(p => p.storage))
    : parseInt(query.get("min-storage"));
const maxStorage = isNaN(parseInt(query.get("max-storage")))
    ? Math.max(...productRepository.getAll().map(p => p.storage))
    : parseInt(query.get("max-storage"));
const manufacturers = query.getAll("manufacturer").length
    ? query.getAll("manufacturer")
    : Array.from(new Set(productRepository.getAll().map(p => p.manufacturer)));
const discounts = query.has("discounts");

function beforeRender() {
    const rawManufacturers = document.getElementById("manufacturers");
    rawManufacturers.innerHTML = "";

    const allManufacturers = new Set(productRepository.getAll().map(p => p.manufacturer));

    for (const manufacturer of allManufacturers) {
        const rawManufacturer = manufacturerTemplate
            .replaceAll("{{MANUFACTURER}}", manufacturer);
        rawManufacturers.innerHTML += rawManufacturer;
    }

    for (const manufacturer of allManufacturers) {
        if (manufacturers.includes(manufacturer)) {
            rawManufacturers.querySelector(`input[name="manufacturer"][value="${manufacturer}"]`).checked = true;
        }
    }

    document.getElementById("cart").addEventListener("click", function () {
        this.nextElementSibling.showModal();
    });
    document.getElementById("cart-close").addEventListener("click", function () {
        this.closest("dialog").close();
    });
    document.getElementById("clear-filters").addEventListener("click", () =>
       location.href = location.pathname
    );

    document.querySelector(`select[name="price-sort"] option[value="${priceSort}"]`).selected = true;
    document.querySelector(`input[name="search"]`).value = search;
    document.querySelector(`input[name="min-price"]`).value = minPrice;
    document.querySelector(`input[name="max-price"]`).value = maxPrice;
    document.querySelector(`input[name="min-ram"]`).value = minRam;
    document.querySelector(`input[name="max-ram"]`).value = maxRam;
    document.querySelector(`input[name="min-storage"]`).value = minStorage;
    document.querySelector(`input[name="max-storage"]`).value = maxStorage;
    document.querySelector(`input[name="discounts"]`).checked = discounts;
}

function render() {
    const rawProducts = document.getElementById("products");
    rawProducts.innerHTML = "";

    let allProducts = productRepository.getAll().filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) &&
        p.price >= minPrice && p.price <= maxPrice &&
        p.ram >= minRam && p.ram <= maxRam &&
        p.storage >= minStorage && p.storage <= maxStorage &&
        manufacturers.includes(p.manufacturer)
    );
    if (discounts) {
        allProducts = allProducts.filter(p => p.discount);
    }
    allProducts = allProducts.sort((a, b) => priceSort === "ascending"
        ? a.price - b.price
        : b.price - a.price);

    for (const product of allProducts) {
        const price = product.discount
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;

        const cartEntry = cartRepository.getByProductId(product.id);

        const rawProduct = productTemplate
            .replace("{{ID}}", product.id)
            .replace("{{IMG}}", product.thumbnailUrl)
            .replace("{{TITLE}}", product.name)
            .replace("{{PRICE}}", price + " р.")
            .replace("{{OLD_PRICE}}", product.discount ? product.price + " р." : "")
            .replace("{{COUNT}}", cartEntry?.amount ?? 0)
            .replace("{{IN_CART}}", cartEntry ? "true" : "false");

        rawProducts.innerHTML += rawProduct;
    }

    const rawCartProducts = document.getElementById("products-wrapper");

    const cartProducts = cartRepository.getAll().map(e => [e, productRepository.getById(e.productId)]);

    let items = "";
    let totalPrice = 0;

    for (const [cartEntry, product] of cartProducts) {
        const price = product.discount
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;

        const rawProduct = productTemplate
            .replace("{{ID}}", product.id)
            .replace("{{IMG}}", product.thumbnailUrl)
            .replace("{{TITLE}}", product.name)
            .replace("{{PRICE}}", price + " р.")
            .replace("{{OLD_PRICE}}", product.discount ? product.price + " р." : "")
            .replace("{{COUNT}}", cartEntry.amount)
            .replace("{{IN_CART}}", "true");

        items += rawProduct;
        totalPrice += price * cartEntry.amount;
    }

    rawCartProducts.innerHTML = cartProductsTemplate
        .replace("{{EMPTY}}", items.length === 0)
        .replace("{{ITEMS}}", items)
        .replace("{{PRICE}}", totalPrice);

    Array.from(document.getElementsByClassName("add-product")).forEach(b =>
        b.addEventListener("click", () => {
            const productId = b.closest(".product").getAttribute("data-id");
            cartRepository.add(productId);
            render();
        })
    );

    Array.from(document.getElementsByClassName("remove-product")).forEach(b =>
        b.addEventListener("click", () => {
            const productId = b.closest(".product").getAttribute("data-id");
            cartRepository.remove(productId);
            render();
        })
    );
}

seed();
beforeRender();
render();