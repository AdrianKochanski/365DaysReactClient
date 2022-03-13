import React, { useEffect, useState } from 'react';
import propTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import * as actions from '../actions/index';
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
        }, 3000);
    }

    useEffect(() => {
        if(alertMessage) {
            showAllert(alertMessage);
        }
    }, [alertMessage]);
    
    return (
        <div hidden={alerts.hidden} style={{position: 'absolute', left: '50%', zIndex: '10', top: '35px', minWidth: '300px'}}>
            <Alert style={{position: 'relative', left: '-50%', textAlign: 'center'}} variant={alerts.variant}>
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