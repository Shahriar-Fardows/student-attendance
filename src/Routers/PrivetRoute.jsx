
import PropTypes from 'prop-types';
import useAuthContext from '../Auth/Context/useAuthContext';
import { Contexts } from '../Auth/Context/Context';
import { Navigate } from 'react-router-dom';

const PrivetRoute = ({ children }) => {

    const { user } = useAuthContext(Contexts);

    if (user) {
        return children;
    }
    return (
        <Navigate to="/login" />
    );
};

PrivetRoute.propTypes = {
    children: PropTypes.node.isRequired,
};

export default PrivetRoute;

