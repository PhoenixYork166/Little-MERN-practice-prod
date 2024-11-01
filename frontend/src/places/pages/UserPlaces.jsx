import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import PlaceList from '../components/PlaceList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  const userId = useParams().userId;

  const devFetchUserPlaceUrl = `http://localhost:3011/api/places/user/${userId}`;
    const prodFetchUserPlaceUrl = `https://little-mern-backend.onrender.com/api/places/user/${userId}`;

    const fetchPlaceUrl = process.env.NODE_ENV === 'production' ? prodFetchUserPlaceUrl : devFetchUserPlaceUrl;

  useEffect(() => {   

    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(fetchPlaceUrl);

        setLoadedPlaces(responseData.places);
      } catch (err) {}
    };
    fetchPlaces();

  }, [sendRequest, userId, fetchPlaceUrl]);

  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      {/* Forwarding error from this component to <ErrorModal/> */}
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList items={loadedPlaces} onDeletePlace={placeDeletedHandler} />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;
