interface ImageData {
    uid: string;
    id: string;
    imageUrl: string;
    name: string;
    level: number;
    type: string;
    color: string;
    subColor: string;
    ap: number;
    lp: string;
    categories: string[];
    productName: string;
    rarity: string;
}

const productNameOrder = ['CT-P01', 'CT-D01', 'CT-D02', 'CT-D03', 'CT-D04', 'CT-D05', 'PR'];
const colorOrder = ['blue', 'green', 'white', 'red', 'yellow', 'black'];
const typeOrder = ['partner', 'character', 'event', 'case'];
const rarityOrder = ['SR', 'SRP', 'R', 'RP', 'C', 'CP'];

const sortImages = (images: ImageData[]) => {
    return images.sort((a, b) => {
        const productNameA = productNameOrder.indexOf(a.productName);
        const productNameB = productNameOrder.indexOf(b.productName);

        if (productNameA !== productNameB) {
            return productNameA - productNameB;
        }

        const colorA = colorOrder.indexOf(a.color);
        const colorB = colorOrder.indexOf(b.color);

        if (colorA !== colorB) {
            return colorA - colorB;
        }

        const typeA = typeOrder.indexOf(a.type);
        const typeB = typeOrder.indexOf(b.type);

        if (typeA !== typeB) {
            return typeA - typeB;
        }

        const extractIdNumber = (id: string) => parseInt(id.replace(/^P/, ''), 10);

        const idA = extractIdNumber(a.id);
        const idB = extractIdNumber(b.id);

        if (idA !== idB) {
            return idA - idB;
        }

        const rarityA = rarityOrder.indexOf(a.rarity);
        const rarityB = rarityOrder.indexOf(b.rarity);

        return rarityA - rarityB;
    });
};

export { sortImages };