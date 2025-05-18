import React, { useEffect, useState } from 'react';

const ResponsiveUserName = ({ userName }) => {
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 430) {
        setDisplayName('Admin');
      } else {
        setDisplayName(userName);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [userName]);

  return <span className="user-name">{displayName}</span>;
};

export default ResponsiveUserName;