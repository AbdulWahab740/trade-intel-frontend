// import PropTypes from 'prop-types';
// import { Filter } from 'lucide-react';

// function CategorySelector({ categories, selected, onChange }) {
//   if (!categories || categories.length === 0) {
//     return null;
//   }

//   // Ensure 'all' is always the first option
//   const allCategories = ['all', ...categories.filter(cat => cat !== 'all')];

//   return (
//     <div className="card">
//       <div className="flex items-center mb-4">
//         <Filter className="w-5 h-5 text-gray-600 mr-2" />
//         <h3 className="text-lg font-semibold text-gray-900">Explore Categories</h3>
//       </div>
//       <div className="flex flex-wrap gap-3">
//         {allCategories.map(category => (
//           <button
//             key={category}
//             onClick={() => onChange(category)}
//             className={`px-4 py-2 rounded-full font-medium transition transform duration-150 shadow-sm ${
//               selected === category
//                 ? 'bg-gradient-to-r from-green-500 to-green-600 text-white scale-105'
//                 : 'bg-white text-gray-700 hover:shadow-md hover:-translate-y-0.5'
//             }`}
//           >
//             {category === 'all' ? 'All Categories' : category}
//           </button>
//         ))}
//       </div>
//     </div>
//   );
// }

// CategorySelector.propTypes = {
//   categories: PropTypes.arrayOf(PropTypes.string).isRequired,
//   selected: PropTypes.string.isRequired,
//   onChange: PropTypes.func.isRequired,
// };

// CategorySelector.defaultProps = {
//   selected: 'all',
// };

// export default CategorySelector;