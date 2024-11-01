import React from 'react';

import Modal from './Modal';
import Button from '../FormElements/Button';

// Parent component
// src/user/pages/Auth.js
// src/places/pages/UpdatePlace.js
// src/places/pages/UserPlaces.js
// src/places/pages/NewPlace.js
const ErrorModal = (props) => {
  return (
    <Modal
      onCancel={props.onClear}
      header="An Error Occurred!"
      show={!!props.error}
      footer={<Button onClick={props.onClear}>Okay</Button>}
    >
      <p>{props.error}</p>
    </Modal>
  );
};

export default ErrorModal;
