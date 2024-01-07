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

render();