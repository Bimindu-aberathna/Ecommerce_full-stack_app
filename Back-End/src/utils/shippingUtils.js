//LKR pricing
const shippingPriceIndex = {
    "upTo1kg": 350,
    "OneTo5kg_perKilo": 200,
    "FiveTo10kg_perKilo": 250,
    "else_perKilo": 250 //Need to send a lorry
};


const getShippingCost = (apiData) => {
    let weight = 0;
    if(apiData.items && apiData.items.length > 0) {
        for (const item of apiData.items) {
            const itemWeight = item.productVariety?.product?.weight || 0;
            weight += itemWeight * item.quantity;
        }
    }
    
    if (weight <= 1) {
        return shippingPriceIndex.upTo1kg;
    } else if (weight <= 5) {
        const price = shippingPriceIndex.upTo1kg + shippingPriceIndex.OneTo5kg_perKilo * (weight - 1);
        return price;
    } else if (weight <= 10) {
        const price = shippingPriceIndex.upTo1kg + shippingPriceIndex.OneTo5kg_perKilo * 4 + shippingPriceIndex.FiveTo10kg_perKilo * (weight - 5);
        return price;
    } else {
        return shippingPriceIndex.else_perKilo * weight;
    }
};

module.exports = { getShippingCost };