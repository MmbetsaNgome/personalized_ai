import React from "react";
import PropTypes from "prop-types";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Notification container component
const Notification = () => (
  <ToastContainer
    position="bottom-center"
    autoClose={5000}
    hideProgressBar
    newestOnTop
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable={false}
    pauseOnHover
  />
);

// Notification message components
const NotificationSuccess = ({ text }) => (
  <div>
    <i className="bi bi-check-circle-fill text-success mx-2" />
    <span className="text-secondary mx-1">{text}</span>
  </div>
);

const NotificationError = ({ text }) => (
  <div>
    <i className="bi bi-x-circle-fill text-danger mx-2" />
    <span className="text-secondary mx-1">{text}</span>
  </div>
);

// Prop types for the notification messages
const props = {
  text: PropTypes.string,
};

// Default props for the notification messages
const defaultProps = {
  text: "",
};

NotificationSuccess.propTypes = props;
NotificationSuccess.defaultProps = defaultProps;

NotificationError.propTypes = props;
NotificationError.defaultProps = defaultProps;

// Exporting the components
export { Notification, NotificationSuccess, NotificationError, toast };
