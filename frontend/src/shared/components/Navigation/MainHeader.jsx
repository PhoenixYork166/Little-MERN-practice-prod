import React from 'react';

import '../../../sass/components/_frosted.scss';
import './MainHeader.scss';

const MainHeader = props => {
  return <header className="main-header frosted">{props.children}</header>;
};

export default MainHeader;
