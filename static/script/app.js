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

class ProductRepository {
    static #KEY = "products";

    /**
     * @returns {Product[]}
     */
    getAll() {
        return JSON.parse(localStorage.getItem(ProductRepository.#KEY) ?? "[]");
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

const productRepository = new ProductRepository();

const productTemplate = `
<li class="product" data-id="{{ID}}">
    <img src="{{IMG}}">
    <div>
        <h2 class="title">{{TITLE}}</h2>
        <div>
            <h3 class="price">{{PRICE}}</h3>
            <h4 class="old-price">{{OLD_PRICE}}</h4>
        </div>
        <div>
            <button class="add-product">ДОБАВИТЬ В КОРЗИНИУ</button>
            
            <div>
                <button class="add-product">+</button>
                <span class="counter">{{COUNT}}</span>
                <button class="remove-product">-</button>
            </div>
        </div>
    </div>
</li>
`

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

function render() {
    const rawProducts = document.getElementById("products");

    const allProducts = productRepository.getAll();

    for (const product of allProducts) {
        const price = product.discount
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;

        const rawProduct = productTemplate
            .replace("{{ID}}", product.id)
            .replace("{{IMG}}", product.thumbnailUrl)
            .replace("{{TITLE}}", product.name)
            .replace("{{PRICE}}", price)
            .replace("{{OLD_PRICE}}", product.discount ? product.price : "");

        rawProducts.innerHTML += rawProduct;
    }
}

seed();
render();