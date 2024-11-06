import React from 'react';

import './Card.scss';

// Parent component
// src/user/components/UsersList.js
// src/user/components/UsersItem.js
const Card = (props) => {
  return (
    <div className={`card ${props.className}`} style={props.style}>
      {props.children}
    </div>
  );
};

export default Card;
