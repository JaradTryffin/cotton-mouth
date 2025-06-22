export function getCategoryDescription(category: string): string {
    const descriptions: Record<string, string> = {
        "Premium": "High-end cannabis products with premium quality",
        "Premium Special": "Special edition premium products with unique characteristics",
        "Exotic Indoor": "Indoor-grown exotic strains with superior quality",
        "Tunnel": "Budget-friendly options without compromising quality",
        "Gummies": "Cannabis-infused edible gummies in various flavors",
        "Cannagars": "Premium cannabis cigars for special occasions",
        "Vapes": "Vape cartridges and disposable vape products",
        "Papers": "Rolling papers and smoking accessories",
        "Backwoods": "Natural tobacco leaf wraps for rolling",
        "Concentrates": "Cannabis extracts and concentrated products",
        "Accessories": "Cannabis-related tools and accessories",
        "Other": "Miscellaneous cannabis products"
    };

    return descriptions[category] || "Custom product category";
}