import PropTypes from "prop-types";

const StatCard = ({ title, value, icon, bgColor }) => {
  

  return (
    <div className={`${bgColor} rounded-lg shadow-md p-6`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-gray-600 text-sm">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white shadow-sm">{icon}</div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.element.isRequired,
  bgColor: PropTypes.string.isRequired,
};

export default StatCard;
