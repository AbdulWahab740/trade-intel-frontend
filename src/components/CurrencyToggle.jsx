import PropTypes from 'prop-types';
import { DollarSign } from 'lucide-react';

const CURRENCIES = ['PKR', 'USD'];
function CurrencyToggle({ currency, onChange }) {
  const currentCurrency = CURRENCIES.includes(currency) ? currency : CURRENCIES[0];
  
  const handleChange = (newCurrency) => {
    if (CURRENCIES.includes(newCurrency)) {
      onChange(newCurrency);
    }
  };

  return (
    <div className="inline-flex items-center bg-white rounded-full shadow-sm p-1"> 
      <div className="px-3 text-gray-500 flex items-center">
        {currentCurrency === "PKR" ? (
          <span className="font-semibold text-sm">Rs</span>
        ) : (
          <DollarSign className="w-4 h-4" />
        )}
      </div>

      {CURRENCIES.map(curr => (
        <button
          key={curr}
          onClick={() => handleChange(curr)}
          className={`px-3 py-1 rounded-full font-medium transition duration-150 ${
            currentCurrency === curr
              ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {curr}
        </button>
      ))}
    </div>
  );
}

CurrencyToggle.propTypes = {
  currency: PropTypes.oneOf(CURRENCIES).isRequired,
  onChange: PropTypes.func.isRequired,
};

CurrencyToggle.defaultProps = {
  currency: 'PKR',
};

export default CurrencyToggle;