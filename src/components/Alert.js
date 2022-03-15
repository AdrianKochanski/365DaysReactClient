import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
import './Aler.css';
import { Alert } from 'react-bootstrap';

function CustomAlert({alertMessage}) {
    const [alerts, setAlerts] = useState({
        hidden: true,
        variant: "primary",
        message: "Message"
    });
    
    const showAllert = ({variant, message}) => {
        if(!message || !variant) return;

        setAlerts({
            hidden: false,
            variant: variant,
            message: message
        });

        setTimeout(function() {
            setAlerts({
            hidden: true,
            variant: variant,
            message: message
            });
        }, 4000);
    }

    useEffect(() => {
        if(alertMessage) {
            showAllert(alertMessage);
        }
    }, [alertMessage]);
    
    return (
        <div className='alert-position slide-top-fade-out' hidden={alerts.hidden}>
            <Alert className='alert-align' variant={alerts.variant}>
                {alerts.message}
            </Alert>
        </div>
    )
}

CustomAlert.propTypes = {
    alertMessage: propTypes.object
};

function mapStateToProps(state) {
  return {
    alertMessage: state.contracts.alertMessage
  };
}

export default compose(
  connect(mapStateToProps, actions)
)(CustomAlert);