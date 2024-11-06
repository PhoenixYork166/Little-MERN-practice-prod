import React, { useEffect, useState } from 'react';

import UsersList from '../components/UsersList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const Users = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = () => {

      const devFetchUserUrl = `http://localhost:3011/api/users`;
      const prodFetchUserUrl = `https://little-mern-nodejs-mongodb.onrender.com/api/users`;
      const fetchUserUrl = process.env.NODE_ENV === 'production' ? prodFetchUserUrl : devFetchUserUrl
      
      sendRequest(fetchUserUrl)
      .then((response) => {
        if (response) {
          setLoadedUsers(response.users);
        }
      })
      .catch((err) => {
        console.error(`\nError in fetching users: ${err}\n`);
        throw err;
      });
    };

    fetchUsers();
  }, [sendRequest]);

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedUsers && <UsersList items={loadedUsers} />}
    </React.Fragment>
  );
};

export default Users;
