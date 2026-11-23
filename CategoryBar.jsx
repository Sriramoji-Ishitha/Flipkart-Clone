import React from "react";

function CategoryBar() {

  const categories = [
    { name: "Mobiles", icon: "📱" },
    { name: "Fashion", icon: "👕" },
    { name: "Electronics", icon: "💻" },
    { name: "Home", icon: "🏠" },
    { name: "Appliances", icon: "🖥️" },
    { name: "Furniture", icon: "🛋️" },
    { name: "Toys", icon: "🧸" },
    { name: "Grocery", icon: "🛒" }
  ];

  return (

    <div className="category-container">

      {categories.map((category, index) => (

        <div className="category-item" key={index}>

          <div className="category-icon">
            {category.icon}
          </div>

          <p>{category.name}</p>

        </div>

      ))}

    </div>

  );
}

export default CategoryBar;