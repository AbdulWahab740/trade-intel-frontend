import { Filter } from 'lucide-react';

function CategorySelector({ categories, selected, onChange }) {
  return (
    <div className="inline-flex items-center bg-white rounded-full shadow-md p-1 border border-gray-200">
      <Filter className="w-4 h-4 text-gray-500 mx-2" />
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange('all')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
            selected === 'all'
              ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          All
        </button>
        {categories.filter(category => category !== 'all').slice(0, 6).map(category => (
          <button
            key={category}
            onClick={() => onChange(category)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-150 ${
              selected === category
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
}

export default CategorySelector;